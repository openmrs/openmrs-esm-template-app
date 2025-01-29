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
  bill: string;
}
