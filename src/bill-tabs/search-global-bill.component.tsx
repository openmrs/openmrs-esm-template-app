import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { navigate, showToast } from '@openmrs/esm-framework';
import { getGlobalBillByIdentifier, getConsommationById } from '../api/billing';
import styles from './search-global-bill.scss';

const SearchGlobalBill: React.FC = () => {
  const { t } = useTranslation();
  const [globalBillIdentifier, setGlobalBillIdentifier] = useState('');
  const [consommationIdentifier, setConsommationIdentifier] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isGlobalBillLoading, setIsGlobalBillLoading] = useState(false);
  const [isConsommationLoading, setIsConsommationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGlobalBillSearch = async () => {
    setErrorMessage('');
    setSearchResult([]);
    setHasSearched(true);
    setIsGlobalBillLoading(true);

    try {
      if (!globalBillIdentifier) {
        setErrorMessage(t('enterValue', 'Please enter a global bill identifier.'));
        setIsGlobalBillLoading(false);
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
      setIsGlobalBillLoading(false);
    }
  };

  const handleConsommationSearch = async () => {
    setErrorMessage('');
    setSearchResult([]);
    setHasSearched(true);
    setIsConsommationLoading(true);

    try {
      if (!consommationIdentifier) {
        setErrorMessage(t('enterValue', 'Please enter a consommation identifier.'));
        setIsConsommationLoading(false);
        return;
      }

      const result = await getConsommationById(consommationIdentifier);
      
      if (!result) {
        setErrorMessage(t('noResults', 'No results found.'));
      } else {
        // Transform consommation data to match table format
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
      setIsConsommationLoading(false);
    }
  };

  const handleRowClick = (result) => {
    if (result.consommationId) {
      navigate({ to: `${window.getOpenmrsSpaBase()}home/billing/consommation/${result.consommationId}` });
    } else {
      navigate({ to: `${window.getOpenmrsSpaBase()}home/billing/invoice/${result.admission.insurancePolicy.insuranceCardNo}` });
    }
  };

  const renderResultsTable = () => {
    if (!hasSearched || isGlobalBillLoading || isConsommationLoading) {
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
      {/* Search Global Bill Tile */}
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
            disabled={isGlobalBillLoading}
          >
            {isGlobalBillLoading ? t('searching', 'Searching...') : t('search', 'Search')}
          </button>
        </div>
      </div>
      {renderResultsTable()}
      <div className={styles.orWrapper}>
        <span className={styles.orText}>{t('or', 'Or')}</span>
      </div>

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
            disabled={isConsommationLoading}
          >
            {isConsommationLoading ? t('searching', 'Searching...') : t('search', 'Search')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchGlobalBill;
