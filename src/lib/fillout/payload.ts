export type CaregiverReferenceInput = {
  name?: string;
  phone?: string;
  email?: string;
  relationship?: string;
};

export type CaregiverApplicationSubmission = {
  submissionId: string;
  caregiverRecordId: string;
  references: [CaregiverReferenceInput, CaregiverReferenceInput];
};

type FilloutQuestion = {
  id?: string;
  name?: string;
  label?: string;
  value?: unknown;
};

type FilloutPayload = Record<string, unknown> & {
  questions?: FilloutQuestion[];
  urlParameters?: Record<string, unknown>;
};

const submissionIdKeys = ["submissionId", "submission_id", "responseId", "id"];
const caregiverRecordIdKeys = [
  "caregiverRecordId",
  "caregiver_record_id",
  "airtableRecordId",
  "airtable_record_id",
  "recordId",
  "record_id"
];

const referenceQuestionKeys = {
  0: {
    name: ["reference_1_name", "Reference 1 Name", "Reference One Name"],
    phone: ["reference_1_number", "Reference 1 Number", "Reference 1 Phone"],
    email: ["reference_1_email", "Reference 1 Email"],
    relationship: [
      "reference_1_relationship",
      "Reference 1 Relationship",
      "Reference 1 Relationship to Caregiver"
    ]
  },
  1: {
    name: ["reference_2_name", "Reference 2 Name", "Reference Two Name"],
    phone: ["reference_2_number", "Reference 2 Number", "Reference 2 Phone"],
    email: ["reference_2_email", "Reference 2 Email"],
    relationship: [
      "reference_2_relationship",
      "Reference 2 Relationship",
      "Reference 2 Relationship to Caregiver"
    ]
  }
} as const;

export function parseCaregiverApplicationPayload(
  payload: unknown
): CaregiverApplicationSubmission {
  if (!isObject(payload)) {
    throw new Error("Fillout payload must be an object");
  }

  const filloutPayload = payload as FilloutPayload;
  const submissionId = findStringValue(filloutPayload, submissionIdKeys);
  const caregiverRecordId = findStringValue(
    filloutPayload,
    caregiverRecordIdKeys
  );

  if (!submissionId) {
    throw new Error("Fillout payload is missing a submission id");
  }

  if (!caregiverRecordId) {
    throw new Error("Fillout payload is missing a caregiver Airtable record id");
  }

  return {
    submissionId,
    caregiverRecordId,
    references: [
      extractReference(filloutPayload, 0),
      extractReference(filloutPayload, 1)
    ]
  };
}

function extractReference(
  payload: FilloutPayload,
  referenceIndex: 0 | 1
): CaregiverReferenceInput {
  const keys = referenceQuestionKeys[referenceIndex];

  return {
    name: findStringValue(payload, keys.name),
    phone: findStringValue(payload, keys.phone),
    email: findStringValue(payload, keys.email),
    relationship: findStringValue(payload, keys.relationship)
  };
}

function findStringValue(payload: FilloutPayload, keys: readonly string[]) {
  for (const key of keys) {
    const direct = asString(payload[key]);
    if (direct) return direct;

    const parameter = asString(payload.urlParameters?.[key]);
    if (parameter) return parameter;

    const question = payload.questions?.find((candidate) =>
      [candidate.id, candidate.name, candidate.label].some(
        (value) => value?.toLowerCase() === key.toLowerCase()
      )
    );
    const questionValue = asString(question?.value);
    if (questionValue) return questionValue;
  }

  return undefined;
}

function asString(value: unknown) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
