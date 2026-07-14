# CradleOS Setup Notes

## Local Setup

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Fill in secrets locally or in your deployment provider.
5. Run `npm run dev`.

## Deployment Setup

CradleOS is prepared for Vercel-style deployment. Configure the same environment variables from `.env.example` in the deployment environment.

Do not commit real Airtable tokens, Fillout secrets, API keys, or caregiver/client data.

## Fillout Webhook Setup

Use this endpoint for caregiver application submissions:

```text
POST /api/fillout-webhook
```

Set one shared secret in `FILLOUT_WEBHOOK_SECRET`, then configure Fillout to send the same value in either `x-fillout-webhook-secret` or `authorization: Bearer <secret>`.

The payload must include:

- Fillout submission id: `submissionId`, `submission_id`, `responseId`, or `id`.
- Caregiver Airtable record id: `caregiverRecordId`, `caregiver_record_id`, `airtableRecordId`, `airtable_record_id`, `recordId`, or `record_id`.
- Reference answers using the current Fillout question names or ids for Reference 1 and Reference 2.

The webhook:

- Stores the Fillout submission id on the caregiver record.
- Copies reference details onto the caregiver record.
- Creates separate reference records for provided references.
- Links references back to the caregiver.
- Marks linked open `Follow Up Application` tasks as `Done`.
- Creates a linked `Review Application` task when one does not already exist.
- Returns `duplicate` without side effects when the caregiver already has the same submission id.

## Next Workflow Build

The next backend workflow should validate `/api/fillout-webhook` with a safe test submission and then continue expanding caregiver operations:

- Add a fixture or staging submission for end-to-end Airtable validation.
- Add reference verification task creation when reference records are generated.
- Add deployment notes after Vercel environment variables are configured.
