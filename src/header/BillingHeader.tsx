import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, DatePicker, DatePickerInput, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import PaymentsDeskIcon from '../images/payments-desk-icon.svg';
import { Receipt, ManageProtection, Currency } from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import styles from './billing-header.scss';

interface BillingHeaderProps {
    onTabChange: (tabIndex: number) => void;
}

const BillingHeader: React.FC<BillingHeaderProps> = ({ onTabChange }) => {
    const { t } = useTranslation();
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const session = useSession();

    const userLocation = session?.sessionLocation?.display || 'Unknown Location';

    const handleTabClick = (event: { selectedIndex: number }) => {
        const index = event.selectedIndex;
        setSelectedTab(index);
        onTabChange(index);
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
                    <div className={styles.rightSection}>
                        <OverflowMenu size="sm" flipped>
                            <OverflowMenuItem itemText="Department" />
                            <OverflowMenuItem itemText="Service" />
                            <OverflowMenuItem itemText="Facility Service Price" />
                            <OverflowMenuItem itemText="Insurance" />
                            <OverflowMenuItem itemText="Third Party" />
                        </OverflowMenu>
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
                </div>

                <div className={styles.navigationContainer}>
                    <Tabs selected={selectedTab} onChange={handleTabClick}>
                        <TabList aria-label="Billing Navigation">
                            <Tab renderIcon={Receipt}>{t('bill', 'Bill')}</Tab>
                            <Tab renderIcon={ManageProtection}>{t('manageBill', 'Manage Bill')}</Tab>
                            <Tab renderIcon={Currency}>{t('managePayments', 'Manage Payments')}</Tab>
                        </TabList>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default BillingHeader;