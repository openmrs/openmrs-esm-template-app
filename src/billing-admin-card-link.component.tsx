import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';

const BillingAdminCardLink: React.FC = () => {
  const { t } = useTranslation();
  const header = t('manageBillingAdmin', 'Manage Billing');

  return (
    <Layer>
      <ClickableTile href={`${window.spaBase}/billing-admin`} target="_blank" rel="noopener noreferrer">
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
