import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { navigate, showToast } from '@openmrs/esm-framework';
import { getConsommationById } from '../api/billing';
import styles from './search-bill-header-cards.scss';

const ConsommationSearch: React.FC = () => {
  const { t } = useTranslation();
  const [consommationIdentifier, setConsommationIdentifier] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConsommationSearch = async () => {
    setErrorMessage('');
    setSearchResult([]);
    setHasSearched(true);
    setIsLoading(true);

    try {
      if (!consommationIdentifier) {
        setErrorMessage(t('enterValue', 'Please enter a consommation identifier.'));
        return;
      }

      const result = await getConsommationById(consommationIdentifier);
      
      if (!result) {
        setErrorMessage(t('noResults', 'No results found.'));
      } else {
        const transformedResult = [{
          consommationId: result.consommationId,
          billIdentifier: `CONS-${result.consommationId}`,
          admission: {
            insurancePolicy: {
              insuranceCardNo: result.patientBill.policyIdNumber,
              owner: {
                display: result.patientBill.beneficiaryName
              }
            },
            admissionDate: result.patientBill.createdDate,
            dischargingDate: null
          },
          globalAmount: result.patientBill.amount,
          closed: result.patientBill.payments?.length > 0,
          department: result.department.name
        }];
        setSearchResult(transformedResult);
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
    navigate({ to: `${window.getOpenmrsSpaBase()}home/billing/consommation/${result.consommationId}` });
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
              <td>{result.billIdentifier}</td>
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
        <h3 className={styles.heading}>{t('searchByConsommation', 'Search Consommation')}</h3>
        <div className={styles.searchWrapper}>
          <span className={styles.label}>{t('consommationIdentifier', 'Consommation Identifier')}</span>
          <input
            type="text"
            className={styles.inputField}
            value={consommationIdentifier}
            onChange={(e) => setConsommationIdentifier(e.target.value)}
            placeholder={t('consommationPlaceholder', 'Enter consommation ID to search')}
          />
          <button 
            className={styles.searchButton} 
            onClick={handleConsommationSearch} 
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

export default ConsommationSearch;
