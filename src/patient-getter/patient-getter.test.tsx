import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientGetter } from './patient-getter';

/**
 * This is an idiomatic mock of a backend resource. We generally mock
 * resource fetching functions like `getPatient`, rather than mocking
 * `fetch` or anything lower-level.
 */
jest.mock('./patient-getter.resource.ts', () => ({
  getPatient: jest.fn(() =>
    Promise.resolve({
      name: [{ id: 'abc123', given: 'Joeboy', family: 'Testguy' }],
      gender: 'male',
      birthDate: '1997-05-21',
    }),
  ),
}));

describe(`<PatientGetter />`, () => {
  it('gets a patient when the button is clicked', async () => {
    render(<PatientGetter />);
    userEvent.click(screen.getByRole('button'));
    const resultText = await screen.findByText(/joeboy/i);
    expect(resultText).toHaveTextContent('Joeboy Testguy / male / 1997-05-21');
  });
});
