export type SalaryEntry = {
  id: string;
  role: string;
  year: number;
  salary: number;
  range_min: number;
  range_mid: number;
  range_max: number;
  created_at: string;
};

export type SalaryPayload = {
  role: string;
  year: number;
  salary: number;
  range_min: number;
  range_mid: number;
  range_max: number;
};
