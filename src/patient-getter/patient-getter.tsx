import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { getPatient } from './patient-getter.resource';

export function PatientGetter() {
  const [patient, setPatient] = useState<fhir.Patient>();
  const patientName = 'test';
  return (
    <div>
      <button onClick={() => getPatient(patientName).then(setPatient)}>
        <Trans key="getPatient">Get a patient named</Trans> 'test'
      </button>
      <div>{JSON.stringify(patient)}</div>
    </div>
  );
}
