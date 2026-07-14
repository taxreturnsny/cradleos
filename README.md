# CradleOS

CradleOS is the operations platform for Cradlesitters. This repository is initialized as a Next.js TypeScript application that can grow into caregiver intake, reference checks, task routing, client intake, matching, placements, and communications workflows.

## Tech Stack

- Next.js App Router
- TypeScript
- CSS Modules
- Vitest
- React Testing Library
- ESLint

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

The repository includes `.env.example` with the expected runtime configuration. Keep real secrets only in local environment files or deployment secrets.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Public display name for the app. |
| `AIRTABLE_API_KEY` | Airtable token used by server-side workflow integrations. |
| `AIRTABLE_BASE_ID` | Airtable base id for the caregiver workflow. |
| `AIRTABLE_CAREGIVER_TABLE_ID` | Caregiver table id. |
| `AIRTABLE_REFERENCES_TABLE_ID` | References table id. |
| `AIRTABLE_TASKS_TABLE_ID` | Tasks table id. |
| `AIRTABLE_*_FIELD_ID` | Field ids used by the caregiver application webhook. See `.env.example` for the complete mapping. |
| `FILLOUT_WEBHOOK_SECRET` | Secret used to validate Fillout webhook requests. |

## Fillout Caregiver Webhook

The caregiver application webhook is available at:

```text
/api/fillout-webhook
```

Configure Fillout to send a `POST` request with the shared secret in one of these headers:

```text
x-fillout-webhook-secret: <FILLOUT_WEBHOOK_SECRET>
authorization: Bearer <FILLOUT_WEBHOOK_SECRET>
```

The webhook expects a Fillout submission id and the caregiver Airtable record id. The caregiver record id may be sent as a top-level field, URL parameter, or Fillout question using names such as `caregiver_record_id`, `airtable_record_id`, or `record_id`.

## Quality Checks

Run the standard checks before shipping changes:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Current Implementation Status

This baseline creates the deployable app shell, testing harness, environment guidance, setup documentation, and Vercel-compatible Fillout webhook at `/api/fillout-webhook`. The next implementation milestone is validating the webhook against a safe Airtable test submission, then expanding caregiver workflow coverage into reference verification and document tasks.
