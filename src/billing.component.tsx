import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from './header/BillingHeader';
import styles from './billing.scss';
import GlobalBillHeaderCards from './search-bill-header/search-bill-header.component';

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  return (
    <div className={styles.billingWrapper}>
      {' '}
      <div className={styles.container}>
        <BillingHeader onTabChange={handleTabChange} />
        <div className={styles.content}>{/* Add your tab content here */}</div>
      </div>
      <div className={styles.billHeaderCardsContainer}>
        {' '}
        <GlobalBillHeaderCards />
      </div>
    </div>
  );
};

export default Billing;
