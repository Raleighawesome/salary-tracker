'use client';

import { useCallback, useEffect, useState } from 'react';
import { SalaryEntry, SalaryPayload } from '@/types/salary';
import { z } from 'zod';

type SalaryFormProps = {
  onCreate: (entry: SalaryEntry) => void;
};

const positiveNumberField = (label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return value;
      }

      const parsed = Number.parseFloat(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .positive(`${label} must be positive`)
  );

const optionalPositiveNumberField = (label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return value;
      }

      const trimmed = value.trim();
      if (trimmed === '') {
        return null;
      }

      const parsed = Number.parseFloat(trimmed);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .positive(`${label} must be positive`)
      .nullable()
  );

const salarySchema = z.object({
  role: z.string().min(2, 'Role is required'),
  year: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().min(1900).max(2100)),
  salary: positiveNumberField('Salary'),
  range_min: optionalPositiveNumberField('Min'),
  range_mid: positiveNumberField('Mid'),
  range_max: optionalPositiveNumberField('Max')
});

export function SalaryForm({ onCreate }: SalaryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState({
    role: '',
    year: new Date().getFullYear().toString(),
    salary: '',
    range_min: '',
    range_mid: '',
    range_max: ''
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose, isOpen]);

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
      handleClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="fab"
          onClick={() => setIsOpen(true)}
          aria-label="Add compensation entry"
          aria-expanded={isOpen}
        >
          <span aria-hidden>+</span>
        </button>
      )}
      {isOpen && (
        <div className="popover-backdrop" role="presentation" onClick={handleClose}>
          <section
            className="form-wrapper"
            aria-labelledby="entry-form"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div className="title-group">
                <h2 id="entry-form">Add compensation data</h2>
                <p>Keep your history up to date and watch the story evolve instantly.</p>
              </div>
              <button type="button" className="close-button" onClick={handleClose} aria-label="Close form">
                ×
              </button>
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
                <input
                  name="year"
                  value={values.year}
                  onChange={handleChange}
                  type="number"
                  min="1900"
                  max="2100"
                  required
                />
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
                />
              </label>
              <button type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? 'Saving…' : 'Save entry'}
              </button>
            </form>
            {error && <p className="error">{error}</p>}
          </section>
        </div>
      )}
      <style jsx>{`
        .fab {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 3.25rem;
          height: 3.25rem;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(14, 165, 233, 0.9));
          color: #f8fafc;
          font-size: 1.75rem;
          line-height: 1;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.45);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          z-index: 40;
        }

        .fab:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(37, 99, 235, 0.35);
        }

        .popover-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          padding: 1.25rem;
          z-index: 30;
        }

        .form-wrapper {
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          padding: 1.8rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: min(420px, 100%);
          max-height: min(80vh, 560px);
          box-shadow: 0 18px 38px rgba(2, 6, 23, 0.45);
          overflow-y: auto;
        }

        header {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          justify-content: space-between;
        }

        .title-group h2 {
          font-size: 1.25rem;
          margin-bottom: 0.35rem;
        }

        .title-group p {
          color: rgba(226, 232, 240, 0.65);
          font-size: 0.95rem;
        }

        .close-button {
          border: none;
          background: rgba(15, 23, 42, 0.6);
          color: rgba(226, 232, 240, 0.75);
          font-size: 1.5rem;
          line-height: 1;
          border-radius: 999px;
          width: 2rem;
          height: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .close-button:hover {
          background: rgba(37, 99, 235, 0.3);
          color: #f8fafc;
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

        @media (max-width: 640px) {
          .popover-backdrop {
            padding: 1rem;
          }

          .form-wrapper {
            width: 100%;
            max-height: min(85vh, 620px);
          }

          .fab {
            bottom: 1rem;
            right: 1rem;
            width: 3rem;
            height: 3rem;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
