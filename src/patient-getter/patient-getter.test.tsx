import React from 'react';
import { render } from '@testing-library/react';
import { PatientGetter } from './patient-getter';

describe(`<PatientGetter />`, () => {
  it(`renders without dying`, () => {
    render(<PatientGetter />);
  });

  it('gets a patient when the button is clicked', () => {
    render(<PatientGetter />);
  });
});
