import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SkeletonText, 
  InlineLoading, 
  Tile 
} from '@carbon/react';
import { usePatient } from '@openmrs/esm-framework';
import Card from './card.component';
import styles from './global-bill-list.scss';
import { fetchGlobalBillsByInsuranceCard, fetchGlobalBillsByPatient } from '../api/billing';

interface GlobalBillHeaderProps {
  patientUuid?: string;
  insuranceCardNo?: string;
}

const GlobalBillHeader: React.FC<GlobalBillHeaderProps> = ({ patientUuid: propPatientUuid, insuranceCardNo: propInsuranceCardNo }) => {
  const { t } = useTranslation();
  
  const { patient } = usePatient();
  const contextPatientUuid = patient?.id;
  
  const insuranceCardNo = propInsuranceCardNo;
  const patientUuid = propPatientUuid || contextPatientUuid;

  const [insuranceData, setInsuranceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hadDataBefore, setHadDataBefore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!insuranceCardNo && !patientUuid) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        let response;
        let policyData = null;

        if (insuranceCardNo) {
          response = await fetchGlobalBillsByInsuranceCard(insuranceCardNo);
          
          if (response.results?.length > 0) {
            policyData = response.results[0];
          }
        } 
        else if (patientUuid) {
          response = await fetchGlobalBillsByPatient(patientUuid);
          
          if (response.results?.length > 0) {
            const globalBill = response.results[0];
            if (globalBill.admission?.insurancePolicy) {
              policyData = globalBill.admission.insurancePolicy;
              
              if (globalBill.insurance) {
                policyData.insurance = globalBill.insurance;
              }
            }
          }
        } 
        else {
          setLoading(false);
          return;
        }

        if (policyData) {
          setInsuranceData(policyData);
          setHadDataBefore(true);
        } else {
          setInsuranceData(null);
        }
      } catch (err: any) {
        setInsuranceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [insuranceCardNo, patientUuid, t]);

  const insuranceInfo = React.useMemo(() => {
    if (!insuranceData) return null;
    
    return {
      title: t('insuranceCompany', 'Insurance Company'),
      details: [
        { label: t('insurance', 'Insurance'), value: insuranceData.insurance?.name || 'None' },
        { label: t('rate', 'Rate'), value: `${insuranceData.insurance?.rate || '0.0'}%` },
        { label: t('flatFee', 'Flat Fee'), value: insuranceData.insurance?.flatFee || 'N/A' },
        { label: t('depositBalance', 'Deposit Balance'), value: insuranceData.insurance?.depositBalance || '0' },
        { label: t('policyNumber', 'Policy Number'), value: insuranceData.insuranceCardNo || 'N/A' },
        {
          label: t('validity', 'Validity'),
          value: insuranceData.coverageStartDate && insuranceData.expirationDate
            ? `${new Date(insuranceData.coverageStartDate).toLocaleDateString()} – ${new Date(
                insuranceData.expirationDate,
              ).toLocaleDateString()}`
            : 'N/A',
        },
      ],
    };
  }, [insuranceData, t]);

  if (loading && (hadDataBefore || insuranceData !== null)) {
    return (
      <div className={styles.sectionContainer}>
        <InlineLoading description={t('loading', 'Loading insurance details...')} />
        <div className={styles.skeletonContainer}>
          <Tile>
            <SkeletonText heading width="100%" />
            <SkeletonText paragraph lineCount={3} />
          </Tile>
        </div>
      </div>
    );
  }

  if (!insuranceData || error) {
    return null;
  }

  // Only show the component if we have data
  return (
    <div className={styles.sectionContainer}>
      <Tile light className={styles.contentWrapper}>
        <div className={styles.container}>
          {insuranceInfo && (
            <Card 
              key={insuranceInfo.title} 
              title={insuranceInfo.title} 
              details={insuranceInfo.details} 
            />
          )}
        </div>
      </Tile>
    </div>
  );
};

export default GlobalBillHeader;
