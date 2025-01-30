import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { DatePickerInput, DatePicker } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Location, UserFollow } from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import styles from './billing-admin-header.scss';
import BillingIllustration from './billing-illustration.component';
import { omrsDateFormat } from '../../constants';
import SelectedDateContext from '../../hooks/selectedDateContext';

interface BillingAdminHeaderProps {
  title: string;
}

const BillingAdminHeader: React.FC<BillingAdminHeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
  const location = session?.sessionLocation?.display;
  const { selectedDate, setSelectedDate } = useContext(SelectedDateContext);

  return (
    <div className={styles.header} data-testid="billing-header">
      <div className={styles['left-justified-items']}>
        <BillingIllustration />
        <div className={styles['page-labels']}>
          <p>{t('billing', 'Billing')}</p>
          <p className={styles['page-name']}>{title}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles.userContainer}>
          <p>{session?.user?.person?.display}</p>
          <UserFollow size={16} className={styles.userIcon} />
        </div>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{location}</span>
          <span className={styles.middot}>&middot;</span>
          <DatePicker
            onChange={([date]) => setSelectedDate(dayjs(date).startOf('day').format(omrsDateFormat))}
            value={dayjs(selectedDate).format('DD MMM YYYY')}
            dateFormat="d-M-Y"
            datePickerType="single"
          >
            <DatePickerInput
              style={{ cursor: 'pointer', backgroundColor: 'transparent', border: 'none', maxWidth: '10rem' }}
              id="appointment-date-picker"
              placeholder="DD-MMM-YYYY"
              labelText=""
              type="text"
            />
          </DatePicker>
        </div>
      </div>
    </div>
  );
};

export default BillingAdminHeader;
