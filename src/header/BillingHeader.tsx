import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, DatePicker, DatePickerInput, OverflowMenu, OverflowMenuItem, Button } from '@carbon/react';
import PaymentsDeskIcon from '../images/payments-desk-icon.svg';
import { Receipt, ManageProtection, Currency } from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import styles from './billing-header.scss';

interface BillingHeaderProps {
    onTabChange: (tabIndex: number) => void;
    onMenuItemSelect: (item: string) => void;
    activeAdminComponent: string | null;
    activeTab: number;
    isAdminView?: boolean;
}

const BillingHeader: React.FC<BillingHeaderProps> = ({ 
    onTabChange, 
    onMenuItemSelect, 
    activeAdminComponent,
    activeTab,
    isAdminView = false 
}) => {
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const session = useSession();

    const userLocation = session?.sessionLocation?.display || 'Unknown Location';

    const handleTabClick = (event: { selectedIndex: number }) => {
        const index = event.selectedIndex;
        onTabChange(index);
    };

    const handleDateChange = (dates) => {
        if (dates.length > 0) {
            setSelectedDate(dates[0]);
        }
    };

    const handleMenuItemClick = (itemText: string) => {
        onMenuItemSelect(itemText);
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
                            {['Department', 'Service', 'Facility Service Price', 'Insurance', 'Third Party'].map((item) => (
                                <OverflowMenuItem 
                                    key={item}
                                    itemText={item}
                                    onClick={() => handleMenuItemClick(item)}
                                    className={activeAdminComponent === item ? styles.selectedMenuItem : ''}
                                />
                            ))}
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
                    <Tabs 
                        selected={activeAdminComponent || isAdminView ? -1 : activeTab} 
                        onChange={handleTabClick}
                    >
                        <TabList aria-label="Billing Navigation">
                            <Tab 
                                renderIcon={Receipt}
                                disabled={!!activeAdminComponent || isAdminView}
                            >
                                {t('bill', 'Bill')}
                            </Tab>
                            <Tab 
                                renderIcon={Currency}
                                disabled={!!activeAdminComponent || isAdminView}
                            >
                                {t('managePayments', 'Manage Payments')}
                            </Tab>
                        </TabList>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default BillingHeader;