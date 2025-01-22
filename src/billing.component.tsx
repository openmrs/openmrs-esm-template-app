import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './billing.scss';

const Billing: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h3 className={styles.welcome}>{t('welcomeText', 'Welcome to RwandaEMR Billing')}</h3>
    </div>
  );
};

export default Billing;