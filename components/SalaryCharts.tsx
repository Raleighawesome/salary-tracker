'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { SalaryEntry } from '@/types/salary';
import { calculateYearOverYear, normalizeEntriesForChart } from '@/utils/metrics';

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

type SalaryChartsProps = {
  entries: SalaryEntry[];
};

export function SalaryCharts({ entries }: SalaryChartsProps) {
  if (!entries.length) {
    return (
      <section className="empty-state">
        <h2>Visuals appear once data does</h2>
        <p>Add your first entry to unlock insights and chart your trajectory.</p>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 2.5rem 1.5rem;
            background: rgba(15, 23, 42, 0.55);
            border-radius: 18px;
            border: 1px dashed rgba(148, 163, 184, 0.35);
            color: rgba(226, 232, 240, 0.75);
            margin-bottom: 2.5rem;
          }

          h2 {
            margin-bottom: 0.5rem;
            color: #f8fafc;
          }
        `}</style>
      </section>
    );
  }

  const areaData = normalizeEntriesForChart(entries);
  const yoyData = calculateYearOverYear(entries);
  const hasMinData = areaData.some((point) => point.min != null);
  const hasMaxData = areaData.some((point) => point.max != null);

  const latestEntry = areaData[areaData.length - 1];
  const latestValues = latestEntry
    ? [latestEntry.salary, latestEntry.min, latestEntry.mid, latestEntry.max].filter(
        (value): value is number => value != null
      )
    : [];
  const fallbackMax = areaData.reduce((highest, point) => {
    const bandValues = [point.salary, point.min, point.mid, point.max].filter(
      (value): value is number => value != null
    );
    return bandValues.length ? Math.max(highest, ...bandValues) : highest;
  }, Number.NEGATIVE_INFINITY);
  const fallbackMinBand = areaData.reduce((lowest, point) => {
    const bandValues = [point.salary, point.min, point.mid, point.max].filter(
      (value): value is number => value != null
    );
    return bandValues.length ? Math.min(lowest, ...bandValues) : lowest;
  }, Number.POSITIVE_INFINITY);

  const computedYAxisMax = latestValues.length
    ? Math.max(...latestValues)
    : Number.isFinite(fallbackMax)
      ? fallbackMax
      : undefined;
  const computedYAxisMin = Number.isFinite(fallbackMinBand)
    ? fallbackMinBand
    : undefined;

  const yAxisDomain: [number | 'auto', number | 'auto'] = [
    computedYAxisMin ?? 0,
    computedYAxisMax ?? 'auto'
  ];

  return (
    <section className="chart-grid">
      <article>
        <header>
          <h2>Salary vs. band</h2>
          <p>Track how your pay aligns with the compensation band for each year.</p>
        </header>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={areaData}>
              <defs>
                <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(226, 232, 240, 0.65)" />
              <YAxis
                stroke="rgba(226, 232, 240, 0.65)"
                tickFormatter={currencyFormatter}
                width={100}
                domain={yAxisDomain}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: 12,
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  color: '#f8fafc'
                }}
                formatter={(value: number) => currencyFormatter(value)}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="salary" stroke="#38bdf8" fill="url(#colorSalary)" strokeWidth={2.8} name="Salary" />
              {hasMinData && (
                <Line
                  type="monotone"
                  dataKey="min"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="3 5"
                  dot={false}
                  name="Band Min"
                />
              )}
              <Line
                type="monotone"
                dataKey="mid"
                stroke="#22d3ee"
                strokeWidth={2}
                strokeDasharray="3 5"
                dot={false}
                name="Band Mid"
              />
              {hasMaxData && (
                <Line
                  type="monotone"
                  dataKey="max"
                  stroke="#34d399"
                  strokeWidth={2}
                  strokeDasharray="3 5"
                  dot={false}
                  name="Band Max"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </article>
      <article>
        <header>
          <h2>Year-over-year change</h2>
          <p>See the percentage change in salary compared with the previous year.</p>
        </header>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(226, 232, 240, 0.65)" />
              <YAxis
                stroke="rgba(226, 232, 240, 0.65)"
                tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: 12,
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  color: '#f8fafc'
                }}
                formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="change" stroke="#c084fc" strokeWidth={3} dot={{ r: 4 }} name="YoY %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
      <style jsx>{`
        .chart-grid {
          display: grid;
          gap: 1.75rem;
          margin-bottom: 2.5rem;
        }

        article {
          background: rgba(15, 23, 42, 0.65);
          border-radius: 20px;
          border: 1px solid rgba(59, 130, 246, 0.25);
          padding: 1.6rem 1.4rem 1.4rem;
          box-shadow: 0 18px 32px rgba(2, 6, 23, 0.4);
        }

        header h2 {
          font-size: 1.15rem;
          margin-bottom: 0.45rem;
        }

        header p {
          color: rgba(226, 232, 240, 0.65);
          font-size: 0.9rem;
          margin-bottom: 1.4rem;
        }

        .chart-wrapper {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </section>
  );
}
