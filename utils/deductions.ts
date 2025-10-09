const PAY_PERIODS_PER_YEAR = 26;
const BASELINE_GROSS_CHECK = 8780.19;

export type DeductionGroup = 'Pre-tax Benefits' | 'Retirement' | 'Post-tax Benefits' | 'Taxes';

const GROUP_ORDER: DeductionGroup[] = ['Pre-tax Benefits', 'Retirement', 'Post-tax Benefits', 'Taxes'];

export type DeductionRate = {
  id: string;
  label: string;
  rate: number;
  group: DeductionGroup;
  description?: string;
};

export type DeductionBreakdown = {
  id: string;
  label: string;
  group: DeductionGroup;
  rate: number;
  amountPerPaycheck: number;
  amountAnnual: number;
};

export type GroupBreakdown = {
  group: DeductionGroup;
  rate: number;
  amountPerPaycheck: number;
  amountAnnual: number;
};

export type NetPayProjection = {
  grossAnnual: number;
  grossPerPaycheck: number;
  netAnnual: number;
  netMonthly: number;
  netPerPaycheck: number;
  totalRate: number;
  totalDeductionsPerPaycheck: number;
  breakdown: DeductionBreakdown[];
  groups: GroupBreakdown[];
};

export const DEDUCTION_RATES: DeductionRate[] = [
  {
    id: 'medical',
    label: 'Medical EE pre-tax',
    rate: 30.46 / BASELINE_GROSS_CHECK,
    group: 'Pre-tax Benefits'
  },
  {
    id: 'dental',
    label: 'Dental EE pre-tax',
    rate: 43.93 / BASELINE_GROSS_CHECK,
    group: 'Pre-tax Benefits'
  },
  {
    id: 'vision',
    label: 'Vision EE pre-tax',
    rate: 1.79 / BASELINE_GROSS_CHECK,
    group: 'Pre-tax Benefits'
  },
  {
    id: '401k',
    label: '401k EE pre-tax',
    rate: 526.81 / BASELINE_GROSS_CHECK,
    group: 'Retirement'
  },
  {
    id: 'metlife-legal',
    label: 'MetLife Legal',
    rate: 8.31 / BASELINE_GROSS_CHECK,
    group: 'Post-tax Benefits'
  },
  {
    id: 'metlife-accident',
    label: 'MetLife Accident',
    rate: 9.61 / BASELINE_GROSS_CHECK,
    group: 'Post-tax Benefits'
  },
  {
    id: 'metlife-home',
    label: 'MetLife Home',
    rate: 77.85 / BASELINE_GROSS_CHECK,
    group: 'Post-tax Benefits'
  },
  {
    id: 'federal-income-tax',
    label: 'Federal Income Tax',
    rate: 1007.82 / BASELINE_GROSS_CHECK,
    group: 'Taxes'
  },
  {
    id: 'state-income-tax',
    label: 'North Carolina Income Tax',
    rate: 336.0 / BASELINE_GROSS_CHECK,
    group: 'Taxes'
  },
  {
    id: 'medicare-tax',
    label: 'Medicare Tax',
    rate: 205.37 / BASELINE_GROSS_CHECK,
    group: 'Taxes'
  }
];

export const TOTAL_DEDUCTION_RATE = DEDUCTION_RATES.reduce((total, item) => total + item.rate, 0);

const toGroupBreakdown = (breakdown: DeductionBreakdown[]): GroupBreakdown[] => {
  const summary = new Map<DeductionGroup, GroupBreakdown>();

  for (const item of breakdown) {
    const existing = summary.get(item.group);
    if (existing) {
      existing.rate += item.rate;
      existing.amountPerPaycheck += item.amountPerPaycheck;
      existing.amountAnnual += item.amountAnnual;
    } else {
      summary.set(item.group, {
        group: item.group,
        rate: item.rate,
        amountPerPaycheck: item.amountPerPaycheck,
        amountAnnual: item.amountAnnual
      });
    }
  }

  return Array.from(summary.values()).sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
  );
};

export const estimateNetPay = (annualSalary: number): NetPayProjection => {
  if (!Number.isFinite(annualSalary) || annualSalary <= 0) {
    return {
      grossAnnual: 0,
      grossPerPaycheck: 0,
      netAnnual: 0,
      netMonthly: 0,
      netPerPaycheck: 0,
      totalRate: 0,
      totalDeductionsPerPaycheck: 0,
      breakdown: [],
      groups: []
    };
  }

  const grossPerPaycheck = annualSalary / PAY_PERIODS_PER_YEAR;

  const breakdown: DeductionBreakdown[] = DEDUCTION_RATES.map((item) => {
    const amountPerPaycheck = grossPerPaycheck * item.rate;
    const amountAnnual = amountPerPaycheck * PAY_PERIODS_PER_YEAR;

    return {
      id: item.id,
      label: item.label,
      group: item.group,
      rate: item.rate,
      amountPerPaycheck,
      amountAnnual
    };
  });

  const totalDeductionsPerPaycheck = breakdown.reduce((sum, item) => sum + item.amountPerPaycheck, 0);
  const netPerPaycheck = grossPerPaycheck - totalDeductionsPerPaycheck;
  const netAnnual = netPerPaycheck * PAY_PERIODS_PER_YEAR;
  const netMonthly = netAnnual / 12;

  return {
    grossAnnual: annualSalary,
    grossPerPaycheck,
    netAnnual,
    netMonthly,
    netPerPaycheck,
    totalRate: TOTAL_DEDUCTION_RATE,
    totalDeductionsPerPaycheck,
    breakdown,
    groups: toGroupBreakdown(breakdown)
  };
};

export { PAY_PERIODS_PER_YEAR };
