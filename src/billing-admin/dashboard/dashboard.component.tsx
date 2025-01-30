import React from 'react';
import styles from './dashboard.scss';
import { ExtensionSlot } from '@openmrs/esm-framework';
import PatientBills from '../patientbills.component';

export default function BillableServicesDashboard() {
  return (
    <main className={styles.container}>
      <ExtensionSlot name="billing-home-tiles-slot" />
      <main className={styles.servicesTableContainer}>
        <PatientBills />
      </main>
    </main>
  );
}
