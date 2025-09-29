import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchSalaryHistory, insertSalary } from '@/lib/supabaseAdmin';

const payloadSchema = z.object({
  role: z.string().min(2),
  year: z.number().int().gte(1900).lte(2100),
  salary: z.number().positive(),
  range_min: z.number().positive(),
  range_mid: z.number().positive(),
  range_max: z.number().positive()
});

export async function GET() {
  try {
    const data = await fetchSalaryHistory();
    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues.map((issue) => issue.message).join(', ') },
      { status: 400 }
    );
  }

  try {
    const data = await insertSalary(parsed.data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
