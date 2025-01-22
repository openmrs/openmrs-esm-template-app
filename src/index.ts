import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './left-panel-link.component';

const moduleName = '@openmrs/esm-rwandaemr-billing-app';

const options = {
  featureName: 'RwandaEMR Billing',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

// Update the import path here
export const root = getAsyncLifecycle(() => import('./billing.component'), options);

export const billingDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'billing',
    title: 'Billing'
  }),
  options
);