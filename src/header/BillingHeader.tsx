import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, DatePicker, DatePickerInput } from '@carbon/react';
import PaymentsDeskIcon from '../images/payments-desk-icon.svg';
import {
    Receipt,
    ManageProtection,
    Currency,
    Settings,
    Enterprise,
    ServiceLevels,
    Hospital,
    Money,
    Finance,
    Partnership
} from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import styles from './billing-header.scss';

interface BillingHeaderProps {
    onTabChange: (tabIndex: number) => void;
}

const BillingHeader: React.FC<BillingHeaderProps> = ({ onTabChange }) => {
    const { t } = useTranslation();
    const [showAdminTabs, setShowAdminTabs] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedAdminTab, setSelectedAdminTab] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const session = useSession();

    const userLocation = session?.sessionLocation?.display || 'Unknown Location';

    const handleTabClick = (event: { selectedIndex: number }) => {
        const index = event.selectedIndex;
        setSelectedTab(index);
        setShowAdminTabs(index === 3);
        onTabChange(index);
    };

    const handleAdminSwitch = (event: { index: number }) => {
        setSelectedAdminTab(event.index);
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
                        <img
                            src={PaymentsDeskIcon}
                            alt="Payments Desk Icon"
                            className={styles.headerIcon}
                        />
                        <div className="SpCH950g4QxXz019bezKSA==">
                            <p className={styles.location}>{userLocation}</p>
                            <p className="eMASq3DjWJo-OD-HE5jNWQ==">Billing</p>
                        </div>
                    </div>
                    <div className="cds--date-picker-input__wrapper">
                        <span>
                            <DatePicker
                                datePickerType="single"
                                dateFormat="d-M-Y"
                                value={selectedDate}
                                onChange={handleDateChange}
                            >
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
                                        maxWidth: '10rem'
                                    }}
                                />
                            </DatePicker>
                        </span>
                    </div>
                </div>

                <div className={styles.navigationContainer}>
                    <Tabs selected={selectedTab} onChange={handleTabClick}>
                        <TabList aria-label="Billing Navigation">
                            <Tab renderIcon={Receipt}>{t('bill', 'Bill')}</Tab>
                            <Tab renderIcon={ManageProtection}>{t('manageBill', 'Manage Bill')}</Tab>
                            <Tab renderIcon={Currency}>{t('managePayments', 'Manage Payments')}</Tab>
                            <Tab renderIcon={Settings}>{t('billingAdmin', 'Billing Admin')}</Tab>
                        </TabList>
                    </Tabs>

                    {showAdminTabs && (
                        <div className={styles.secondaryNavigation}>
                            <Tabs selected={selectedAdminTab} onChange={handleAdminSwitch}>
                                <TabList aria-label="Admin Navigation">
                                    <Tab renderIcon={Enterprise}>{t('department', 'Department')}</Tab>
                                    <Tab renderIcon={ServiceLevels}>{t('service', 'Service')}</Tab>
                                    <Tab renderIcon={Hospital}>{t('facilityService', 'Facility')}</Tab>
                                    <Tab renderIcon={Money}>{t('price', 'Price')}</Tab>
                                    <Tab renderIcon={Finance}>{t('insurance', 'Insurance')}</Tab>
                                    <Tab renderIcon={Partnership}>{t('thirdParty', 'Third Party')}</Tab>
                                </TabList>
                            </Tabs>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingHeader;