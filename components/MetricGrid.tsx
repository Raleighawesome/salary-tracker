'use client';

import { useMemo } from 'react';
import { SalaryEntry } from '@/types/salary';
import { buildMetricSummaries } from '@/utils/metrics';

type MetricGridProps = {
  entries: SalaryEntry[];
};

export function MetricGrid({ entries }: MetricGridProps) {
  const metrics = useMemo(() => buildMetricSummaries(entries), [entries]);

  if (!metrics.length) {
    return null;
  }

  return (
    <section className="metric-grid" aria-label="Key compensation metrics">
      {metrics.map((metric) => (
        <article key={metric.label} className="metric-card">
          <span className="metric-label">{metric.label}</span>
          <span className="metric-value">{metric.value}</span>
          {metric.helper && <span className="metric-helper">{metric.helper}</span>}
        </article>
      ))}
      <style jsx>{`
        .metric-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2.5rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }

        .metric-card {
          background: linear-gradient(135deg, rgba(30, 64, 175, 0.45), rgba(14, 165, 233, 0.25));
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 18px;
          padding: 1.2rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.35);
        }

        .metric-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(226, 232, 240, 0.75);
        }

        .metric-value {
          font-size: clamp(1.3rem, 3vw, 1.8rem);
          font-weight: 700;
          color: #f8fafc;
        }

        .metric-helper {
          font-size: 0.85rem;
          color: rgba(226, 232, 240, 0.65);
        }
      `}</style>
    </section>
  );
}
