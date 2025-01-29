import React from 'react';
import styles from './card.scss';

interface CardProps {
  title: string;
  details: { label: string; value: string }[];
}

const Card: React.FC<CardProps> = ({ title, details }) => {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>{title}</h4>
      <ul className={styles.details}>
        {details.map((detail, index) => (
          <li key={index}>
            <span className={styles.label}>{detail.label}:</span> {detail.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Card;
