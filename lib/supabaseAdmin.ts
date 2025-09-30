import { SalaryPayload } from '@/types/salary';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const restEndpoint = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/rest/v1` : undefined;

if (!supabaseUrl || !restEndpoint) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
}

if (!anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.');
}

const defaultHeaders: Record<string, string> = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

export async function fetchSalaryHistory() {
  const response = await fetch(`${restEndpoint}/salary_history?select=*&order=year.asc`, {
    headers: defaultHeaders,
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${await response.text()}`);
  }

  return response.json();
}

export async function insertSalary(payload: SalaryPayload) {
  const { range_min, range_max, ...rest } = payload;

  const body: Record<string, number | string> & {
    range_min?: number;
    range_max?: number;
  } = { ...rest };

  if (range_min != null) {
    body.range_min = range_min;
  }

  if (range_max != null) {
    body.range_max = range_max;
  }

  const response = await fetch(`${restEndpoint}/salary_history`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Prefer: 'return=representation'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Supabase insert failed: ${await response.text()}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}
