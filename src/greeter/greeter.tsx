/**
 * This component demonstrates usage of the config object. Its structure
 * comes from `../config-schema.ts`. For more information about the
 * configuration system, please see that file.
 */
import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { Trans } from 'react-i18next';
import { Config } from '../config-schema';
import styles from './greeter.css';

export const Greeter: React.FC = () => {
  const config = useConfig() as Config;

  return (
    <div className={styles.greeting}>
      {config.casualGreeting ? <Trans key="casualGreeting">hey</Trans> : <Trans key="formalGreeting">hello</Trans>}{' '}
      {config.whoToGreet.join(', ')}!
    </div>
  );
};
