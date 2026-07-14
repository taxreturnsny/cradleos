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

## Next Workflow Build

The next backend workflow should add `/api/fillout-webhook` and preserve the current caregiver application baseline:

- Accept Fillout caregiver application submissions.
- Use the Airtable caregiver record id from the submission.
- Create separate Reference 1 and Reference 2 records when provided.
- Link references back to the caregiver.
- Complete the open `Follow Up Application` task.
- Create a `Review Application` task if one does not already exist.
- Prevent duplicate processing with the Fillout submission id.
- Keep Airtable access in a small service layer.
- Cover idempotency and task/reference behavior with tests.
