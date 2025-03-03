import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { 
  SkeletonText, 
  InlineLoading, 
  InlineNotification,
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

interface LocationState {
  insuranceCardNo?: string;
  patientUuid?: string;
}

const GlobalBillHeader: React.FC<GlobalBillHeaderProps> = ({ patientUuid: propPatientUuid, insuranceCardNo: propInsuranceCardNo }) => {
  const { t } = useTranslation();
  
  // Set up route params and location safely with fallbacks
  let params: any = {};
  let locationState: LocationState = {};
  
  try {
    const useParamsHook = useParams();
    params = useParamsHook || {};
    
    const locationHook = useLocation();
    const location = locationHook || { state: {} };
    locationState = location.state as LocationState || {};
  } catch (error) {
    console.warn('Failed to get route params or location:', error);
  }
  
  // Extract identifiers from route or location state
  const routeInsuranceCardNo = params?.insuranceCardNo;
  const routePatientUuid = params?.patientUuid;
  const stateInsuranceCardNo = locationState?.insuranceCardNo;
  const statePatientUuid = locationState?.patientUuid;
  
  // Try to get patient from context as fallback
  const { patient } = usePatient();
  const contextPatientUuid = patient?.id;
  
  // Determine which identifiers to use - props take precedence, then route params, then location state, then context
  const insuranceCardNo = propInsuranceCardNo || routeInsuranceCardNo || stateInsuranceCardNo;
  const patientUuid = propPatientUuid || routePatientUuid || statePatientUuid || contextPatientUuid;

  const [insuranceData, setInsuranceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (insuranceCardNo) {
          response = await fetchGlobalBillsByInsuranceCard(insuranceCardNo);
        } 
        else if (patientUuid) {
          response = await fetchGlobalBillsByPatient(patientUuid);
        } 
        else {
          console.warn('Missing both insurance card number and patient UUID');
          setLoading(false);
          return;
        }

        if (response.results?.length > 0) {
          setInsuranceData(response.results[0]);
        } else {
          throw new Error(t('noDataFound', 'No data found'));
        }
      } catch (err: any) {
        setError(err.message || t('fetchError', 'Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [insuranceCardNo, patientUuid, t]);

  const insuranceOwner = useMemo(
    () =>
      insuranceData
        ? {
            title: t('insuranceOwner', 'Insurance Owner Information'),
            details: [
              { label: t('name', 'Name'), value: insuranceData.owner?.person?.display || 'N/A' },
              { label: t('gender', 'Gender'), value: insuranceData.owner?.person?.gender || 'N/A' },
              {
                label: t('birthdate', 'Birthdate'),
                value: insuranceData.owner?.person?.birthdate
                  ? new Date(insuranceData.owner?.person?.birthdate).toLocaleDateString()
                  : 'N/A',
              },
              { label: t('age', 'Age'), value: `${insuranceData.owner?.person?.age || 'N/A'} yrs` },
            ],
          }
        : null,
    [insuranceData, t],
  );

  const beneficiary = useMemo(
    () =>
      insuranceData
        ? {
            title: t('beneficiaryInfo', 'Beneficiary Information'),
            details: [
              { label: t('name', 'Name'), value: insuranceData.owner?.person?.display || 'N/A' },
              { label: t('gender', 'Gender'), value: insuranceData.owner?.person?.gender || 'N/A' },
              {
                label: t('birthdate', 'Birthdate'),
                value: insuranceData.owner?.person?.birthdate
                  ? new Date(insuranceData.owner?.person?.birthdate).toLocaleDateString()
                  : 'N/A',
              },
              { label: t('age', 'Age'), value: `${insuranceData.owner?.person?.age || 'N/A'} yrs` },
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
          }
        : null,
    [insuranceData, t],
  );

  const insuranceCompany = useMemo(
    () =>
      insuranceData
        ? {
            title: t('insuranceCompany', 'Insurance Company'),
            details: [
              { label: t('insurance', 'Insurance'), value: insuranceData.insurance?.name || 'None' },
              { label: t('rate', 'Rate'), value: `${insuranceData.insurance?.rate || '0.0'}%` },
              { label: t('flatFee', 'Flat Fee'), value: insuranceData.insurance?.flatFee || 'N/A' },
              { label: t('depositBalance', 'Deposit Balance'), value: insuranceData.insurance?.depositBalance || '0' },
            ],
          }
        : null,
    [insuranceData, t],
  );

  const cards = [insuranceOwner, beneficiary, insuranceCompany].filter(Boolean);

  if (loading) {
    return (
      <div className={styles.sectionContainer}>
        <InlineLoading description={t('loading', 'Loading insurance details...')} />
        <div className={styles.skeletonContainer}>
          {[1, 2, 3].map((key) => (
            <Tile key={key}>
              <SkeletonText heading width="100%" />
              <SkeletonText paragraph lineCount={3} />
            </Tile>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.sectionContainer}>
        <InlineNotification
          kind="error"
          title={t('error', 'Error')}
          subtitle={error}
          hideCloseButton
          lowContrast
        />
      </div>
    );
  }

  if (!insuranceData && !loading && !error) {
    return (
      <div className={styles.sectionContainer}>
        <InlineNotification
          kind="info"
          title={t('noData', 'No Data')}
          subtitle={t('noInsuranceData', 'No insurance data available')}
          hideCloseButton
          lowContrast
        />
      </div>
    );
  }

  return (
    <div className={styles.sectionContainer}>
      <Tile light className={styles.contentWrapper}>
        <div className={styles.container}>
          {cards.map((card) => (
            <Card key={card?.title} title={card?.title} details={card?.details} />
          ))}
        </div>
      </Tile>
    </div>
  );
};

export default GlobalBillHeader;
