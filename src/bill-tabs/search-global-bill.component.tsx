import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './search-global-bill.scss';

const SearchGlobalBill: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className={styles.container}>
      {/* Search Global Bill Tile */}
      <div className={styles.tile}>
        <h3 className={styles.heading}>{t('findGlobalBill', 'Search Global Bill')}</h3>
        <div className={styles.searchWrapper}>
          <span className={styles.label}>{t('globalBillIdentifier', 'Global Bill Identifier')}</span>
          <input
            type="text"
            className={styles.inputField}
            placeholder={t('globalBillPlaceholder', 'Enter global bill number to search')}
          />
        </div>
      </div>
      <div className={styles.orWrapper}>
        <span className={styles.orText}>{t('or', 'Or')}</span>
      </div>

      {/* Search by Consommation Tile */}
      <div className={styles.tile}>
        <h3 className={styles.heading}>{t('searchByConsommation', 'Search Consommation')}</h3>
        <div className={styles.searchWrapper}>
          <span className={styles.label}>{t('consommationIdentifier', 'Consommation Identifier')}</span>
          <input
            type="text"
            className={styles.inputField}
            placeholder={t('consommationPlaceholder', 'Enter consommation ID to search')}
          />
        </div>
        <button className={styles.searchButton}>{t('search', 'Search')}</button>
      </div>
    </section>
  );
};

export default SearchGlobalBill;
