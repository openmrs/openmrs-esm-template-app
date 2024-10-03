import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import patientBillingStatusSummary from './components/billing-status-summary.component';

const moduleName = '@openmrs/esm-patient-billing-status-app';

const options = {
  featureName: 'root-world',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const patientBillingStatusOverview = getSyncLifecycle(patientBillingStatusSummary, options);
