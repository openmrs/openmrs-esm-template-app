import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchGlobalBillsByInsuranceCard } from '../api/billing';
import styles from './search-bill-header-cards.scss';
import { isDesktop, navigate, useLayoutType } from '@openmrs/esm-framework';
import { DataTableSkeleton, Layer, Tile } from '@carbon/react';

const SearchInsurance: React.FC = () => {
  const { t } = useTranslation();
  const [insuranceCardNumber, setInsuranceCardNumber] = useState('');
  const [billIdentifier, setBillIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';

  const handleSearch = async (type: 'insurance' | 'bill') => {
    setErrorMessage('');
    setSearchResult([]);
    setHasSearched(true);
    setLoading(true);

    try {
      if (type === 'insurance') {
        if (!insuranceCardNumber) {
          setErrorMessage(t('enterValue', 'Please enter a value to search.'));
          return;
        }
        const result = await fetchGlobalBillsByInsuranceCard(insuranceCardNumber);
        if (result?.results?.length === 0) {
          setErrorMessage(t('noResults', 'No results found.'));
        } else {
          setSearchResult(result.results || []);
        }
      } else if (type === 'bill') {
        if (!billIdentifier) {
          setErrorMessage(t('enterValue', 'Please enter a bill identifier.'));
          return;
        }
        // Replace this with the actual API call for searching by bill identifier
        setSearchResult([]); // Placeholder logic for now
      }
    } catch (error) {
      setErrorMessage(t('errorFetchingData', 'An error occurred while fetching data.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (result) => {
    navigate({ to: window.getOpenmrsSpaBase() + `home/billing/invoice/${result.insuranceCardNo}` });
  };

  const renderResultsTable = () => {
    if (!hasSearched) {
      return null;
    }

    if (!searchResult || searchResult.length === 0 || searchResult.every((item) => item === null)) {
      return (
        <div className={styles.filterEmptyState}>
          <Layer>
            <Tile className={styles.filterEmptyStateTile}>
              <p className={styles.filterEmptyStateContent}>
                {t('noMatchingItemsToDisplay', 'No matching items to display')}
              </p>
              <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
            </Tile>
          </Layer>
        </div>
      );
    }

    return (
      <table className={styles.resultsTable}>
        <thead>
          <tr>
            <th>Insurance Policy No.</th>
            <th>Insurance</th>
            <th>Insurance Card No.</th>
            <th>Patient Names</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Birthdate</th>
          </tr>
        </thead>
        <tbody>
          {searchResult.map((result, index) => (
            <tr
              key={index}
              onClick={() => handleRowClick(result)}
              className={styles.tableRow}
            >
              <td>{result.insuranceCardNo || 'N/A'}</td>
              <td>{result.insurance || 'N/A'}</td>
              <td>{result.insuranceCardNo || 'N/A'}</td>
              <td>{result.owner?.person?.display || 'N/A'}</td>
              <td>{result.owner?.person?.age || 'N/A'}</td>
              <td>{result.owner?.person?.gender || 'N/A'}</td>
              <td>
                {result.owner?.person?.birthdate ? new Date(result.owner.person.birthdate).toLocaleDateString() : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
        {!loading && (
          <button className={styles.searchButton} onClick={() => handleSearch('insurance')} disabled={loading}>
            {t('search', 'Search')}
          </button>
        )}
      </div>

      {loading && (
        <div className={styles.loaderContainer}>
          <DataTableSkeleton
            data-testid="loader"
            columnCount={3}
            showHeader={false}
            showToolbar={false}
            size={responsiveSize}
            zebra
          />
        </div>
      )}
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      {renderResultsTable()}
    </section>
  );
};

export default SearchInsurance;
