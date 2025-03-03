import { formatDate, openmrsFetch, parseDate } from '@openmrs/esm-framework';
import useSWR from 'swr';
import isEmpty from 'lodash-es/isEmpty';
import { type Bill, type MappedBill } from '../types';

/**
 * Fetches and formats bills by patient UUID
 * 
 * @param patientUuid - Patient UUID to fetch bills for
 * @returns Object containing bills and loading/error states
 */
export const usePatientBill = (patientUuid: string) => {
  const url = `/ws/rest/v1/mohbilling/globalBill?patient=${patientUuid}&v=full`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<Bill> } }>(
    isEmpty(patientUuid) ? null : url,
    openmrsFetch,
  );

  const mappedResults = data?.data.results?.map((bill) => mapBillProperties(bill));

  return {
    bills: mappedResults,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

/**
 * Fetches and formats bills by insurance card number
 * 
 * @param insuranceCardNo - Insurance card number to fetch bills for
 * @returns Object containing bills and loading/error states
 */
export const useInsuranceCardBill = (insuranceCardNo: string) => {
  const url = `/ws/rest/v1/mohbilling/globalBill?ipCardNumber=${insuranceCardNo}&v=full`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<Bill> } }>(
    isEmpty(insuranceCardNo) ? null : url,
    openmrsFetch,
  );

  const mappedResults = data?.data.results?.map((bill) => mapBillProperties(bill));

  return {
    bills: mappedResults,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

/**
 * Maps raw bill data to a formatted structure
 * 
 * @param bill - Raw bill data from the API
 * @returns Formatted bill object
 */
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
