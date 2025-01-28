import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Billing from './billing.component';
import InvoiceTable from './invoice/invoice-table.component';
import PatientBills from './billing-admin/patientbills.component';

const RootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/billing';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<Billing />} />
        <Route path="/invoice/:insuranceCardNo" element={<InvoiceTable />} />
        <Route path="/patient-bills" element={<PatientBills />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
