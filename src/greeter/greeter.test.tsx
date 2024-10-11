import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { Config } from '../config-schema';
import Greeter from './greeter.component';

const mockUseConfig = jest.mocked(useConfig<Config>);

it('displays the expected default text', () => {
  const config: Config = { casualGreeting: false, whoToGreet: ['World'] };
  mockUseConfig.mockReturnValue(config);

  render(<Greeter />);

  expect(screen.getByText(/world/i)).toHaveTextContent('hello World!');
});

it('casually greets my friends', () => {
  const config: Config = {
    casualGreeting: true,
    whoToGreet: ['Ariel', 'Barak', 'Callum'],
  };
  mockUseConfig.mockReturnValue(config);

  render(<Greeter />);

  expect(screen.getByText(/ariel/i)).toHaveTextContent('hey Ariel, Barak, Callum!');
});
