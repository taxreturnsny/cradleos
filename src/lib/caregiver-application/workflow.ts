import type {
  AirtableDataClient,
  AirtableFields,
  AirtableRecord
} from "@/lib/airtable/client";
import type { CradleOsConfig } from "@/lib/cradleos-config";
import type {
  CaregiverApplicationSubmission,
  CaregiverReferenceInput
} from "@/lib/fillout/payload";

type WorkflowResult = {
  status: "processed" | "duplicate";
  caregiverRecordId: string;
  submissionId: string;
  createdReferenceIds: string[];
  completedTaskIds: string[];
  reviewTaskId?: string;
};

export async function processCaregiverApplicationSubmission({
  airtable,
  config,
  submission
}: {
  airtable: AirtableDataClient;
  config: CradleOsConfig;
  submission: CaregiverApplicationSubmission;
}): Promise<WorkflowResult> {
  const { fields } = config.airtable;
  const caregiver = await airtable.getRecord(
    config.airtable.caregiverTableId,
    submission.caregiverRecordId
  );

  if (
    caregiver.fields[fields.caregiverSubmissionId] === submission.submissionId
  ) {
    return {
      status: "duplicate",
      caregiverRecordId: submission.caregiverRecordId,
      submissionId: submission.submissionId,
      createdReferenceIds: [],
      completedTaskIds: []
    };
  }

  const taskRecords = await getLinkedTaskRecords({
    airtable,
    config,
    caregiver
  });
  const createdReferences = await createReferenceRecords({
    airtable,
    config,
    caregiverRecordId: submission.caregiverRecordId,
    references: submission.references
  });

  await updateCaregiverAfterSubmission({
    airtable,
    config,
    caregiver,
    submission,
    createdReferenceIds: createdReferences.map((record) => record.id)
  });

  const completedTaskIds = await completeFollowUpTasks({
    airtable,
    config,
    taskRecords
  });

  const reviewTaskId = await ensureReviewApplicationTask({
    airtable,
    config,
    caregiverRecordId: submission.caregiverRecordId,
    taskRecords
  });

  return {
    status: "processed",
    caregiverRecordId: submission.caregiverRecordId,
    submissionId: submission.submissionId,
    createdReferenceIds: createdReferences.map((record) => record.id),
    completedTaskIds,
    reviewTaskId
  };
}

async function createReferenceRecords({
  airtable,
  config,
  caregiverRecordId,
  references
}: {
  airtable: AirtableDataClient;
  config: CradleOsConfig;
  caregiverRecordId: string;
  references: CaregiverApplicationSubmission["references"];
}) {
  const { fields } = config.airtable;
  const records: AirtableRecord[] = [];

  for (const [index, reference] of references.entries()) {
    if (!hasReferenceDetails(reference)) continue;

    records.push(
      await airtable.createRecord(
        config.airtable.referencesTableId,
        stripUndefined({
          [fields.referenceName]:
            reference.name ?? reference.email ?? `Reference ${index + 1}`,
          [fields.referenceCaregiver]: [caregiverRecordId],
          [fields.referenceEmail]: reference.email,
          [fields.referenceRelationship]: reference.relationship,
          [fields.referenceVerificationStatus]: "Not Started",
          [fields.referenceVerified]: false
        })
      )
    );
  }

  return records;
}

async function updateCaregiverAfterSubmission({
  airtable,
  config,
  caregiver,
  submission,
  createdReferenceIds
}: {
  airtable: AirtableDataClient;
  config: CradleOsConfig;
  caregiver: AirtableRecord;
  submission: CaregiverApplicationSubmission;
  createdReferenceIds: string[];
}) {
  const { fields } = config.airtable;
  const [reference1, reference2] = submission.references;
  const existingReferenceIds = asStringArray(
    caregiver.fields[fields.caregiverReferences]
  );

  await airtable.updateRecord(
    config.airtable.caregiverTableId,
    submission.caregiverRecordId,
    stripUndefined({
      [fields.caregiverSubmissionId]: submission.submissionId,
      [fields.caregiverReferences]: unique([
        ...existingReferenceIds,
        ...createdReferenceIds
      ]),
      [fields.caregiverReference1Name]: reference1.name,
      [fields.caregiverReference1Number]: reference1.phone,
      [fields.caregiverReference1Email]: reference1.email,
      [fields.caregiverReference1Relationship]: reference1.relationship,
      [fields.caregiverReference2Name]: reference2.name,
      [fields.caregiverReference2Number]: reference2.phone,
      [fields.caregiverReference2Email]: reference2.email,
      [fields.caregiverReference2Relationship]: reference2.relationship
    })
  );
}

async function getLinkedTaskRecords({
  airtable,
  config,
  caregiver
}: {
  airtable: AirtableDataClient;
  config: CradleOsConfig;
  caregiver: AirtableRecord;
}) {
  const taskIds = asStringArray(
    caregiver.fields[config.airtable.fields.caregiverTasks]
  );

  return Promise.all(
    taskIds.map((taskId) =>
      airtable.getRecord(config.airtable.tasksTableId, taskId)
    )
  );
}

async function completeFollowUpTasks({
  airtable,
  config,
  taskRecords
}: {
  airtable: AirtableDataClient;
  config: CradleOsConfig;
  taskRecords: AirtableRecord[];
}) {
  const { fields } = config.airtable;
  const followUpTasks = taskRecords.filter(
    (task) =>
      task.fields[fields.taskType] === "Follow Up Application" &&
      task.fields[fields.taskStatus] !== "Done"
  );

  await Promise.all(
    followUpTasks.map((task) =>
      airtable.updateRecord(config.airtable.tasksTableId, task.id, {
        [fields.taskStatus]: "Done"
      })
    )
  );

  return followUpTasks.map((task) => task.id);
}

async function ensureReviewApplicationTask({
  airtable,
  config,
  caregiverRecordId,
  taskRecords
}: {
  airtable: AirtableDataClient;
  config: CradleOsConfig;
  caregiverRecordId: string;
  taskRecords: AirtableRecord[];
}) {
  const { fields } = config.airtable;
  const existingReviewTask = taskRecords.find(
    (task) => task.fields[fields.taskType] === "Review Application"
  );

  if (existingReviewTask) return existingReviewTask.id;

  const createdTask = await airtable.createRecord(config.airtable.tasksTableId, {
    [fields.taskStatus]: "Todo",
    [fields.taskCaregiver]: [caregiverRecordId],
    [fields.taskType]: "Review Application",
    [fields.taskPriority]: "Normal"
  });

  return createdTask.id;
}

function hasReferenceDetails(reference: CaregiverReferenceInput) {
  return Boolean(
    reference.name || reference.phone || reference.email || reference.relationship
  );
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function stripUndefined(fields: AirtableFields) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined)
  );
}
