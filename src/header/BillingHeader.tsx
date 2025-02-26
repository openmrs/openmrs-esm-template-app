import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, DatePicker, DatePickerInput } from '@carbon/react';
import PaymentsDeskIcon from '../images/payments-desk-icon.svg';
import { Receipt, Currency } from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import styles from './billing-header.scss';

interface BillingHeaderProps {
  onTabChange: (tabIndex: number) => void;
  onMenuItemSelect?: (item: string) => void;
  activeTab: number;
  
  // Make these props optional
  onSubTabChange?: (tabIndex: number, subTabIndex: number) => void;
  activeSubTab?: number;
  
  isAdminView?: boolean;
  
  // New prop to disable sub-navigation
  showSubNavigation?: boolean;
}

const BillingHeader: React.FC<BillingHeaderProps> = ({
  onTabChange,
  onSubTabChange,
  activeTab,
  activeSubTab = 0,  // Default value if not provided
  isAdminView = false,
  showSubNavigation = true,  // Default to showing sub-navigation
  onMenuItemSelect,
}) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const session = useSession();

  const userLocation = session?.sessionLocation?.display || 'Unknown Location';

  const handleTabClick = (event: { selectedIndex: number }) => {
    const index = event.selectedIndex;
    onTabChange(index);
  };

  const handleSubTabClick = (mainTabIndex: number, subTabIndex: number) => {
    // Only call onSubTabChange if it's provided
    if (onSubTabChange) {
      onSubTabChange(mainTabIndex, subTabIndex);
    }
  };

  const handleDateChange = (dates) => {
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  };

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <div className={styles.leftSection}>
            <img src={PaymentsDeskIcon} alt="Payments Desk Icon" className={styles.headerIcon} />
            <div className="SpCH950g4QxXz019bezKSA==">
              <p className={styles.location}>{userLocation}</p>
              <p className="eMASq3DjWJo-OD-HE5jNWQ==">Billing</p>
            </div>
          </div>
          <div className={styles.rightSection}>
            <div className="cds--date-picker-input__wrapper">
              <span>
                <DatePicker datePickerType="single" dateFormat="d-M-Y" value={selectedDate} onChange={handleDateChange}>
                  <DatePickerInput
                    id="billing-date-picker"
                    pattern="\d{1,2}\/\d{1,2}\/\d{4}"
                    placeholder="DD-MMM-YYYY"
                    labelText=""
                    size="md"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      border: 'none',
                      maxWidth: '10rem',
                    }}
                  />
                </DatePicker>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.navigationContainer}>
          <Tabs selected={isAdminView ? -1 : activeTab} onChange={handleTabClick} type="contained">
            <TabList aria-label="Billing Navigation" contained>
              <Tab renderIcon={Receipt} disabled={isAdminView}>
                {t('bill', 'Bill')}
              </Tab>
              <Tab renderIcon={Currency} disabled={isAdminView}>
                {t('managePayments', 'Manage Payments')}
              </Tab>
            </TabList>
          </Tabs>

          {/* Only show sub-navigation if not in admin view AND showSubNavigation is true */}
          {!isAdminView && showSubNavigation && (
            <div className={styles.subTabsContainer}>
              {activeTab === 0 && (
                <Tabs
                  selected={activeSubTab}
                  onChange={(evt) => handleSubTabClick(0, evt.selectedIndex)}
                  type="contained"
                >
                  <TabList aria-label="Bill Sub-navigation" contained>
                    <Tab>{t('billConfirmation', 'Bill Confirmation')}</Tab>
                    <Tab>{t('searchInsurancePolicy', 'Search Insurance Policy')}</Tab>
                  </TabList>
                </Tabs>
              )}
              {activeTab === 1 && (
                <Tabs
                  selected={activeSubTab}
                  onChange={(evt) => handleSubTabClick(1, evt.selectedIndex)}
                  type="contained"
                >
                  <TabList aria-label="Manage Payments Sub-navigation" contained>
                    <Tab>{t('searchGlobalBill', 'Search Global Bill')}</Tab>
                    <Tab>{t('searchConsommations', 'Search Consommations')}</Tab>
                  </TabList>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingHeader;
