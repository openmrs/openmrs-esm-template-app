import { formatDate, openmrsFetch, parseDate } from '@openmrs/esm-framework';
import useSWR from 'swr';
import isEmpty from 'lodash-es/isEmpty';
import { Bill, MappedBill } from '../types';

export const usePatientBill = (policyId: string) => {
  const url = `/ws/rest/v1/mohbilling/globalBill?ipCardNumber=${policyId}&v=full`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<Bill> } }>(
    // isEmpty(billId) ? url : null,
    url,
    openmrsFetch,
  );

  const mapBillProperties = (bill: Bill): MappedBill => ({
    uuid: bill.globalBillId,
    globalBillId: bill.globalBillId,
    no: bill.globalBillId,
    date: formatDate(parseDate(bill.createdDate), { mode: 'wide' }),
    createdBy: bill.creator.display,
    policyId: bill.admission.insurancePolicy.insuranceCardNo,
    admissionDate:
      bill.admission.admissionDate !== null
        ? formatDate(parseDate(bill.admission.admissionDate), { mode: 'wide' })
        : '--',
    dischargeDate:
      bill.admission.dischargingDate !== null
        ? formatDate(parseDate(bill.admission.dischargingDate), {
            mode: 'wide',
          })
        : '--',
    billIdentifier: bill.billIdentifier,
    patientDueAmount: bill.globalAmount,
    paidAmount: bill.globalAmount,
    paymentStatus: bill.closed ? 'CLOSED' : 'OPEN',
    bill: 'X',
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
