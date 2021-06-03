import { useConfig } from '@openmrs/esm-react-utils';
import React from 'react';
import { Trans } from 'react-i18next';
import styles from './greeter.css';

const Root: React.FC = () => {
  const config = useConfig();

  return (
    <div style={styles.title}>
      {config.casualGreeting ? <Trans key="casualGreeting">Hey</Trans> : <Trans key="formalGreeting">Hello</Trans>}{' '}
      {config.whoToGreet.join(', ')}
    </div>
  );
};

export default Root;
