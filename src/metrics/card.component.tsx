import  React, { useMemo} from 'react';
import { useTranslation } from 'react-i18next';
import styles from './metrics-cards.scss';

interface CardProps {
  title: string;
  count: number;
}

const Card: React.FC<CardProps> = ({ title, count }) => {
  const { t } = useTranslation();
  
  const formattedCount = useMemo(() => `RWF ${count.toFixed(2)}`, [count]);

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{t(title.toLowerCase().replace(/\s/g, ''), title)}</h3>
      <p className={styles.cardCount}>{formattedCount}</p>
    </div>
  );
};

export default Card;