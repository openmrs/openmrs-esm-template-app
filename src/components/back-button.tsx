import React from 'react';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  onBack: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  const { t } = useTranslation();
  
  return (
    <Button
      kind="ghost"
      renderIcon={ArrowLeft}
      onClick={onBack}
      size="sm"
    >
      {t('back', 'Back')}
    </Button>
  );
};

export default BackButton;
