import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './billing.scss';
import PaymentsDeskIcon from './images/payments-desk-icon.svg';
import BillConfirmation from './bill-tabs/bill-confirmation.component';
import SearchInsurance from './bill-tabs/search-insurance.component';
import GlobalBillSearch from './bill-tabs/global-bill-search.component';
import ConsommationSearch from './bill-tabs/consommation-search.component';
import BillListTable from './recent-bills/bill-list-table.component';
import { 
  RadioButtonGroup,
  RadioButton,
  DatePicker,
  DatePickerInput
} from '@carbon/react';
import { useSession } from '@openmrs/esm-framework';
import { getGlobalBillSummary } from './api/billing';

type SearchOption = 'bill-confirmation' | 'search-insurance' | 'global-bill' | 'consommation';

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const session = useSession();
  const [activeOption, setActiveOption] = useState<SearchOption>('search-insurance');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const userLocation = session?.sessionLocation?.display || 'Unknown Location';

  // State for fetched metrics
  const [metrics, setMetrics] = useState({
    cumulativeBills: 0,
    pendingBills: 0,
    paidBills: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getGlobalBillSummary();
        setMetrics({
          cumulativeBills: data.total,
          pendingBills: data.open,
          paidBills: data.closed
        });
      } catch (err) {
        console.error('Failed to fetch bill summary:', err);
        setError('Failed to load bill summary');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatCurrency = (value: number): string => {
    return `RWF ${value.toFixed(2)}`;
  };

  const handleOptionChange = (selected: any): void => {
    const value = typeof selected === 'object' && selected !== null ? 
      selected.target?.value || selected.selectedItem?.value || selected : 
      selected;
    
    setActiveOption(value as SearchOption);
  };

  const handleDateChange = (dates) => {
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  };

  return (
    <div className={styles.billingWrapper} id="billing-component-instance">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerWrapper}>
          <div className={styles.headerContainer}>
            <div className={styles.headerContent}>
              <div className={styles.leftSection}>
                <img src={PaymentsDeskIcon} alt="Payments Desk Icon" className={styles.headerIcon} />
                <div>
                  <p className={styles.location}>{userLocation}</p>
                  <p className={styles.billingTitle}>Billing</p>
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
          </div>
        </div>

        {/* Metrics Cards */}
        <div className={styles.metricsContainer}>
          {loading ? (
            <p>Loading metrics...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <div className={styles.metricsCards}>
              <div className={styles.metricCard}>
                <h3 className={styles.metricTitle}>{t('cumulativeBills', 'Cumulative Bills')}</h3>
                <p className={styles.metricValue}>{formatCurrency(metrics.cumulativeBills)}</p>
              </div>
              <div className={styles.metricCard}>
                <h3 className={styles.metricTitle}>{t('pendingBills', 'Pending Bills')}</h3>
                <p className={styles.metricValue}>{formatCurrency(metrics.pendingBills)}</p>
              </div>
              <div className={styles.metricCard}>
                <h3 className={styles.metricTitle}>{t('paidBills', 'Paid Bills')}</h3>
                <p className={styles.metricValue}>{formatCurrency(metrics.paidBills)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Radio Navigation */}
        <div className={styles.radioNavigationContainer}>
          <RadioButtonGroup
            name="billing-option"
            valueSelected={activeOption}
            onChange={handleOptionChange}
            orientation="horizontal"
          >
            <RadioButton id="bill-confirmation" labelText={t('billConfirmation', 'Bill Confirmation')} value="bill-confirmation" />
            <RadioButton id="search-insurance" labelText={t('searchInsurancePolicy', 'Search Insurance Policy')} value="search-insurance" />
            <RadioButton id="global-bill" labelText={t('searchGlobalBill', 'Search Global Bill')} value="global-bill" />
            <RadioButton id="consommation" labelText={t('searchConsommations', 'Search Consommations')} value="consommation" />
          </RadioButtonGroup>
        </div>

        <div className={styles.content}>
          {activeOption === 'bill-confirmation' && <BillConfirmation />}
          {activeOption === 'search-insurance' && <SearchInsurance />}
          {activeOption === 'global-bill' && <GlobalBillSearch />}
          {activeOption === 'consommation' && <ConsommationSearch />}
          <BillListTable />
        </div>
      </div>
    </div>
  );
};

export default Billing;
