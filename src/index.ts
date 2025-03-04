import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { createLeftPanelLink } from './left-panel-link.component';
import BillingAdminCardLink from './billing-admin-card-link.component';
import BillingAdminHome from './billing-admin/billing-home/billing-home-component';
import InvoiceTable from './invoice/invoice-table.component';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-rwandaemr-billing-app';

const options = {
  featureName: 'RwandaEMR Billing',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const billingSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);

export const billingDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'billing',
    title: 'Billing',
  }),
  options,
);

export const billingAdminHome = getSyncLifecycle(BillingAdminHome, options);

export const billingPatientSummary = getSyncLifecycle(InvoiceTable, options);

export const billableServicesCardLink = getSyncLifecycle(BillingAdminCardLink, options);
