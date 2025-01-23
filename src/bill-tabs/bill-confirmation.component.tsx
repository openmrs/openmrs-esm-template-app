import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './bill-confirmation.scss';

const BillConfirmation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Open Bill Confirmation page Tile*/}
      <section className={styles.container}>
        <div className={styles.tile}>
          <h3 className={styles.heading}>{t('openBillConfirmation', 'Open Bill Confirmation')}</h3>
          <div className={styles.dateWrapper}>
            <div className={styles.dateField}>
              <span className={styles.label}>{t('startDate', 'Start Date')}</span>
              <input type="date" className={styles.inputField} />
            </div>
            <div className={styles.dateField}>
              <span className={styles.label}>{t('endDate', 'End Date')}</span>
              <input type="date" className={styles.inputField} />
            </div>
          </div>
          <button className={styles.openButton}>{t('open', 'Open')}</button>
        </div>
      </section>

      <section className={styles.container}>
        {/* Find An Existing Insurance Policy Tile */}
        <div className={styles.tile}>
          <h3 className={styles.heading}>{t('findInsurancePolicy', 'Find An Existing Insurance Policy')}</h3>
          <div className={styles.searchWrapper}>
            <span className={styles.label}>{t('patientInsuranceCard', 'Patient Insurance Card Number')}</span>
            <input
              type="text"
              className={styles.inputField}
              placeholder={t('searchPlaceholder', 'Enter card number to search')}
            />
          </div>
        </div>
        <div className={styles.orWrapper}>
          <span className={styles.orText}>{t('or', 'Or')}</span>
        </div>

        {/* Search by Bill Identifier Tile */}
        <div className={styles.tile}>
          <h3 className={styles.heading}>{t('searchByBillIdentifier', 'Search by Bill Identifier')}</h3>
          <div className={styles.searchWrapper}>
            <span className={styles.label}>{t('billIdentifier', 'Bill Identifier ID')}</span>
            <input
              type="text"
              className={styles.inputField}
              placeholder={t('billSearchPlaceholder', 'Enter bill identifier to search')}
            />
          </div>
          <button className={styles.searchButton}>{t('search', 'Search')}</button>
        </div>
      </section>
    </div>
  );
};

export default BillConfirmation;