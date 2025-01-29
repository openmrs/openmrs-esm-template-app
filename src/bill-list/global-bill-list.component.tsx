import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import Card from './card.component';
import styles from './global-bill-list.scss';
import { fetchGlobalBillsByInsuranceCard } from '../api/billing';

interface LocationState {
  insuranceCardNo?: string;
}

const GlobalBillHeader: React.FC = () => {
  const { t } = useTranslation();
  const { insuranceCardNo } = useParams();
  const location = useLocation();
  const locationState = location.state as LocationState;

  const [insuranceData, setInsuranceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const cardNumber = insuranceCardNo || locationState?.insuranceCardNo;
        if (cardNumber) {
          const response = await fetchGlobalBillsByInsuranceCard(cardNumber);
          if (response.results?.length > 0) {
            setInsuranceData(response.results[0]);
          } else {
            throw new Error(t('noDataFound', 'No data found'));
          }
        } else {
          console.warn('Missing insurance card number');
        }
      } catch (err: any) {
        setError(err.message || t('fetchError', 'Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [insuranceCardNo, locationState?.insuranceCardNo, t]);

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
                value: new Date(insuranceData.owner?.person?.birthdate).toLocaleDateString() || 'N/A',
              },
              { label: t('age', 'Age'), value: `${insuranceData.owner?.person?.age || 'N/A'} yrs` },
              { label: t('policyNumber', 'Policy Number'), value: insuranceData.insuranceCardNo || 'N/A' },
              {
                label: t('validity', 'Validity'),
                value: `${new Date(insuranceData.coverageStartDate).toLocaleDateString()} – ${new Date(
                  insuranceData.expirationDate,
                ).toLocaleDateString()}`,
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
    return <p>{t('loading', 'Loading...')}</p>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <section>
      {insuranceCardNo ? (
        cards.length > 0 ? (
          <section className={styles.container}>
            {cards.map((card) => (
              <Card key={card?.title} title={card?.title} details={card?.details} />
            ))}
          </section>
        ) : (
          <p className={styles.noData}>{t('noData', 'No data to display')}</p>
        )
      ) : (
        <p>{t('missingCardNumber', 'Missing insurance card number')}</p>
      )}
    </section>
  );
};

export default GlobalBillHeader;
