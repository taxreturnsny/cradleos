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
| `FILLOUT_WEBHOOK_SECRET` | Secret used to validate Fillout webhook requests. |

## Quality Checks

Run the standard checks before shipping changes:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Current Implementation Status

This initial baseline creates the deployable app shell, testing harness, environment guidance, and setup documentation. The next implementation milestone is the Vercel-compatible Fillout webhook at `/api/fillout-webhook`, backed by a small Airtable service layer and tests for duplicate submission handling, caregiver updates, reference creation, and task completion.
