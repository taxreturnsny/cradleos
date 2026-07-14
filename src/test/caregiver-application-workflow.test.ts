import { describe, expect, it } from "vitest";
import type {
  AirtableDataClient,
  AirtableFields,
  AirtableRecord
} from "@/lib/airtable/client";
import type { CradleOsConfig } from "@/lib/cradleos-config";
import { parseCaregiverApplicationPayload } from "@/lib/fillout/payload";
import { processCaregiverApplicationSubmission } from "@/lib/caregiver-application/workflow";

const config: CradleOsConfig = {
  airtable: {
    apiKey: "test",
    baseId: "appnDyYjpnya1CHUy",
    caregiverTableId: "caregivers",
    referencesTableId: "references",
    tasksTableId: "tasks",
    fields: {
      caregiverReferences: "caregiverReferences",
      caregiverTasks: "caregiverTasks",
      caregiverSubmissionId: "caregiverSubmissionId",
      caregiverReference1Name: "caregiverReference1Name",
      caregiverReference1Number: "caregiverReference1Number",
      caregiverReference1Email: "caregiverReference1Email",
      caregiverReference1Relationship: "caregiverReference1Relationship",
      caregiverReference2Name: "caregiverReference2Name",
      caregiverReference2Number: "caregiverReference2Number",
      caregiverReference2Email: "caregiverReference2Email",
      caregiverReference2Relationship: "caregiverReference2Relationship",
      referenceName: "referenceName",
      referenceCaregiver: "referenceCaregiver",
      referenceEmail: "referenceEmail",
      referenceRelationship: "referenceRelationship",
      referenceVerificationStatus: "referenceVerificationStatus",
      referenceVerified: "referenceVerified",
      taskStatus: "taskStatus",
      taskCaregiver: "taskCaregiver",
      taskType: "taskType",
      taskPriority: "taskPriority",
      taskCompletionAction: "taskCompletionAction",
      taskNextType: "taskNextType",
      taskNextPriority: "taskNextPriority"
    }
  },
  fillout: {
    webhookSecret: "secret"
  }
};

describe("parseCaregiverApplicationPayload", () => {
  it("extracts submission, caregiver, and reference answers from Fillout questions", () => {
    const submission = parseCaregiverApplicationPayload({
      submissionId: "sub_123",
      urlParameters: {
        caregiver_record_id: "rec_caregiver"
      },
      questions: [
        { name: "Reference 1 Name", value: "Jane Reference" },
        { name: "Reference 1 Email", value: "jane@example.com" },
        { name: "Reference 1 Relationship", value: "Former employer" },
        { name: "Reference 2 Name", value: "Alex Reference" }
      ]
    });

    expect(submission).toEqual({
      submissionId: "sub_123",
      caregiverRecordId: "rec_caregiver",
      references: [
        {
          name: "Jane Reference",
          email: "jane@example.com",
          relationship: "Former employer",
          phone: undefined
        },
        {
          name: "Alex Reference",
          email: undefined,
          relationship: undefined,
          phone: undefined
        }
      ]
    });
  });
});

describe("processCaregiverApplicationSubmission", () => {
  it("updates caregiver, creates references, completes follow-up, and creates review task", async () => {
    const airtable = new FakeAirtableClient({
      caregivers: {
        rec_caregiver: {
          id: "rec_caregiver",
          fields: {
            caregiverReferences: ["rec_existing_reference"],
            caregiverTasks: ["rec_follow_up"]
          }
        }
      },
      tasks: {
        rec_follow_up: {
          id: "rec_follow_up",
          fields: {
            taskType: "Follow Up Application",
            taskStatus: "Todo"
          }
        }
      },
      references: {}
    });

    const result = await processCaregiverApplicationSubmission({
      airtable,
      config,
      submission: {
        submissionId: "sub_123",
        caregiverRecordId: "rec_caregiver",
        references: [
          {
            name: "Jane Reference",
            email: "jane@example.com",
            relationship: "Former employer"
          },
          {
            name: "Alex Reference",
            phone: "555-0100"
          }
        ]
      }
    });

    expect(result.status).toBe("processed");
    expect(result.createdReferenceIds).toHaveLength(2);
    expect(result.completedTaskIds).toEqual(["rec_follow_up"]);
    expect(result.reviewTaskId).toBe("rec_tasks_1");
    expect(airtable.tables.caregivers.rec_caregiver.fields).toMatchObject({
      caregiverSubmissionId: "sub_123",
      caregiverReferences: [
        "rec_existing_reference",
        "rec_references_1",
        "rec_references_2"
      ],
      caregiverReference1Name: "Jane Reference",
      caregiverReference2Number: "555-0100"
    });
    expect(airtable.tables.tasks.rec_follow_up.fields.taskStatus).toBe("Done");
    expect(airtable.tables.tasks.rec_tasks_1.fields).toMatchObject({
      taskStatus: "Todo",
      taskType: "Review Application",
      taskPriority: "Normal",
      taskCaregiver: ["rec_caregiver"]
    });
  });

  it("does not process duplicate submissions", async () => {
    const airtable = new FakeAirtableClient({
      caregivers: {
        rec_caregiver: {
          id: "rec_caregiver",
          fields: {
            caregiverSubmissionId: "sub_123",
            caregiverTasks: ["rec_follow_up"]
          }
        }
      },
      tasks: {
        rec_follow_up: {
          id: "rec_follow_up",
          fields: {
            taskType: "Follow Up Application",
            taskStatus: "Todo"
          }
        }
      },
      references: {}
    });

    const result = await processCaregiverApplicationSubmission({
      airtable,
      config,
      submission: {
        submissionId: "sub_123",
        caregiverRecordId: "rec_caregiver",
        references: [{ name: "Jane Reference" }, {}]
      }
    });

    expect(result.status).toBe("duplicate");
    expect(airtable.createCalls).toHaveLength(0);
    expect(airtable.updateCalls).toHaveLength(0);
  });
});

type TableStore = Record<string, Record<string, AirtableRecord>>;

class FakeAirtableClient implements AirtableDataClient {
  readonly createCalls: unknown[] = [];
  readonly updateCalls: unknown[] = [];
  private readonly createCounts: Record<string, number> = {};

  constructor(readonly tables: TableStore) {}

  async getRecord<TFields extends AirtableFields>(tableId: string, recordId: string) {
    const record = this.tables[tableId]?.[recordId];
    if (!record) throw new Error(`Missing record ${tableId}/${recordId}`);
    return record as AirtableRecord<TFields>;
  }

  async updateRecord<TFields extends AirtableFields>(
    tableId: string,
    recordId: string,
    fields: Partial<TFields>
  ) {
    this.updateCalls.push({ tableId, recordId, fields });
    const record = await this.getRecord<TFields>(tableId, recordId);
    record.fields = { ...record.fields, ...fields };
    return record;
  }

  async createRecord<TFields extends AirtableFields>(
    tableId: string,
    fields: Partial<TFields>
  ) {
    this.createCalls.push({ tableId, fields });
    this.createCounts[tableId] = (this.createCounts[tableId] ?? 0) + 1;
    const id = `rec_${tableId}_${this.createCounts[tableId]}`;
    const record = { id, fields: { ...fields } };
    this.tables[tableId] ??= {};
    this.tables[tableId][id] = record;
    return record as AirtableRecord<TFields>;
  }
}
