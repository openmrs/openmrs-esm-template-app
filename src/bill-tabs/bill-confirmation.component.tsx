import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker, DatePickerInput } from '@carbon/react';
import dayjs from 'dayjs';
import { navigate } from '@openmrs/esm-framework';
import styles from './bill-confirmation.scss';

const BillConfirmation: React.FC = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const handleOpenBill = () => {
    if (startDate && endDate) {
      const queryParams = new URLSearchParams({
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
      }).toString();

      const url = `${window.getOpenmrsSpaBase()}home/billing/patient-bills?${queryParams}`;
      navigate({ to: url });
    }
  };

  return (
    <section className={styles.billConfirmationContainer}>
      <div className={styles.billConfirmationTile}>
        <h3 className={styles.billConfirmationHeading}>{t('openBillConfirmation', 'Open Bill Confirmation')}</h3>
        <div className={styles.dateWrapper}>
          <div className={styles.dateField}>
            <span className={styles.label}>{t('startDate', 'Start Date')}</span>
            <DatePicker
              onChange={([date]) => setStartDate(dayjs(date).format('YYYY-MM-DD'))}
              datePickerType="single"
            >
              <DatePickerInput
                id="start-date-picker"
                placeholder="DD/MM/YYYY"
                labelText=""
                type="text"
              />
            </DatePicker>
          </div>
          <div className={styles.dateField}>
            <span className={styles.label}>{t('endDate', 'End Date')}</span>
            <DatePicker
              onChange={([date]) => setEndDate(dayjs(date).format('YYYY-MM-DD'))}
              datePickerType="single"
            >
              <DatePickerInput
                id="end-date-picker"
                placeholder="DD/MM/YYYY"
                labelText=""
                type="text"
              />
            </DatePicker>
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
