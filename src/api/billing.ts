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
  creator: string;
  departmentName: string;
  policyIdNumber: string;
  beneficiaryName: string;
  insuranceName: string;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}

export interface PatientBillResponse {
  results: Array<PatientBill>;
}

export const getPatientBills = async (
  startDate: string,
  endDate: string,
  startIndex: number = 0,
  limit: number = 20
): Promise<PatientBillResponse> => {
  const response = await openmrsFetch<PatientBillResponse>(
    `${BASE_API_URL}/patientBill?startDate=${startDate}&endDate=${endDate}&startIndex=${startIndex}&limit=${limit}&orderBy=createdDate&order=desc`
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

// Update the billItems interface in the Consommation interface to include links
export interface Consommation {
  consommationId: number;
  department: {
    departmentId: number;
    name: string;
    description: string;
  };
  billItems: Array<{
    serviceDate: string;
    unitPrice: number;
    quantity: number;
    paidQuantity: number;
    paid: boolean;
    serviceOther: string | null;
    serviceOtherDescription: string | null;
    drugFrequency: string;
    itemType: number;
    links?: Array<{
      rel: string;
      uri: string;
      resourceAlias: string;
    }>;
  }>;
  patientBill: {
    patientBillId: number;
    amount: number;
    createdDate: string;
    payments: Array<{
      amountPaid: number;
      dateReceived: string;
      collector: {
        uuid: string;
        display: string;
      };
    }>;
    creator: string;
    departmentName: string;
    policyIdNumber: string;
    beneficiaryName: string;
    insuranceName: string;
  };
  insuranceBill: {
    amount: number;
    creator: {
      person: {
        display: string;
      };
    };
    createdDate: string;
  };
}

export const getConsommationById = async (consommationId: string): Promise<Consommation> => {
  const response = await openmrsFetch<Consommation>(`${BASE_API_URL}/consommation/${consommationId}`);
  return response.data;
};

/**
 * Extracts a meaningful service name from a bill item
 * @param {object} billItem - The bill item from the API
 * @param {string} departmentName - The department name for fallback
 * @returns {string} The service name to display
 */
function extractServiceName(billItem, departmentName = 'Unknown') {
  if (billItem.hopService && billItem.hopService.name) {
    // Primary option: use the service name directly from hopService
    return billItem.hopService.name;
  } else if (billItem.serviceOtherDescription) {
    // Secondary option: use the service other description if available
    return billItem.serviceOtherDescription;
  } else if (billItem.serviceOther) {
    // Third option: use serviceOther if available
    return billItem.serviceOther;
  } else {
    // Fallback: create a generic name using department
    return `${departmentName} Service Item`;
  }
}

/**
 * Fetches detailed items for a specific consommation with improved service name display
 * @param consommationId - The ID of the consommation to fetch items for
 * @returns Promise containing the items for the specified consommation
 */
export async function getConsommationItems(consommationId: string) {
  try {
    // Use the existing getConsommationById function to fetch the full consommation data
    const consommationData = await getConsommationById(consommationId);
    
    // Extract and transform billItems for display
    const items = consommationData.billItems.map((item, index) => {
      // Get the department name for fallback
      const departmentName = consommationData.department?.name || 'Unknown';
      
      // Extract a meaningful service name
      const itemName = extractServiceName(item, departmentName);
      
      // Get patientServiceBillId from links if they exist
      let patientServiceBillId = null;
      
      // Use type guard to check if links property exists
      if (item.links && Array.isArray(item.links) && item.links.length > 0) {
        const link = item.links.find(link => link.resourceAlias === 'patientServiceBill');
        if (link && link.uri) {
          const idMatch = link.uri.match(/\/patientServiceBill\/(\d+)/);
          if (idMatch && idMatch[1]) {
            patientServiceBillId = parseInt(idMatch[1]);
          }
        }
      }
      
      // Create a unique ID for each item, either from the link or a generated one
      const itemId = patientServiceBillId || 10372855 + index;
      
      // Calculate total cost of this item
      const itemTotal = item.quantity * item.unitPrice;
      
      // Calculate paid amount based on paidQuantity
      const paidAmount = item.paidQuantity ? item.paidQuantity * item.unitPrice : (item.paid ? itemTotal : 0);
      
      // Calculate remaining amount
      const remainingAmount = Math.max(0, itemTotal - paidAmount);
      
      // Determine payment status
      const isFullyPaid = item.paid || remainingAmount <= 0;
      const isPartiallyPaid = !isFullyPaid && paidAmount > 0;
      
      return {
        itemId: index + 1,
        itemCode: `ITEM-${index + 1}`,
        itemName: itemName, // Use the extracted service name
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        serviceDate: item.serviceDate,
        itemType: item.itemType,
        paid: isFullyPaid,
        partiallyPaid: isPartiallyPaid,
        paidQuantity: item.paidQuantity || 0,
        drugFrequency: item.drugFrequency,
        patientServiceBillId: itemId,
        selected: false
      };
    });
    
    return items;
  } catch (error) {
    console.error('Error fetching consommation items:', error);
    throw error;
  }
}

export interface ConsommationListItem {
  consommationId: number;
  createdDate: string;
  service: string;
  createdBy: string;
  insuranceCardNo: string;
  insuranceDue: number;
  thirdPartyDue: number;
  patientDue: number;
  paidAmount: number;
  status: string;
}

export interface ConsommationListResponse {
  results: Array<ConsommationListItem>;
  totalDueAmount: number;
  totalPaidAmount: number;
}

export const getConsommationsByGlobalBillId = async (globalBillId: string): Promise<ConsommationListResponse> => {
  const response = await openmrsFetch<ConsommationListResponse>(
    `${BASE_API_URL}/consommation?globalBillId=${globalBillId}`
  );
  return response.data;
};

/**
 * Fetches global bills by patient UUID
 * 
 * @param patientUuid - The patient UUID
 * @returns Promise with the API response data
 */
export const fetchGlobalBillsByPatient = async (patientUuid: string) => {
  try {
    const response = await openmrsFetch(`/ws/rest/v1/mohbilling/globalBill?patient=${patientUuid}&v=full`);
    return response.data || { results: [] };
  } catch (error) {
    console.error('Error fetching global bills by patient UUID:', error);
    throw error;
  }
};

export interface GlobalBillSummary {
  total: number;
  closed: number;
  open: number;
}

export const getGlobalBillSummary = async (): Promise<GlobalBillSummary> => {
  const response = await openmrsFetch<GlobalBillSummary>(`${BASE_API_URL}/globalBill/summary`);
  return response.data;
};

// Add these interfaces and function to the billing.ts file

export interface BillPaymentItem {
  billItem: {
    patientServiceBillId: number;
  };
  paidQty: number;
}

export interface BillPaymentRequest {
  amountPaid: number | string;  // Allow both for flexibility
  patientBill: {
    patientBillId: number;
  };
  dateReceived: string;
  collector: {
    uuid: string;
  };
  paidItems: BillPaymentItem[];
}

export interface BillPaymentResponse {
  billPaymentId: number;
  amountPaid: number;
  dateReceived: string;
  status: string;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
}
/**
 * Submits a bill payment
 * @param paymentData - The payment data to submit
 * @returns Promise with the payment response
 */
export const submitBillPayment = async (paymentData: BillPaymentRequest): Promise<BillPaymentResponse> => {
  try {
    // IMPORTANT: Convert amountPaid to a string with decimal places
    let amountPaidAsString: string;
    if (typeof paymentData.amountPaid === 'string') {
      amountPaidAsString = parseFloat(paymentData.amountPaid).toFixed(2);
    } else {
      amountPaidAsString = paymentData.amountPaid.toFixed(2);
    }
    
    // Ensure paidQty values are integers
    const validatedPaidItems = paymentData.paidItems.map(item => ({
      ...item,
      paidQty: Math.floor(item.paidQty) // Ensure it's an integer
    }));
    
    // Create a payload with amountPaid as a string and include creator
    const payloadWithStringAmount = {
      ...paymentData,
      amountPaid: amountPaidAsString,
      paidItems: validatedPaidItems
    };
    
    // Convert to JSON string
    let jsonPayload = JSON.stringify(payloadWithStringAmount);
    
    // Manually replace the quoted amountPaid with an unquoted decimal number
    jsonPayload = jsonPayload.replace(
      /"amountPaid":"(\d+\.\d+)"/,
      '"amountPaid":$1'
    );
    
    console.log('Final JSON payload:', jsonPayload);
    
    // Use the manually formatted JSON string
    const response = await openmrsFetch<BillPaymentResponse>(`${BASE_API_URL}/billPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: jsonPayload // Use the manually formatted string
    });
    
    if (response.status >= 400) {
      throw new Error(`Payment failed with status ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Payment submission error:', error);
    throw error;
  }
};
