import { SalaryPayload } from '@/types/salary';
import { getSupabaseClient } from './supabase';

// Use the same Supabase client for consistency with authentication
const supabase = getSupabaseClient();

export async function fetchSalaryHistory() {
  // Check if Supabase is properly configured
  if (!supabase.from) {
    throw new Error('Supabase is not properly configured. Please check your environment variables.');
  }

  const { data, error } = await supabase
    .from('salary_history')
    .select('*')
    .order('year', { ascending: true });

  if (error) {
    throw new Error(`Supabase request failed: ${error.message}`);
  }

  return data || [];
}

export async function insertSalary(payload: SalaryPayload) {
  // Check if Supabase is properly configured
  if (!supabase.from) {
    throw new Error('Supabase is not properly configured. Please check your environment variables.');
  }

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

  const { data, error } = await supabase
    .from('salary_history')
    .insert(body)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  return data;
}
