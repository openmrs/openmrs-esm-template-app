import React from 'react';
import { render, cleanup, screen, getByText } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { Greeter } from './greeter';
import { Config } from '../config-schema';

const mockUseConfig = useConfig as jest.Mock;

describe(`<Greeter />`, () => {
  afterEach(cleanup);
  it(`displays the expected default text`, () => {
    const config: Config = { casualGreeting: false, whoToGreet: ['World'] };
    mockUseConfig.mockReturnValue(config);
    render(<Greeter />);
    expect(screen.getByText(/world/i)).toHaveTextContent('hello World!');
  });

  it(`will casually greet my friends`, () => {
    const config: Config = { casualGreeting: true, whoToGreet: ['Ariel', 'Barak', 'Callum'] };
    mockUseConfig.mockReturnValue(config);
    render(<Greeter />);
    expect(screen.getByText(/ariel/i)).toHaveTextContent('hey Ariel, Barak, Callum!');
  });
});
