import { openmrsFetch } from '@openmrs/esm-framework';

const BASE_API_URL = '/ws/rest/v1/mohbilling';

export interface Department {
  departmentId: number;
  name: string;
  description: string;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}

export interface DepartmentResponse {
  results: Array<Department>;
}

export const getDepartments = async (): Promise<Array<Department>> => {
  const response = await openmrsFetch<DepartmentResponse>(`${BASE_API_URL}/department`);
  return response.data.results;
};

export interface HopService {
  serviceId: number;
  name: string;
  description: string;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}

export interface ServiceResponse {
  results: Array<HopService>;
}

export const getServices = async (): Promise<Array<HopService>> => {
  const response = await openmrsFetch<ServiceResponse>(`${BASE_API_URL}/hopService`);
  return response.data.results;
};

export interface FacilityServicePrice {
  facilityServicePriceId: number;
  name: string;
  shortName: string;
  description: string;
  category: string;
  fullPrice: number;
  itemType: number;
  hidden: boolean;
  concept?: {
    uuid: string;
    display: string;
    links: Array<{
      rel: string;
      uri: string;
      resourceAlias: string;
    }>;
  };
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}

export interface FacilityServicePriceResponse {
  results: Array<FacilityServicePrice>;
}

export interface PaginatedFacilityServicePriceResponse extends FacilityServicePriceResponse {
  links?: Array<{ rel: string; uri: string }>;
  totalCount?: number;
}

export const getFacilityServicePrices = async (
  startIndex: number = 0,
  limit: number = 20,
): Promise<PaginatedFacilityServicePriceResponse> => {
  const response = await openmrsFetch<PaginatedFacilityServicePriceResponse>(
    `${BASE_API_URL}/facilityServicePrice?startIndex=${startIndex}&limit=${limit}`,
  );
  return response.data;
};

export interface Insurance {
  insuranceId: number;
  name: string;
  address: string;
  phone: string;
  category: string;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}

export interface InsuranceResponse {
  results: Array<Insurance>;
}

export const getInsurances = async (): Promise<Array<Insurance>> => {
  const response = await openmrsFetch<InsuranceResponse>(`${BASE_API_URL}/insurance`);
  return response.data.results;
};

export interface ThirdParty {
  thirdPartyId: number;
  name: string;
  rate: number;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}

export interface ThirdPartyResponse {
  results: Array<ThirdParty>;
}

export const getThirdParties = async (): Promise<Array<ThirdParty>> => {
  const response = await openmrsFetch<ThirdPartyResponse>(`${BASE_API_URL}/thirdParty`);
  return response.data.results;
};

export async function fetchGlobalBillsByInsuranceCard(insuranceCardNumber: string) {
  try {
    const response = await openmrsFetch(
      `${BASE_API_URL}/insurancePolicy?insuranceCardNo=${insuranceCardNumber}&v=full`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching global bills:', error);
    throw new Error(error.message || 'An unknown error occurred');
  }
}

export interface PatientBill {
  patientBillId: number;
  amount: number;
  createdDate: string;
  status: string | null;
  voided: boolean;
  payments: Array<{
    amountPaid: number;
    dateReceived: string;
    collector: {
      uuid: string;
      display: string;
    };
  }>;
  phoneNumber: string | null;
  transactionStatus: string | null;
  paymentConfirmedBy: any | null;
  paymentConfirmedDate: string | null;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}

export interface PatientBillResponse {
  results: Array<PatientBill>;
}

export const getPatientBills = async (startDate: string, endDate: string): Promise<PatientBillResponse> => {
  const response = await openmrsFetch<PatientBillResponse>(
    `${BASE_API_URL}/patientBill?startDate=${startDate}&endDate=${endDate}`,
  );
  return response.data;
};

export interface GlobalBill {
  globalBillId: number;
  billIdentifier: string;
  globalAmount: number;
  createdDate: string;
  closingDate: string | null;
  closed: boolean;
  closingReason: string;
  admission: {
    insurancePolicy: {
      insuranceCardNo: string;
      owner: {
        display: string;
      };
    };
    admissionDate: string;
    dischargingDate: string | null;
  };
  creator: {
    display: string;
  };
}

export interface GlobalBillResponse {
  results: Array<GlobalBill>;
}

export const getGlobalBillByIdentifier = async (billIdentifier: string): Promise<GlobalBillResponse> => {
  const response = await openmrsFetch<GlobalBillResponse>(`${BASE_API_URL}/globalBill?billIdentifier=${billIdentifier}`);
  return response.data;
};