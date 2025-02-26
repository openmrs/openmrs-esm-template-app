import React, { useMemo } from 'react';
import { InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import Card from './card.component';
import { useBillMetrics } from './metrics.resources';
import styles from './metrics-cards.scss';

interface MetricsCardsProps {
  bills: Array<any>;
  isLoading?: boolean;
  error?: Error | null;
}
const MetricsCards: React.FC<MetricsCardsProps> = ({ bills, isLoading = false, error = null }) => {
  const { t } = useTranslation();
  const { cumulativeBills, pendingBills, paidBills } = useBillMetrics(bills);

  const cards = useMemo(
    () => [
      { title: 'Cumulative Bills', count: cumulativeBills },
      { title: 'Pending Bills', count: pendingBills },
      { title: 'Paid Bills', count: paidBills },
    ],
    [cumulativeBills, pendingBills, paidBills],
  );

  if (isLoading) {
    return (
      <section className={styles.container}>
        <InlineLoading status="active" iconDescription="Loading" description={t('loadingBillMetrics', 'Loading bill metrics...')} />
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.container}>
        <p className={styles.error}>{t('errorLoadingMetrics', 'Error loading metrics')}</p>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      {cards.map((card) => (
        <Card key={card.title} title={card.title} count={card.count} />
      ))}
    </section>
  );
};

export default MetricsCards;
