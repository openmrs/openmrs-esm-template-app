import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { DataTableSkeleton } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { getConsommationById } from '../api/billing';
import GlobalBillHeader from '../bill-list/global-bill-list.component';
import BillItemsTable from './bill-items-table.component';
import styles from './consommation-view.scss';

interface BillItem {
  serviceDate: string;
  unitPrice: number;
  quantity: number;
  paidQuantity: number;
  paid: boolean;
  serviceOther: string | null;
  serviceOtherDescription: string | null;
  drugFrequency: string;
  itemType: number;
}

interface ConsommationData {
  consommationId: number;
  department: {
    name: string;
  };
  billItems: Array<BillItem>;
  patientBill: {
    amount: number;
    insuranceName: string;
  };
  insuranceBill: {
    amount: number;
  };
}

const ConsommationView: React.FC = () => {
  const { t } = useTranslation();
  const { consommationId } = useParams();
  const [consommation, setConsommation] = useState<ConsommationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const location = useLocation();
  const { insuranceCardNo } = location.state || {};

  useEffect(() => {
    const fetchConsommation = async () => {
      try {
        const data = await getConsommationById(consommationId);
        setConsommation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (consommationId) {
      fetchConsommation();
    }
  }, [consommationId]);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton
          data-testid="loader"
          columnCount={5}
          showHeader={false}
          showToolbar={false}
          size={responsiveSize}
          zebra
        />
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div>
        <span className={styles.pageTitle}>{t('consommationDetails', 'Patient Bill Payment')}</span>
      </div>
      <GlobalBillHeader />
      {consommation && (
        <div className={styles.billDetails}>
          <h2>{t('consommationNumber', 'Consommation #')}: {consommation.consommationId}</h2>
          <p>{t('department', 'Department')}: {consommation.department.name}</p>
          <BillItemsTable 
            items={consommation.billItems} 
            insuranceRate={(consommation.insuranceBill.amount / consommation.patientBill.amount) * 100 || 0}
          />
        </div>
      )}
    </div>
  );
};

export default ConsommationView;
