export type SalaryEntry = {
  id: string;
  role: string;
  year: number;
  salary: number;
  range_min: number | null;
  range_mid: number;
  range_max: number | null;
  created_at: string;
};

export type SalaryPayload = {
  role: string;
  year: number;
  salary: number;
  range_min: number | null;
  range_mid: number;
  range_max: number | null;
};
