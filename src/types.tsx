interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

interface Owner {
  uuid: string;
  display: string;
  links: Link[];
}

interface InsurancePolicy {
  insuranceCardNo: string;
  coverageStartDate: string;
  expirationDate: string;
  owner: Owner;
  links: Link[];
}

interface Admission {
  insurancePolicy: InsurancePolicy;
  isAdmitted: boolean;
  admissionDate: string;
  dischargingDate: string | null;
  diseaseType: string;
  admissionType: number;
  links: Link[];
}

interface CreatorOrCloser {
  uuid: string;
  display: string;
  links: Link[];
}

interface Insurance {
  insuranceId: number;
  name: string;
  address: string;
  phone: string;
  category: string;
  links: Link[];
}

export interface Bill {
  globalBillId: number;
  admission: Admission;
  billIdentifier: string;
  globalAmount: number;
  consommations: any;
  createdDate: string;
  creator: CreatorOrCloser;
  closingDate: string;
  closedBy: CreatorOrCloser;
  closed: boolean;
  insurance: Insurance;
  closingReason: string;
  links: Link[];
  resourceVersion: string;
}

export interface MappedBill {
  uuid: number;
  globalBillId: number;
  no: number;
  date: string;
  createdBy: string;
  policyId: string;
  admissionDate: string;
  dischargeDate: string;
  billIdentifier: string;
  patientDueAmount: number;
  paidAmount: number;
  paymentStatus: string | null;
  bill: boolean;
}

export interface ConsommationListItem {
  consommationId?: number;
  createdDate?: string;
  department?: {
    name?: string;
  };
  insuranceBill?: {
    amount?: number;
    creator?: {
      person?: {
        display?: string;
      };
    };
  };
  thirdPartyBill?: {
    amount?: number;
  };
  patientBill?: {
    amount?: number;
    policyIdNumber?: string;
    status?: string;
    payments?: Array<{
      amountPaid?: number;
    }>;
  };
}

export interface ConsommationListResponse {
  results?: ConsommationListItem[];
  totalDueAmount?: number;
  totalPaidAmount?: number;
}

export interface ConsommationItem {
  itemId?: number;
  itemCode?: string;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  paidAmount?: number;
  remainingAmount?: number;
  serviceDate?: string;
  paid?: boolean;
  partiallyPaid?: boolean;
  paidQuantity?: number;
  itemType?: number;
  drugFrequency?: string;
  patientServiceBillId?: number;
  selected?: boolean;
}

export interface RowData {
  id: string;
  index: number;
  createdDate: string;
  consommationId: string;
  service: string;
  createdBy: string;
  insuranceCardNo: string;
  insuranceDue: string;
  thirdPartyDue: string;
  patientDue: string;
  paidAmount: string;
  status: string;
  rawPatientDue: number;
  rawPaidAmount: number;
  select?: React.ReactNode;
}

export interface BillPaymentItem {
  billItem: {
    patientServiceBillId: number;
  };
  paidQty: number;
}

export interface BillPaymentRequest {
  amountPaid: number;
  patientBill: {
    patientBillId: number;
    creator: string;
  };
  dateReceived: string;
  collector: {
    uuid: string;
  };
  paidItems: BillPaymentItem[];
}
