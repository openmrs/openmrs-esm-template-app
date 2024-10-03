import useSWR from 'swr';
import { useMemo } from 'react';
import { type BillingLine } from '../types';

const generateDummyData = (patientUuid: string) => {
  const visits = [
    { uuid: 'visit1', startDate: '2023-01-01', endDate: '2023-01-03' },
    { uuid: 'visit2', startDate: '2023-02-15', endDate: '2023-02-17' },
  ];

  const lines: BillingLine[] = [
    {
      id: 'line1',
      date: '2023-01-01',
      visit: visits[0],
      document: 'INV-001',
      order: 'ORDER-001',
      tags: ['ORDER', 'FULLY_INVOICED', 'PAID'],
      displayName: 'Consultation',
      approved: true,
    },
    {
      id: 'line2',
      date: '2023-01-02',
      visit: visits[0],
      document: 'INV-002',
      order: 'ORDER-002',
      tags: ['ORDER', 'PARTIALLY_INVOICED', 'NOT_PAID'],
      displayName: 'Lab Test',
      approved: false,
    },
    {
      id: 'line3',
      date: '2023-02-15',
      visit: visits[1],
      document: 'INV-003',
      order: 'ORDER-003',
      tags: ['INVOICE', 'PAID'],
      displayName: 'X-Ray',
      approved: true,
    },
    {
      id: 'line4',
      date: '2023-02-16',
      visit: visits[1],
      document: 'INV-004',
      order: 'ORDER-004',
      tags: ['INVOICE', 'NOT_PAID', 'OVERDUE'],
      displayName: 'Medication',
      approved: true,
    },
  ];

  return lines;
};

// Simulated API fetcher
const fetcher = (url: string, patientUuid: string) => {
  return new Promise<BillingLine[]>((resolve) => {
    setTimeout(() => {
      resolve(generateDummyData(patientUuid));
    }, 1000);
  });
};
// Custom hook to fetch and process data using useSWR
export const useBillingStatus = (patientUuid: string) => {
  const { data, error, isLoading, isValidating } = useSWR(['billingStatus', patientUuid], ([_, patientUuid]) =>
    fetcher('/api/billing-status', patientUuid),
  );

  const groupedLines = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, line) => {
      if (!acc[line.visit.uuid]) {
        acc[line.visit.uuid] = {
          visit: line.visit,
          approved: true,
          lines: [],
        };
      }
      acc[line.visit.uuid].lines.push(line);
      acc[line.visit.uuid].approved = acc[line.visit.uuid].approved && line.approved;
      return acc;
    }, {} as Record<string, { visit: BillingLine['visit']; approved: boolean; lines: BillingLine[] }>);
  }, [data]);

  return {
    groupedLines,
    isLoading: isLoading || (!error && !data),
    error,
    isValidating,
  };
};
