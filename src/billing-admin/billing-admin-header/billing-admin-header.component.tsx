import React from 'react';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import BackButton from '../../components/back-button';
import styles from './billing-admin-header.scss';

interface BillingAdminHeaderProps {
  title: string;
  onBack: () => void;
  showAddButton?: boolean;
  onAdd?: () => void;
  addButtonLabel?: string;
}

const BillingAdminHeader: React.FC<BillingAdminHeaderProps> = ({ 
  title, 
  onBack, 
  showAddButton = true,
  onAdd,
  addButtonLabel = 'Add New'
}) => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerLeft}>
        <h4>{title}</h4>
        <BackButton onBack={onBack} />
      </div>
      {showAddButton && (
        <Button 
          renderIcon={(props) => <Add size={16} {...props} />}
          onClick={onAdd}
        >
          {addButtonLabel}
        </Button>
      )}
    </div>
  );
};

export default BillingAdminHeader;
