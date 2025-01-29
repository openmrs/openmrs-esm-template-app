import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { navigate, showToast } from '@openmrs/esm-framework';
import { getGlobalBillByIdentifier } from '../api/billing';
import styles from './search-bill-header-cards.scss';

const GlobalBillSearch: React.FC = () => {
  const { t } = useTranslation();
  const [globalBillIdentifier, setGlobalBillIdentifier] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGlobalBillSearch = async () => {
    setErrorMessage('');
    setSearchResult([]);
    setHasSearched(true);
    setIsLoading(true);

    try {
      if (!globalBillIdentifier) {
        setErrorMessage(t('enterValue', 'Please enter a global bill identifier.'));
        return;
      }

      const result = await getGlobalBillByIdentifier(globalBillIdentifier);
      
      if (!result?.results || result.results.length === 0) {
        setErrorMessage(t('noResults', 'No results found.'));
      } else {
        const validResults = result.results.filter(item => item !== null);
        if (validResults.length === 0) {
          setErrorMessage(t('noResults', 'No results found.'));
        } else {
          setSearchResult(validResults);
        }
      }
    } catch (error) {
      setErrorMessage(t('errorFetchingData', 'An error occurred while fetching data.'));
      showToast({
        title: t('error', 'Error'),
        description: error.message,
        kind: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (result) => {
    navigate({ to: `${window.getOpenmrsSpaBase()}home/billing/invoice/${result.admission.insurancePolicy.insuranceCardNo}` });
  };

  const renderResultsTable = () => {
    if (!hasSearched || isLoading) {
      return null;
    }

    if (errorMessage) {
      return <p className={styles.noResults}>{errorMessage}</p>;
    }

    if (!searchResult || searchResult.length === 0 || searchResult.every(item => item === null)) {
      return <p className={styles.noResults}>{t('noResults', 'No results found.')}</p>;
    }

    return (
      <table className={styles.resultsTable}>
        <thead>
          <tr>
            <th>{t('billIdentifier', 'Bill Identifier')}</th>
            <th>{t('insuranceCardNo', 'Insurance Card No.')}</th>
            <th>{t('patientNames', 'Patient Names')}</th>
            <th>{t('department', 'Department')}</th>
            <th>{t('createdDate', 'Created Date')}</th>
            <th>{t('amount', 'Amount (RWF)')}</th>
            <th>{t('status', 'Status')}</th>
          </tr>
        </thead>
        <tbody>
          {searchResult.map((result, index) => (
            <tr
              key={index}
              onClick={() => handleRowClick(result)}
              className={styles.tableRow}
            >
              <td>{result.billIdentifier || result.globalBillIdentifier}</td>
              <td>{result.admission.insurancePolicy.insuranceCardNo}</td>
              <td>{result.admission.insurancePolicy.owner.display}</td>
              <td>{result.department || 'N/A'}</td>
              <td>{new Date(result.admission.admissionDate).toLocaleDateString()}</td>
              <td>{result.globalAmount}</td>
              <td>{result.closed ? 'Closed' : 'Open'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <section className={styles.container}>
      <div className={styles.tile}>
        <h3 className={styles.heading}>{t('findGlobalBill', 'Search Global Bill')}</h3>
        <div className={styles.searchWrapper}>
          <span className={styles.label}>{t('globalBillIdentifier', 'Global Bill Identifier')}</span>
          <input
            type="text"
            className={styles.inputField}
            value={globalBillIdentifier}
            onChange={(e) => setGlobalBillIdentifier(e.target.value)}
            placeholder={t('globalBillPlaceholder', 'Enter global bill number to search')}
          />
          <button 
            className={styles.searchButton} 
            onClick={handleGlobalBillSearch} 
            disabled={isLoading}
          >
            {isLoading ? t('searching', 'Searching...') : t('search', 'Search')}
          </button>
        </div>
      </div>
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      {renderResultsTable()}
    </section>
  );
};

export default GlobalBillSearch;
