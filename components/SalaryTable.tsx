'use client';

import { SalaryEntry } from '@/types/salary';
import { useMemo } from 'react';

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

type SalaryTableProps = {
  entries: SalaryEntry[];
};

export function SalaryTable({ entries }: SalaryTableProps) {
  const sorted = useMemo(() => [...entries].sort((a, b) => b.year - a.year), [entries]);

  if (!sorted.length) {
    return null;
  }

  return (
    <section className="table-card">
      <header>
        <h2>Data ledger</h2>
        <p>A log of the raw inputs powering your dashboards.</p>
      </header>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Band Min</th>
              <th>Band Mid</th>
              <th>Band Max</th>
              <th>Compa Ratio</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.year}</td>
                <td>{entry.role}</td>
                <td>{currencyFormatter(entry.salary)}</td>
                <td>{currencyFormatter(entry.range_min)}</td>
                <td>{currencyFormatter(entry.range_mid)}</td>
                <td>{currencyFormatter(entry.range_max)}</td>
                <td>{((entry.salary / entry.range_mid) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .table-card {
          background: rgba(15, 23, 42, 0.65);
          border-radius: 20px;
          border: 1px solid rgba(59, 130, 246, 0.25);
          padding: 1.6rem 1.2rem;
        }

        header {
          margin-bottom: 1.2rem;
        }

        header h2 {
          font-size: 1.15rem;
          margin-bottom: 0.4rem;
        }

        header p {
          color: rgba(226, 232, 240, 0.65);
          font-size: 0.9rem;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 720px;
        }

        th,
        td {
          text-align: left;
          padding: 0.65rem 0.75rem;
        }

        thead th {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(226, 232, 240, 0.65);
          border-bottom: 1px solid rgba(148, 163, 184, 0.25);
        }

        tbody tr {
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }

        tbody tr:last-child {
          border-bottom: none;
        }

        tbody td {
          font-size: 0.95rem;
        }
      `}</style>
    </section>
  );
}
