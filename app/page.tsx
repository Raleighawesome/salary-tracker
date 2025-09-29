'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SalaryForm } from '@/components/SalaryForm';
import { SalaryCharts } from '@/components/SalaryCharts';
import { SalaryTable } from '@/components/SalaryTable';
import { MetricGrid } from '@/components/MetricGrid';
import { SalaryEntry } from '@/types/salary';

export default function HomePage() {
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
        setEntries(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    void loadEntries();
  }, []);

  const handleCreate = (entry: SalaryEntry) => {
    setEntries((current) => {
      const next = [...current, entry];
      return next.sort((a, b) => a.year - b.year);
    });
  };

  return (
    <>
      <PageHeader />
      <MetricGrid entries={entries} />
      <SalaryForm onCreate={handleCreate} />
      {isLoading && !entries.length ? (
        <p className="loading">Loading your salary history…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <SalaryCharts entries={entries} />
          <SalaryTable entries={entries} />
        </>
      )}
      <style jsx>{`
        .loading {
          color: rgba(226, 232, 240, 0.75);
          margin-bottom: 1.5rem;
        }

        .error {
          color: #f87171;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </>
  );
}
