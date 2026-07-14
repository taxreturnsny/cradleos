export type CradleOsConfig = {
  airtable: {
    apiKey: string;
    baseId: string;
    caregiverTableId: string;
    referencesTableId: string;
    tasksTableId: string;
    fields: {
      caregiverReferences: string;
      caregiverTasks: string;
      caregiverSubmissionId: string;
      caregiverReference1Name: string;
      caregiverReference1Number: string;
      caregiverReference1Email: string;
      caregiverReference1Relationship: string;
      caregiverReference2Name: string;
      caregiverReference2Number: string;
      caregiverReference2Email: string;
      caregiverReference2Relationship: string;
      referenceName: string;
      referenceCaregiver: string;
      referenceEmail: string;
      referenceRelationship: string;
      referenceVerificationStatus: string;
      referenceVerified: string;
      taskStatus: string;
      taskCaregiver: string;
      taskType: string;
      taskPriority: string;
      taskCompletionAction: string;
      taskNextType: string;
      taskNextPriority: string;
    };
  };
  fillout: {
    webhookSecret: string;
  };
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function loadCradleOsConfig(): CradleOsConfig {
  return {
    airtable: {
      apiKey: requireEnv("AIRTABLE_API_KEY"),
      baseId: requireEnv("AIRTABLE_BASE_ID"),
      caregiverTableId: requireEnv("AIRTABLE_CAREGIVER_TABLE_ID"),
      referencesTableId: requireEnv("AIRTABLE_REFERENCES_TABLE_ID"),
      tasksTableId: requireEnv("AIRTABLE_TASKS_TABLE_ID"),
      fields: {
        caregiverReferences: requireEnv("AIRTABLE_CAREGIVER_REFERENCES_FIELD_ID"),
        caregiverTasks: requireEnv("AIRTABLE_CAREGIVER_TASKS_FIELD_ID"),
        caregiverSubmissionId: requireEnv(
          "AIRTABLE_CAREGIVER_SUBMISSION_ID_FIELD_ID"
        ),
        caregiverReference1Name: requireEnv(
          "AIRTABLE_CAREGIVER_REFERENCE_1_NAME_FIELD_ID"
        ),
        caregiverReference1Number: requireEnv(
          "AIRTABLE_CAREGIVER_REFERENCE_1_NUMBER_FIELD_ID"
        ),
        caregiverReference1Email: requireEnv(
          "AIRTABLE_CAREGIVER_REFERENCE_1_EMAIL_FIELD_ID"
        ),
        caregiverReference1Relationship: requireEnv(
          "AIRTABLE_CAREGIVER_REFERENCE_1_RELATIONSHIP_FIELD_ID"
        ),
        caregiverReference2Name: requireEnv(
          "AIRTABLE_CAREGIVER_REFERENCE_2_NAME_FIELD_ID"
        ),
        caregiverReference2Number: requireEnv(
          "AIRTABLE_CAREGIVER_REFERENCE_2_NUMBER_FIELD_ID"
        ),
        caregiverReference2Email: requireEnv(
          "AIRTABLE_CAREGIVER_REFERENCE_2_EMAIL_FIELD_ID"
        ),
        caregiverReference2Relationship: requireEnv(
          "AIRTABLE_CAREGIVER_REFERENCE_2_RELATIONSHIP_FIELD_ID"
        ),
        referenceName: requireEnv("AIRTABLE_REFERENCE_NAME_FIELD_ID"),
        referenceCaregiver: requireEnv("AIRTABLE_REFERENCE_CAREGIVER_FIELD_ID"),
        referenceEmail: requireEnv("AIRTABLE_REFERENCE_EMAIL_FIELD_ID"),
        referenceRelationship: requireEnv(
          "AIRTABLE_REFERENCE_RELATIONSHIP_FIELD_ID"
        ),
        referenceVerificationStatus: requireEnv(
          "AIRTABLE_REFERENCE_VERIFICATION_STATUS_FIELD_ID"
        ),
        referenceVerified: requireEnv("AIRTABLE_REFERENCE_VERIFIED_FIELD_ID"),
        taskStatus: requireEnv("AIRTABLE_TASK_STATUS_FIELD_ID"),
        taskCaregiver: requireEnv("AIRTABLE_TASK_CAREGIVER_FIELD_ID"),
        taskType: requireEnv("AIRTABLE_TASK_TYPE_FIELD_ID"),
        taskPriority: requireEnv("AIRTABLE_TASK_PRIORITY_FIELD_ID"),
        taskCompletionAction: requireEnv(
          "AIRTABLE_TASK_COMPLETION_ACTION_FIELD_ID"
        ),
        taskNextType: requireEnv("AIRTABLE_TASK_NEXT_TYPE_FIELD_ID"),
        taskNextPriority: requireEnv("AIRTABLE_TASK_NEXT_PRIORITY_FIELD_ID")
      }
    },
    fillout: {
      webhookSecret: requireEnv("FILLOUT_WEBHOOK_SECRET")
    }
  };
}
