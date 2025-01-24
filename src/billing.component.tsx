import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from './header/BillingHeader';
import styles from './billing.scss';
import GlobalBillHeaderCards from './bill-tabs/search-bill-header.component';
import SearchGlobalBill from './bill-tabs/search-global-bill.component';
import BillConfirmation from './bill-tabs/bill-confirmation.component';
import Department from './billing-admin/Department';
import Service from './billing-admin/Service';
import FacilityServicePrice from './billing-admin/FacilityServicePrice';
import Insurance from './billing-admin/Insurance';
import ThirdParty from './billing-admin/ThirdParty';

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [activeAdminComponent, setActiveAdminComponent] = useState<string | null>(null);

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
    setActiveAdminComponent(null);
  };

  const handleMenuItemSelect = (item: string) => {
    setActiveAdminComponent(item);
  };

  const handleBack = () => {
    setActiveAdminComponent(null);
  };

  const renderAdminComponent = () => {
    switch (activeAdminComponent) {
      case 'Department':
        return <Department onBack={handleBack} />;
      case 'Service':
        return <Service onBack={handleBack} />;
      case 'Facility Service Price':
        return <FacilityServicePrice onBack={handleBack} />;
      case 'Insurance':
        return <Insurance onBack={handleBack} />;
      case 'Third Party':
        return <ThirdParty onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.billingWrapper}>
      <div className={styles.container}>
        <BillingHeader 
          onTabChange={handleTabChange} 
          onMenuItemSelect={handleMenuItemSelect}
          activeAdminComponent={activeAdminComponent}
          activeTab={activeTab}
        />
        <div className={styles.content}>
          {activeAdminComponent ? (
            renderAdminComponent()
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
