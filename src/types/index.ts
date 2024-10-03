export interface BillingLine {
  id: string;
  date: string;
  visit: {
    uuid: string;
    startDate: string;
    endDate: string;
  };
  document: string;
  order: string;
  tags: string[];
  displayName: string;
  approved: boolean;
}
