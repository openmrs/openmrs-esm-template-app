import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast } from '@openmrs/esm-framework';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Layer,
  Tile,
  Search,
  Button,
  Form,
  Stack,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  DataTableSkeleton
} from '@carbon/react';
import { getConsommationById } from '../api/billing';
import BillItemsTable from '../consommation/bill-items-table.component';
import styles from './search-bill-header-cards.scss';

const ConsommationSearch = () => {
  const { t } = useTranslation();
  const [consommationIdentifier, setConsommationIdentifier] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [consommationDetails, setConsommationDetails] = useState(null);

  const handleConsommationSearch = async () => {
    setErrorMessage('');
    setSearchResult([]);
    setHasSearched(true);
    setIsLoading(true);
    setExpandedRowId(null);
    setConsommationDetails(null);

    try {
      if (!consommationIdentifier) {
        setErrorMessage(t('enterValue', 'Please enter a consommation identifier.'));
        setIsLoading(false);
        return;
      }

      const result = await getConsommationById(consommationIdentifier);
      
      if (!result) {
        setErrorMessage(t('noResults', 'No results found.'));
      } else {
        // Store the full result in state for later use
        setConsommationDetails(result);
        
        const transformedResult = [{
          id: '1', // Fixed ID for single row
          consommationId: result.consommationId,
          billIdentifier: `CONS-${result.consommationId}`,
          insuranceCardNo: result.patientBill.policyIdNumber || 'N/A',
          patientName: result.patientBill.beneficiaryName || 'N/A',
          department: result.department?.name || 'N/A',
          createdDate: result.patientBill.createdDate 
            ? new Date(result.patientBill.createdDate).toLocaleDateString() 
            : 'N/A',
          amount: result.patientBill.amount || 0,
          status: result.patientBill.payments?.length > 0 ? 'Closed' : 'Open'
        }];
        
        setSearchResult(transformedResult);
        
        // Auto-expand the row if there's only one result
        setExpandedRowId('1');
      }
    } catch (error) {
      console.error('Search error:', error);
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

  const headers = [
    { key: 'billIdentifier', header: t('billIdentifier', 'Bill Identifier') },
    { key: 'insuranceCardNo', header: t('insuranceCardNo', 'Insurance Card No.') },
    { key: 'patientName', header: t('patientNames', 'Patient Names') },
    { key: 'department', header: t('department', 'Department') },
    { key: 'createdDate', header: t('createdDate', 'Created Date') },
    { key: 'amount', header: t('amount', 'Amount (RWF)') },
    { key: 'status', header: t('status', 'Status') }
  ];

  const renderEmptyState = () => {
    if (!hasSearched || searchResult.length > 0) return null;
    
    return (
      <div className={styles.filterEmptyState}>
        <Layer>
          <Tile className={styles.filterEmptyStateTile}>
            <p className={styles.filterEmptyStateContent}>
              {t('noMatchingItemsToDisplay', 'No matching items to display')}
            </p>
          </Tile>
        </Layer>
      </div>
    );
  };

  const handleRowExpand = (row) => {
    // Toggle row expansion
    setExpandedRowId(expandedRowId === row.id ? null : row.id);
  };

  const renderBillDetails = () => {
    // Make sure we have consommation details before rendering
    if (!consommationDetails) {
      return (
        <div className={styles.expandedContent}>
          <p>No details available</p>
        </div>
      );
    }

    return (
      <div className={styles.expandedContent}>
        <div className={styles.detailsHeader}>
          <h4>{t('patientBillPayment', 'Patient Bill Payment')}</h4>
          <p><strong>{t('consommationNumber', 'Consommation #')}:</strong> {consommationDetails.consommationId}</p>
          <p><strong>{t('department', 'Department')}:</strong> {consommationDetails.department?.name || 'N/A'}</p>
        </div>

        <Tabs className={styles.detailsTabs}>
          <TabList aria-label="Bill Details">
            <Tab>{t('billItems', 'Bill Items')}</Tab>
            <Tab>{t('payments', 'Payments')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {!consommationDetails.billItems ? (
                <div className={styles.noData}>No bill items available</div>
              ) : (
                <BillItemsTable 
                  items={consommationDetails.billItems} 
                  insuranceRate={
                    (consommationDetails.insuranceBill && consommationDetails.patientBill && 
                     consommationDetails.patientBill.amount > 0) 
                      ? (consommationDetails.insuranceBill.amount / 
                         (consommationDetails.patientBill.amount + consommationDetails.insuranceBill.amount)) * 100 
                      : 0
                  }
                />
              )}
            </TabPanel>
            <TabPanel>
              <p>{t('paymentsInfo', 'Payment information will be displayed here.')}</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Form className={styles.searchContainer}>
        <Stack gap={5}>
          <h4 className={styles.heading}>{t('searchByConsommation', 'Search Consommation')}</h4>
          <div className={styles.searchForm}>
            <label htmlFor="consommationSearch" className={styles.label}>
              {t('consommationIdentifier', 'Consommation Identifier')}
            </label>
            <Search
              id="consommationSearch"
              labelText=""
              placeholder={t('consommationPlaceholder', 'Enter consommation ID to search')}
              value={consommationIdentifier}
              onChange={(e) => setConsommationIdentifier(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConsommationSearch();
                }
              }}
              size="lg"
            />
            <Button
              onClick={handleConsommationSearch}
              disabled={isLoading}
              kind="primary"
            >
              {isLoading ? t('searching', 'Searching...') : t('search', 'Search')}
            </Button>
          </div>
        </Stack>
      </Form>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      
      {isLoading ? (
        <DataTableSkeleton columnCount={headers.length} rowCount={3} />
      ) : hasSearched && searchResult.length > 0 ? (
        <DataTable rows={searchResult} headers={headers} useZebraStyles>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()} useZebraStyles>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow 
                      {...getRowProps({ row })}
                      isExpanded={expandedRowId === row.id}
                      onExpand={() => handleRowExpand(row)}
                    >
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {expandedRowId === row.id && (
                      <TableExpandedRow colSpan={headers.length + 1}>
                        {renderBillDetails()}
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
};

export default ConsommationSearch;
