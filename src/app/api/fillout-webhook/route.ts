import { AirtableClient } from "@/lib/airtable/client";
import { processCaregiverApplicationSubmission } from "@/lib/caregiver-application/workflow";
import { loadCradleOsConfig } from "@/lib/cradleos-config";
import { parseCaregiverApplicationPayload } from "@/lib/fillout/payload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const config = loadCradleOsConfig();
    const authError = validateWebhookSecret(request, config.fillout.webhookSecret);

    if (authError) {
      return Response.json({ error: authError }, { status: 401 });
    }

    const payload = await request.json();
    const submission = parseCaregiverApplicationPayload(payload);
    const airtable = new AirtableClient({
      apiKey: config.airtable.apiKey,
      baseId: config.airtable.baseId
    });
    const result = await processCaregiverApplicationSubmission({
      airtable,
      config,
      submission
    });

    return Response.json(result, {
      status: result.status === "duplicate" ? 200 : 201
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected webhook error";

    return Response.json({ error: message }, { status: 400 });
  }
}

function validateWebhookSecret(request: Request, expectedSecret: string) {
  const providedSecret =
    request.headers.get("x-fillout-webhook-secret") ??
    request.headers.get("x-cradleos-webhook-secret") ??
    parseBearerToken(request.headers.get("authorization"));

  if (providedSecret !== expectedSecret) {
    return "Invalid webhook secret";
  }

  return undefined;
}

function parseBearerToken(value: string | null) {
  if (!value?.startsWith("Bearer ")) return undefined;
  return value.slice("Bearer ".length).trim();
}
