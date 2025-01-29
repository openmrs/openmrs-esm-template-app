import { formatDate, openmrsFetch, parseDate } from '@openmrs/esm-framework';
import useSWR from 'swr';
import isEmpty from 'lodash-es/isEmpty';
import { Bill, MappedBill } from '../types';

export const usePatientBill = (policyId: string) => {
  const url = `/ws/rest/v1/mohbilling/globalBill?ipCardNumber=${policyId}&v=full`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<Bill> } }>(
    isEmpty(policyId) ? null : url,
    openmrsFetch,
  );

  const mapBillProperties = (bill: Bill): MappedBill => ({
    uuid: bill.globalBillId,
    globalBillId: bill.globalBillId,
    no: bill.globalBillId,
    date: formatDate(parseDate(bill.createdDate), { mode: 'standard' }),
    createdBy: bill.creator.display,
    policyId: bill.admission.insurancePolicy.insuranceCardNo,
    admissionDate:
      bill.admission.admissionDate !== null
        ? formatDate(parseDate(bill.admission.admissionDate), { mode: 'standard' })
        : '--',
    dischargeDate:
      bill.admission.dischargingDate !== null
        ? formatDate(parseDate(bill.admission.dischargingDate), {
            mode: 'standard',
          })
        : '--',
    billIdentifier: bill.billIdentifier,
    patientDueAmount: 0,
    paidAmount: bill.globalAmount,
    paymentStatus: bill.closed ? 'PAID' : 'UNPAID',
    bill: bill.closed,
  });

  const mappedResults = data?.data.results?.map((bill) => mapBillProperties(bill));

  return {
    bills: mappedResults,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};
