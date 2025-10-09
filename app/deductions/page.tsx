'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SalaryEntry } from '@/types/salary';
import { estimateNetPay, PAY_PERIODS_PER_YEAR } from '@/utils/deductions';

const currencyWithCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatPercent = (value: number) => percentFormatter.format(value);
const formatCurrency = (value: number) => currencyWithCents.format(value);

export default function DeductionBreakdownPage() {
  const [entries, setEntries] = useState<SalaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await fetch('/api/salaries');
        if (!response.ok) {
          throw new Error('Unable to load salary history');
        }
        const data: SalaryEntry[] = await response.json();
        setEntries(data.sort((a, b) => a.year - b.year));
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    void loadEntries();
  }, []);

  const latest = useMemo(() => {
    if (!entries.length) {
      return null;
    }
    return entries[entries.length - 1];
  }, [entries]);

  const projection = useMemo(() => {
    if (!latest) {
      return null;
    }
    return estimateNetPay(latest.salary);
  }, [latest]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Salary Navigator</p>
          <h1>Net pay breakdown</h1>
          <p className="subtitle">
            Percentages below come from your October 2025 pay stub and scale with the latest salary entry. Adjust the
            deduction constants in <code>utils/deductions.ts</code> if your mix changes.
          </p>
        </div>
        <Link className="back-link" href="/">
          ← Back to dashboard
        </Link>
      </header>

      {isLoading && <p className="status">Loading deduction details…</p>}
      {error && <p className="status error">Unable to load salary history: {error}</p>}

      {!isLoading && !error && latest && projection && (
        <>
          <section className="summary">
            <div>
              <p className="summary-label">Latest salary entry</p>
              <p className="summary-value">
                {formatCurrency(latest.salary)} <span>• {latest.year}</span>
              </p>
              <p className="summary-helper">{latest.role}</p>
            </div>
            <div>
              <p className="summary-label">Net per paycheck</p>
              <p className="summary-value">{formatCurrency(projection.netPerPaycheck)}</p>
              <p className="summary-helper">
                {PAY_PERIODS_PER_YEAR} pay periods • {formatPercent(1 - projection.totalRate)} take home
              </p>
            </div>
            <div>
              <p className="summary-label">Net monthly</p>
              <p className="summary-value">{formatCurrency(projection.netMonthly)}</p>
              <p className="summary-helper">{formatCurrency(projection.netAnnual)} net annually</p>
            </div>
          </section>

          <section className="breakdown">
            <h2>Deduction mix per paycheck</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Group</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Annualized</th>
                </tr>
              </thead>
              <tbody>
                {projection.breakdown.map((item) => (
                  <tr key={item.id}>
                    <td>{item.label}</td>
                    <td>{item.group}</td>
                    <td>{formatPercent(item.rate)}</td>
                    <td>{formatCurrency(item.amountPerPaycheck)}</td>
                    <td>{formatCurrency(item.amountAnnual)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total</td>
                  <td>{formatPercent(projection.totalRate)}</td>
                  <td>{formatCurrency(projection.totalDeductionsPerPaycheck)}</td>
                  <td>{formatCurrency(projection.totalDeductionsPerPaycheck * PAY_PERIODS_PER_YEAR)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="groups">
            <h2>Group summary</h2>
            <div className="group-grid">
              {projection.groups.map((group) => (
                <article key={group.group} className="group-card">
                  <h3>{group.group}</h3>
                  <p className="group-rate">{formatPercent(group.rate)}</p>
                  <p className="group-helper">
                    {formatCurrency(group.amountPerPaycheck)} / paycheck • {formatCurrency(group.amountAnnual)} / year
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="maintenance">
            <h2>Keeping numbers fresh</h2>
            <ul>
              <li>
                When benefits or tax elections change, update the rates in <code>utils/deductions.ts</code> with the new
                paycheck figures.
              </li>
              <li>
                If you add new deductions, ensure the total rate stays in sync with your stub so forecasts match reality.
              </li>
              <li>
                For quick what-if scenarios, add a new salary entry, then revisit this page to see the adjusted take-home.
              </li>
            </ul>
          </section>
        </>
      )}

      {!isLoading && !error && !latest && (
        <section className="empty">
          <p>Add a salary entry first to unlock the deduction breakdown.</p>
          <Link href="/" className="back-link">
            Go record your current salary
          </Link>
        </section>
      )}

      <style jsx>{`
        .page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .eyebrow {
          font-size: 0.75rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(148, 163, 184, 0.75);
        }

        h1 {
          margin: 0.4rem 0;
          font-size: clamp(1.9rem, 5vw, 2.5rem);
          color: #f8fafc;
        }

        .subtitle {
          color: rgba(226, 232, 240, 0.75);
          max-width: 60ch;
          line-height: 1.5;
        }

        code {
          font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo);
          color: #e0f2fe;
        }

        .back-link {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .status {
          color: rgba(226, 232, 240, 0.7);
        }

        .status.error {
          color: #f87171;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          padding: 1.6rem;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          background: linear-gradient(135deg, rgba(30, 64, 175, 0.45), rgba(14, 165, 233, 0.25));
        }

        .summary-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(226, 232, 240, 0.75);
        }

        .summary-value {
          font-size: 1.6rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .summary-value span {
          font-size: 1rem;
          font-weight: 400;
          color: rgba(226, 232, 240, 0.7);
        }

        .summary-helper {
          color: rgba(226, 232, 240, 0.7);
        }

        .breakdown,
        .groups,
        .maintenance {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        h2 {
          font-size: 1.4rem;
          color: #e2e8f0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        thead {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.75rem;
          color: rgba(148, 163, 184, 0.9);
        }

        th,
        td {
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          text-align: left;
          color: rgba(226, 232, 240, 0.85);
        }

        tfoot td {
          font-weight: 600;
          color: #f8fafc;
        }

        .group-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .group-card {
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          padding: 1.1rem;
          background: rgba(15, 23, 42, 0.65);
        }

        .group-card h3 {
          margin-bottom: 0.4rem;
          color: #f8fafc;
          font-size: 1.05rem;
        }

        .group-rate {
          font-size: 1.4rem;
          font-weight: 600;
          color: #38bdf8;
        }

        .group-helper {
          color: rgba(226, 232, 240, 0.75);
          font-size: 0.9rem;
        }

        .maintenance ul {
          list-style: disc;
          padding-left: 1.5rem;
          color: rgba(226, 232, 240, 0.75);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .empty {
          padding: 2rem;
          border-radius: 16px;
          border: 1px dashed rgba(148, 163, 184, 0.4);
          color: rgba(226, 232, 240, 0.75);
        }

        @media (max-width: 640px) {
          .summary {
            padding: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}
