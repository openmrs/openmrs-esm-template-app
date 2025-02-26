import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import styles from './billing-admin-card.module.scss'; // Ensure styles are imported

const BillingAdminCardLink: React.FC = () => {
  const { t } = useTranslation();
  const header = t('manageBillingAdmin', 'Manage Billing');

  return (
    <Layer className="billing-admin-card">  {/* ✅ Add class here */}
      <ClickableTile
        href={`${window.spaBase}/billing-admin`}
        target="_blank"
        rel="noopener noreferrer"
        className="billing-admin-card"  // ✅ Add class here
      >
        <div>
          <div className="heading">{header}</div>
          <div className="content">{t('billingAdmin', 'Billing Admin')}</div>
        </div>
        <div className="iconWrapper">
          <ArrowRight size={16} />
        </div>
      </ClickableTile>
    </Layer>
  );
};

export default BillingAdminCardLink;
