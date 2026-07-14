export type AirtableFields = Record<string, unknown>;

export type AirtableRecord<TFields extends AirtableFields = AirtableFields> = {
  id: string;
  fields: TFields;
};

export interface AirtableDataClient {
  getRecord<TFields extends AirtableFields>(
    tableId: string,
    recordId: string
  ): Promise<AirtableRecord<TFields>>;
  updateRecord<TFields extends AirtableFields>(
    tableId: string,
    recordId: string,
    fields: Partial<TFields>
  ): Promise<AirtableRecord<TFields>>;
  createRecord<TFields extends AirtableFields>(
    tableId: string,
    fields: Partial<TFields>
  ): Promise<AirtableRecord<TFields>>;
}

type AirtableClientOptions = {
  apiKey: string;
  baseId: string;
  fetchImpl?: typeof fetch;
};

export class AirtableClient implements AirtableDataClient {
  private readonly apiKey: string;
  private readonly baseId: string;
  private readonly fetchImpl: typeof fetch;

  constructor({ apiKey, baseId, fetchImpl = fetch }: AirtableClientOptions) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.fetchImpl = fetchImpl;
  }

  async getRecord<TFields extends AirtableFields>(
    tableId: string,
    recordId: string
  ) {
    return this.request<TFields>(`${tableId}/${recordId}`);
  }

  async updateRecord<TFields extends AirtableFields>(
    tableId: string,
    recordId: string,
    fields: Partial<TFields>
  ) {
    return this.request<TFields>(`${tableId}/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({ fields, typecast: true })
    });
  }

  async createRecord<TFields extends AirtableFields>(
    tableId: string,
    fields: Partial<TFields>
  ) {
    return this.request<TFields>(tableId, {
      method: "POST",
      body: JSON.stringify({ fields, typecast: true })
    });
  }

  private async request<TFields extends AirtableFields>(
    path: string,
    init: RequestInit = {}
  ) {
    const response = await this.fetchImpl(
      `https://api.airtable.com/v0/${this.baseId}/${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...init.headers
        }
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Airtable request failed: ${response.status} ${body}`);
    }

    return (await response.json()) as AirtableRecord<TFields>;
  }
}
