import { SalaryEntry } from '@/types/salary';

type MetricSummary = {
  label: string;
  value: string;
  helper?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

const formatPercent = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

export const buildMetricSummaries = (entries: SalaryEntry[]): MetricSummary[] => {
  if (entries.length === 0) {
    return [];
  }

  const sorted = [...entries].sort((a, b) => a.year - b.year);
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];

  const totalGrowth = ((latest.salary - first.salary) / first.salary) * 100;
  const yoyChanges = sorted.slice(1).map((entry, index) => {
    const previous = sorted[index];
    return ((entry.salary - previous.salary) / previous.salary) * 100;
  });
  const latestChange = yoyChanges.length ? yoyChanges[yoyChanges.length - 1] : 0;

  const averageCompaRatio =
    sorted.reduce((sum, entry) => sum + entry.salary / entry.range_mid, 0) / sorted.length;

  return [
    {
      label: 'Current Salary',
      value: formatCurrency(latest.salary),
      helper: `${latest.year} • ${latest.role}`
    },
    {
      label: 'Total Growth',
      value: formatPercent(totalGrowth),
      helper: `${formatCurrency(first.salary)} → ${formatCurrency(latest.salary)}`
    },
    {
      label: 'Last YoY Change',
      value: formatPercent(latestChange),
      helper: sorted.length > 1 ? `${sorted[sorted.length - 2].year} → ${latest.year}` : 'N/A'
    },
    {
      label: 'Years Tracked',
      value: `${sorted.length}`,
      helper: `${first.year} – ${latest.year}`
    },
    {
      label: 'Avg. Compa Ratio',
      value: `${(averageCompaRatio * 100).toFixed(1)}%`,
      helper: 'Salary ÷ band midpoint'
    }
  ];
};

export const calculateYearOverYear = (entries: SalaryEntry[]) => {
  const sorted = [...entries].sort((a, b) => a.year - b.year);

  return sorted.slice(1).map((entry, index) => {
    const previous = sorted[index];
    const change = ((entry.salary - previous.salary) / previous.salary) * 100;

    return {
      year: entry.year,
      change
    };
  });
};

export const normalizeEntriesForChart = (entries: SalaryEntry[]) =>
  [...entries]
    .sort((a, b) => a.year - b.year)
    .map((entry) => ({
      year: entry.year,
      salary: entry.salary,
      min: entry.range_min,
      mid: entry.range_mid,
      max: entry.range_max
    }));
