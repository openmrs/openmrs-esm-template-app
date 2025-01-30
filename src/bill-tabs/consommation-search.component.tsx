import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { navigate, showToast } from '@openmrs/esm-framework';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Layer,
  Tile,
} from '@carbon/react';
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

    if (!searchResult || searchResult.length === 0 || searchResult.every(item => item === null)) {
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

    const headers = [
      { header: t('billIdentifier', 'Bill Identifier'), key: 'billId' },
      { header: t('insuranceCardNo', 'Insurance Card No.'), key: 'insuranceNo' },
      { header: t('patientNames', 'Patient Names'), key: 'patientName' },
      { header: t('department', 'Department'), key: 'department' },
      { header: t('createdDate', 'Created Date'), key: 'createdDate' },
      { header: t('amount', 'Amount (RWF)'), key: 'amount' },
      { header: t('status', 'Status'), key: 'status' },
    ];

    const rows = searchResult.map((result, index) => ({
      id: index.toString(),
      billId: result.billIdentifier,
      insuranceNo: result.admission.insurancePolicy.insuranceCardNo,
      patientName: result.admission.insurancePolicy.owner.display,
      department: result.department || 'N/A',
      createdDate: new Date(result.admission.admissionDate).toLocaleDateString(),
      amount: result.globalAmount,
      status: result.closed ? 'Closed' : 'Open',
    }));

    return (
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()} useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} onClick={() => handleRowClick(searchResult[parseInt(row.id)])}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
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
