'use client';

import { useState } from 'react';
import { SalaryEntry, SalaryPayload } from '@/types/salary';
import { z } from 'zod';

type SalaryFormProps = {
  onCreate: (entry: SalaryEntry) => void;
};

const salarySchema = z.object({
  role: z.string().min(2, 'Role is required'),
  year: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().min(1900).max(2100)),
  salary: z
    .string()
    .transform((value) => Number.parseFloat(value))
    .pipe(z.number().positive('Salary must be positive')),
  range_min: z
    .string()
    .transform((value) => Number.parseFloat(value))
    .pipe(z.number().positive('Min must be positive')),
  range_mid: z
    .string()
    .transform((value) => Number.parseFloat(value))
    .pipe(z.number().positive('Mid must be positive')),
  range_max: z
    .string()
    .transform((value) => Number.parseFloat(value))
    .pipe(z.number().positive('Max must be positive'))
});

export function SalaryForm({ onCreate }: SalaryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    role: '',
    year: new Date().getFullYear().toString(),
    salary: '',
    range_min: '',
    range_mid: '',
    range_max: ''
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = salarySchema.safeParse(values);

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid data');
      setIsSubmitting(false);
      return;
    }

    const payload: SalaryPayload = result.data;

    try {
      const response = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save entry.');
      }

      const entry: SalaryEntry = await response.json();
      onCreate(entry);
      setValues((current) => ({
        ...current,
        salary: '',
        range_min: '',
        range_mid: '',
        range_max: ''
      }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-wrapper" aria-labelledby="entry-form">
      <header>
        <h2 id="entry-form">Add compensation data</h2>
        <p>Keep your history up to date and watch the story evolve instantly.</p>
      </header>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          <span>Role</span>
          <input
            name="role"
            value={values.role}
            onChange={handleChange}
            placeholder="Senior Product Manager"
            required
          />
        </label>
        <label>
          <span>Year</span>
          <input name="year" value={values.year} onChange={handleChange} type="number" min="1900" max="2100" required />
        </label>
        <label>
          <span>Base Salary</span>
          <input
            name="salary"
            value={values.salary}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="160000"
            required
          />
        </label>
        <label>
          <span>Range Min</span>
          <input
            name="range_min"
            value={values.range_min}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="140000"
            required
          />
        </label>
        <label>
          <span>Range Mid</span>
          <input
            name="range_mid"
            value={values.range_mid}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="160000"
            required
          />
        </label>
        <label>
          <span>Range Max</span>
          <input
            name="range_max"
            value={values.range_max}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="180000"
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Saving…' : 'Save entry'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <style jsx>{`
        .form-wrapper {
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 20px;
          padding: 1.8rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        header h2 {
          font-size: 1.25rem;
          margin-bottom: 0.35rem;
        }

        header p {
          color: rgba(226, 232, 240, 0.65);
          font-size: 0.95rem;
        }

        .form-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        label span {
          color: rgba(226, 232, 240, 0.75);
        }

        input {
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          background: rgba(15, 23, 42, 0.55);
          color: #f1f5f9;
          padding: 0.6rem 0.75rem;
          transition: border-color 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: rgba(96, 165, 250, 0.85);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
        }

        .submit-button {
          grid-column: 1 / -1;
          justify-self: flex-start;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(14, 165, 233, 0.9));
          color: #f8fafc;
          padding: 0.75rem 1.4rem;
          border-radius: 999px;
          font-weight: 600;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .submit-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35);
        }

        .error {
          color: #fca5a5;
          font-size: 0.9rem;
        }
      `}</style>
    </section>
  );
}
