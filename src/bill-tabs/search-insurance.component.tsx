import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isDesktop, navigate, useLayoutType } from '@openmrs/esm-framework';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
  Search,
  Form,
  Stack,
  Layer,
  Tile,
} from '@carbon/react';
import { fetchGlobalBillsByInsuranceCard } from '../api/billing';
import styles from './search-bill-header-cards.scss';
import { debounce } from 'lodash';

// Define TypeScript types
type SearchResultItem = {
  insuranceCardNo: string;
  insurance: string;
  owner?: {
    person?: {
      display: string;
      age: number;
      gender: string;
      birthdate: string;
    };
  };
};

type TableRow = {
  id: string;
  policyNo: string;
  insurance: string;
  cardNo: string;
  patientName: string;
  age: string | number;
  gender: string;
  birthdate: string;
};

type SearchType = 'insurance' | 'bill';

type TableHeader = {
  header: string;
  key: string;
};

/**
 * SearchInsurance component for finding insurance policies
 * by insurance card number or bill identifier
 */
const SearchInsurance: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  
  // State management
  const [insuranceCardNumber, setInsuranceCardNumber] = useState('');
  const [billIdentifier, setBillIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Responsive sizing based on layout
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  
  // Minimum characters required before triggering search
  const MIN_SEARCH_LENGTH = 3;

  /**
   * Handle search execution
   * @param type - Type of search (insurance or bill)
   * @param value - The search value to use
   */
  const executeSearch = async (type: SearchType, value: string) => {
    // Reset error state
    setErrorMessage('');
    
    // Don't search if input is too short
    if (!value || value.trim().length < MIN_SEARCH_LENGTH) {
      if (value.trim().length > 0) {
        setErrorMessage(t('enterMoreChars', `Please enter at least ${MIN_SEARCH_LENGTH} characters to search.`));
      }
      setSearchResult([]);
      return;
    }
    
    setLoading(true);

    try {
      if (type === 'insurance') {
        const result = await fetchGlobalBillsByInsuranceCard(value.trim());
        
        // Validate and sanitize API results
        if (!result || !Array.isArray(result.results) || result.results.length === 0) {
          setErrorMessage(t('noResults', 'No results found.'));
          setSearchResult([]);
        } else {
          // Filter out null values and validate required fields
          const validResults = result.results
            .filter(item => item !== null && item !== undefined)
            .map(item => ({
              ...item,
              // Ensure required properties exist with default values if needed
              insuranceCardNo: item.insuranceCardNo || '',
              insurance: item.insurance || '',
              owner: item.owner || { person: {} }
            }));
            
          setSearchResult(validResults);
          setErrorMessage(validResults.length === 0 ? t('noResults', 'No results found.') : '');
        }
      } else if (type === 'bill') {
        // Replace this with the actual API call for searching by bill identifier
        // For now, just using an empty array as placeholder
        setSearchResult([]);
        setErrorMessage(t('noResults', 'No results found.'));
      }
    } catch (error) {
      setErrorMessage(t('errorFetchingData', 'An error occurred while fetching data.'));
      console.error('Search error:', error);
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a debounced version of the search function to avoid too many API calls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((type: SearchType, value: string) => {
      executeSearch(type, value);
    }, 300),
    []
  );
  
  // Trigger search when input changes
  useEffect(() => {
    if (insuranceCardNumber.trim() !== '') {
      debouncedSearch('insurance', insuranceCardNumber);
    } else {
      setSearchResult([]);
      setErrorMessage('');
    }
  }, [insuranceCardNumber, debouncedSearch]);

  /**
   * Navigate to invoice details when a row is clicked
   * @param result - The selected search result item
   */
  const handleRowClick = (result: SearchResultItem | null) => {
    if (!result || !result.insuranceCardNo) {
      console.error('Cannot navigate: Invalid result or missing insurance card number');
      return;
    }
    
    navigate({ 
      to: window.getOpenmrsSpaBase() + `home/billing/invoice/${result.insuranceCardNo}` 
    });
  };

  /**
   * Format search results as table data
   * @returns Formatted headers and rows for the data table
   */
  const getTableData = () => {
    const headers: TableHeader[] = [
      { header: t('policyNo', 'Insurance Policy No.'), key: 'policyNo' },
      { header: t('insurance', 'Insurance'), key: 'insurance' },
      { header: t('cardNo', 'Insurance Card No.'), key: 'cardNo' },
      { header: t('patientName', 'Patient Names'), key: 'patientName' },
      { header: t('age', 'Age'), key: 'age' },
      { header: t('gender', 'Gender'), key: 'gender' },
      { header: t('birthdate', 'Birthdate'), key: 'birthdate' },
    ];

    // Filter out any null results before mapping
    const filteredResults = searchResult.filter(result => result !== null);
    
    const rows: TableRow[] = filteredResults.map((result, index) => {
      // Set default values to avoid null reference errors
      const notAvailable = t('notAvailable', 'N/A');
      
      return {
        id: index.toString(),
        policyNo: result?.insuranceCardNo || notAvailable,
        insurance: result?.insurance || notAvailable,
        cardNo: result?.insuranceCardNo || notAvailable,
        patientName: result?.owner?.person?.display || notAvailable,
        age: result?.owner?.person?.age || notAvailable,
        gender: result?.owner?.person?.gender || notAvailable,
        birthdate: result?.owner?.person?.birthdate 
          ? new Date(result.owner.person.birthdate).toLocaleDateString() 
          : notAvailable,
      };
    });

    return { headers, rows };
  };

  /**
   * Render the results table or empty state
   */
  const renderResultsTable = () => {
    // If there's no input at all, don't show anything
    if (!insuranceCardNumber.trim()) {
      return null;
    }

    // Check if we have valid results by filtering out nulls first
    const validResults = searchResult.filter(item => item !== null);
    const hasNoResults = !validResults || validResults.length === 0;

    if (hasNoResults && !loading) {
      return (
        <div className={styles.filterEmptyState}>
          <Layer>
            <Tile className={styles.filterEmptyStateTile}>
              <p className={styles.filterEmptyStateContent}>
                {errorMessage || t('noMatchingItemsToDisplay', 'No matching items to display')}
              </p>
              <p className={styles.filterEmptyStateHelper}>
                {t('tryDifferentSearch', 'Try a different search term')}
              </p>
            </Tile>
          </Layer>
        </div>
      );
    }

    const { headers, rows } = getTableData();

    return (
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()} useZebraStyles>
            <TableHead>
              <TableRow>
                {headers.map(header => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow 
                  {...getRowProps({ row })} 
                  key={row.id}
                  onClick={() => {
                    // Safely get the result from filtered results
                    const index = parseInt(row.id);
                    const filteredResults = searchResult.filter(r => r !== null);
                    if (index >= 0 && index < filteredResults.length) {
                      handleRowClick(filteredResults[index]);
                    }
                  }}
                >
                  {row.cells.map(cell => (
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
    <div className={styles.container}>
      <Form className={styles.searchContainer}>
        <Stack gap={5}>
          <h4 className={styles.heading}>
            {t('findInsurancePolicy', 'Find An Existing Insurance Policy')}
          </h4>
          <div className={styles.searchForm}>
            <label htmlFor="insuranceSearch" className={styles.label}>
              {t('patientInsuranceCard', 'Patient Insurance Card Number')}
            </label>
            <Search
              id="insuranceSearch"
              labelText=""
              placeholder={t('searchPlaceholderMin', `Enter at least ${MIN_SEARCH_LENGTH} characters to search`)}
              value={insuranceCardNumber}
              onChange={(e) => setInsuranceCardNumber(e.target.value)}
              size="lg"
              autoFocus
            />
          </div>
          {insuranceCardNumber.trim().length > 0 && insuranceCardNumber.trim().length < MIN_SEARCH_LENGTH && (
            <div className={styles.searchHint}>
              {t('enterMoreChars', `Please enter at least ${MIN_SEARCH_LENGTH} characters to search.`)}
            </div>
          )}
        </Stack>
      </Form>

      {loading && (
        <DataTableSkeleton
          columnCount={7}
          rowCount={5}
          headers={[]}
          showHeader={false}
          showToolbar={false}
        />
      )}
      
      {renderResultsTable()}
    </div>
  );
};

export default SearchInsurance;
