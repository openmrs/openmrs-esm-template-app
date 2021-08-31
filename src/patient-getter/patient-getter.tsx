/**
 * Components that make queries delegate the query-making logic to a
 * `.resource.ts` function. This component simply calls `getPatient`
 * and sets a state variable using the result.
 */

import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import Button from 'carbon-components-react/es/components/Button';
import { Tile } from 'carbon-components-react/es/components/Tile';
import { getPatient } from './patient-getter.resource';

export function PatientGetter() {
  const [patient, setPatient] = useState<fhir.Patient>();
  const patientName = 'test';
  return (
    <div>
      <Button onClick={() => getPatient(patientName).then(setPatient)}>
        <Trans key="getPatient">Get a patient named</Trans> 'test'
      </Button>
      <Tile>
        {patient
          ? `${patient.name[0].given} ${patient.name[0].family} / ${patient.gender} / ${patient.birthDate}`
          : null}
      </Tile>
    </div>
  );
}
