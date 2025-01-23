import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from './header/BillingHeader';
import styles from './billing.scss';
import GlobalBillHeaderCards from './bill-tabs/search-bill-header.component';
import SearchGlobalBill from './bill-tabs/search-global-bill.component';
import BillConfirmation from './bill-tabs/bill-confirmation.component';

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  return (
    <div className={styles.billingWrapper}>
      <div className={styles.container}>
        <BillingHeader onTabChange={handleTabChange} />
        <div className={styles.content}>{/* Add your tab content here */}</div>
      </div>
      {activeTab === 0 && (
        <div className={styles.billHeaderCardsContainer}>
          <GlobalBillHeaderCards />
        </div>
      )}
      {activeTab === 1 && (
        <div className={styles.billHeaderCardsContainer}>
          <BillConfirmation />
        </div>
      )}
      {activeTab === 2 && (
        <div className={styles.billHeaderCardsContainer}>
          <SearchGlobalBill />
        </div>
      )}
    </div>
  );
};

export default Billing;
