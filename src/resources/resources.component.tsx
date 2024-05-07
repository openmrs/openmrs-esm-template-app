import React from 'react';
import { ClickableTile } from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './resources.scss';

function Resources() {
  const { t } = useTranslation();

  return (
    <div className={styles.resources}>
      <h4 className={styles.heading}>{t('resources', 'Resources')}</h4>
      <span className={styles.explainer}>{t('usefulLinks', 'Below are some links to useful resources')}:</span>
      <div className={styles.cardsContainer}>
        <Card
          title={t('getStarted', 'Get started')}
          subtitle={t('getStartedExplainer', 'Create a frontend module from this template') + '.'}
          link="https://github.com/openmrs/openmrs-esm-template-app/generate"
        />
        <Card
          title={t('frontendDocs', 'Frontend docs')}
          subtitle={t('learnExplainer', 'Learn how to use the O3 framework') + '.'}
          link="https://o3-docs.vercel.app"
        />
        <Card
          title={t('designDocs', 'Design docs')}
          subtitle={t('designDocsExplainer', 'Read the O3 design documentation') + '.'}
          link="https://zeroheight.com/23a080e38/p/880723-introduction"
        />
        <Card
          title={t('connect', 'Connect')}
          subtitle={t('connectExplainer', 'Get in touch with the community') + '.'}
          link="https://slack.openmrs.org/"
        />
      </div>
    </div>
  );
}

function Card({ title, subtitle, link }: { title: string; subtitle: string; link: string }) {
  return (
    <ClickableTile className={styles.card} href={link} target="_blank" rel="noopener noreferrer">
      <div className={styles.cardContent}>
        <div className={styles.title}>
          <h4>{title}</h4>
          <ChevronRight />
        </div>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
    </ClickableTile>
  );
}

export default Resources;
