import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchGlobalBillsByInsuranceCard } from '../api/billing';
import styles from './search-bill-header-cards.scss';

const SearchBillHeaderCards: React.FC = () => {
  const { t } = useTranslation();

  const [insuranceCardNumber, setInsuranceCardNumber] = useState('');
  const [billIdentifier, setBillIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (type: 'insurance' | 'bill') => {
    try {
      setErrorMessage('');
      setSearchResult([]);
      setHasSearched(true);

      if (type === 'insurance') {
        if (!insuranceCardNumber) {
          setErrorMessage(t('enterValue', 'Please enter a value to search.'));
          return;
        }

        const result = await fetchGlobalBillsByInsuranceCard(insuranceCardNumber);
        setSearchResult(result.results || []);
      } else if (type === 'bill') {
        if (!billIdentifier) {
          setErrorMessage(t('enterValue', 'Please enter a bill identifier.'));
          return;
        }

        // Replace this with the actual API call for searching by bill identifier
        setSearchResult([]); // This is a placeholder
      }
    } catch (error) {
      setErrorMessage(t('errorFetchingData', 'Error fetching data.'));
    }
  };

  const renderResults = () => {
    if (!hasSearched) {
      return null;
    }

    if (searchResult.length === 0) {
      return <p className={styles.noResults}>{t('noResults', 'No results found.')}</p>;
    }

    return (
      <div className={styles.results}>
        <h4>
          {t('resultFor', 'Result for')} "{insuranceCardNumber}": {searchResult.length}{' '}
          {t('beneficiaries', 'beneficiaries')}
        </h4>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>{t('insurancePolicyNo', 'Insurance Policy No.')}</th>
              <th>{t('insurance', 'Insurance')}</th>
              <th>{t('insuranceCardNo', 'Insurance Card No.')}</th>
              <th>{t('patientNames', 'Patient Names')}</th>
              <th>{t('age', 'Age')}</th>
              <th>{t('gender', 'Gender')}</th>
              <th>{t('birthdate', 'Birthdate')}</th>
            </tr>
          </thead>
          <tbody>
            {searchResult.map((result, index) => {
              const insurancePolicy = result.admission?.insurancePolicy || {};
              const patientNames = result.creator?.display || t('notAvailable', 'N/A');
              const age = result.age || t('notAvailable', 'N/A');
              const gender = result.gender || t('notAvailable', 'N/A');
              const birthdate = result.birthdate || t('notAvailable', 'N/A');

              return (
                <tr key={result.globalBillId || index}>
                  <td>{index + 1}</td>
                  <td>{insurancePolicy.insuranceCardNo || t('notAvailable', 'N/A')}</td>
                  <td>{result.insurance?.name || t('notAvailable', 'N/A')}</td>
                  <td>{insurancePolicy.insuranceCardNo || t('notAvailable', 'N/A')}</td>
                  <td>{patientNames}</td>
                  <td>{age}</td>
                  <td>{gender}</td>
                  <td>{birthdate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className={styles.container}>
      <div className={styles.tile}>
        <h3 className={styles.heading}>{t('findInsurancePolicy', 'Find An Existing Insurance Policy')}</h3>
        <div className={styles.searchWrapper}>
          <span className={styles.label}>{t('patientInsuranceCard', 'Patient Insurance Card Number')}</span>
          <input
            type="text"
            className={styles.inputField}
            value={insuranceCardNumber}
            onChange={(e) => setInsuranceCardNumber(e.target.value)}
            placeholder={t('searchPlaceholder', 'Enter card number to search')}
          />
        </div>
        <button className={styles.searchButton} onClick={() => handleSearch('insurance')}>
          {t('search', 'Search')}
        </button>
      </div>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      {renderResults()}

      <div className={styles.orWrapper}>
        <span className={styles.orText}>{t('or', 'Or')}</span>
      </div>

      {/* Search by Bill Identifier Tile */}
      <div className={styles.tile}>
        <h3 className={styles.heading}>{t('searchByBillIdentifier', 'Search by Bill Identifier')}</h3>
        <div className={styles.searchWrapper}>
          <span className={styles.label}>{t('billIdentifier', 'Bill Identifier ID')}</span>
          <input
            type="text"
            className={styles.inputField}
            value={billIdentifier}
            onChange={(e) => setBillIdentifier(e.target.value)}
            placeholder={t('billSearchPlaceholder', 'Enter bill identifier to search')}
          />
        </div>
        <button className={styles.searchButton} onClick={() => handleSearch('bill')}>
          {t('search', 'Search')}
        </button>
      </div>
    </section>
  );
};

export default SearchBillHeaderCards;
