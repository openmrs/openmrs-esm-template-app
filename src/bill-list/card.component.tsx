import React from 'react';
import { Layer, Stack, ClickableTile } from '@carbon/react';
import { Information } from '@carbon/react/icons';
import styles from './card.scss';

interface CardProps {
  title: string;
  details: { label: string; value: string }[];
}

const Card: React.FC<CardProps> = ({ title, details }) => {
  return (
    <Layer>
      <ClickableTile className={styles.card}>
        <Stack gap={5}>
          <div className={styles.header}>
            <Information size={20} />
            <h4>{title}</h4>
          </div>
          <dl className={styles.detailsList}>
            {details.map(({ label, value }, index) => (
              <div key={index} className={styles.detailItem}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Stack>
      </ClickableTile>
    </Layer>
  );
};

export default Card;
