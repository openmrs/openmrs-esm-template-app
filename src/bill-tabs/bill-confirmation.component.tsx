import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './search-bill-header-cards.scss';
import { navigate } from '@openmrs/esm-framework';

const BillConfirmation: React.FC = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleOpenBill = () => {
    if (startDate && endDate) {
      const queryParams = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
      }).toString();

      const url = `${window.getOpenmrsSpaBase()}home/billing/patient-bills?${queryParams}`;
      navigate({ to: url });
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.tile}>
        <h3 className={styles.heading}>{t('openBillConfirmation', 'Open Bill Confirmation')}</h3>
        <div className={styles.dateWrapper}>
          <div className={styles.dateField}>
            <span className={styles.label}>{t('startDate', 'Start Date')}</span>
            <input
              type="date"
              className={styles.inputField}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className={styles.dateField}>
            <span className={styles.label}>{t('endDate', 'End Date')}</span>
            <input
              type="date"
              className={styles.inputField}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button className={styles.openButton} onClick={handleOpenBill} disabled={!startDate || !endDate}>
          {t('open', 'Open')}
        </button>
      </div>
    </section>
  );
};

export default BillConfirmation;
