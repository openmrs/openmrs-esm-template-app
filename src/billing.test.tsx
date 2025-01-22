import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { Config } from './config-schema';
import Billing from './billing.component';

const mockUseConfig = jest.mocked(useConfig<Config>);

it('renders the billing landing page', () => {
  const config: Config = { casualGreeting: false, whoToGreet: ['World'] };
  mockUseConfig.mockReturnValue(config);

  render(<Billing />);

  expect(screen.getByRole('heading', { name: /welcome to rwandaemr billing/i })).toBeInTheDocument();
  // Add more billing-specific tests
});