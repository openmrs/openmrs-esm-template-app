import React, { useEffect, useState, useMemo } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  ButtonSet,
  DataTableSkeleton,
  Tag,
  TableToolbarContent,
  Layer,
  Search,
  TableContainer,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showToast, usePagination } from '@openmrs/esm-framework';
import { getFacilityServicePrices, type FacilityServicePrice as FacilityServicePriceType } from '../api/billing';
import styles from './FacilityServicePrice.scss';
import { Edit, Add } from '@carbon/react/icons';
import BackButton from '../components/back-button';

interface FacilityServicePriceProps {
  onBack: () => void;
  showAddButton?: boolean;
}

const FacilityServicePrice: React.FC<FacilityServicePriceProps> = ({ onBack, showAddButton = true }) => {
  const { t } = useTranslation();
  const defaultPageSize = 10;
  const [facilityServices, setFacilityServices] = useState<Array<FacilityServicePriceType>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const headers = [
    { key: 'name', header: t('name', 'Name') },
    { key: 'category', header: t('category', 'Category') },
    { key: 'description', header: t('description', 'Description') },
    { key: 'relatedConcept', header: t('relatedConcept', 'Related Concept') },
    { key: 'fullPrice', header: t('fullPrice', 'Full Price') },
    { key: 'itemType', header: t('itemType', 'Item Type') },
    { key: 'serviceStatus', header: t('serviceStatus', 'Item Status') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  useEffect(() => {
    loadFacilityServices();
  }, []);

  const loadFacilityServices = async () => {
    try {
      const response = await getFacilityServicePrices(0, 100); // Fetch more items at once since we'll handle pagination client-side
      setFacilityServices(response.results);
    } catch (error) {
      setError(error);
      showToast({
        title: t('facilityServiceLoadError', 'Error loading facility services'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    return facilityServices.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [facilityServices, searchTerm]);

  const rows = filteredServices.map((service) => ({
    id: service.facilityServicePriceId.toString(),
    name: service.name,
    category: service.category,
    description: service.description,
    relatedConcept: service.concept?.display || '',
    fullPrice: service.fullPrice,
    itemType: service.itemType === 1 ? 'Ordinary' : String(service.itemType),
    serviceStatus: service.hidden ? 'Not Available' : 'Available',
  }));

  const { results: paginatedRows, goTo, currentPage } = usePagination(rows, defaultPageSize);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton
          data-testid="loader"
          columnCount={headers.length}
          showHeader={false}
          showToolbar={false}
          size="sm"
          zebra
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h4>{t('error', 'Error')}</h4>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.headerBreadcrumbs}>
        <BackButton onBack={onBack} />
      </div>
      <div className={styles.widgetCard}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>
            <h4>{t('facilityServiceManagement', 'Manage Facility Services')}</h4>
          </div>
          {showAddButton && (
            <Button
              className={styles.addButton}
              kind="ghost"
              renderIcon={Add}
              iconDescription={t('add', 'Add')}
              onClick={() => {/* TODO: Implement add */}}
            >
              {t('add', 'Add')}
            </Button>
          )}
        </div>

        <DataTable rows={paginatedRows} headers={headers} useZebraStyles size="sm">
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <div className={styles.toolbarContent}>
                <TableToolbarContent>
                  <Layer>
                    <Search
                      size="lg"
                      expanded
                      labelText=""
                      closeButtonLabelText={t('clearSearch', 'Clear search input')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('searchTable', 'Search table')}
                    />
                  </Layer>
                </TableToolbarContent>
              </div>
              <Table {...getTableProps()} className={styles.table}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length > 0 ? (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.cells[0].value}</TableCell>
                        <TableCell>{row.cells[1].value}</TableCell>
                        <TableCell>{row.cells[2].value}</TableCell>
                        <TableCell>{row.cells[3].value}</TableCell>
                        <TableCell>{row.cells[4].value} RWF</TableCell>
                        <TableCell>{row.cells[5].value}</TableCell>
                        <TableCell>
                          <Tag type={row.cells[6].value === 'Available' ? 'green' : 'red'}>
                            {row.cells[6].value}
                          </Tag>
                        </TableCell>
                        <TableCell>
                          <ButtonSet className={styles.actionsCell}>
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Edit}
                              hasIconOnly
                              iconDescription={t('edit', 'Edit')}
                            />
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Add}
                              hasIconOnly
                              iconDescription={t('add', 'Add')}
                            />
                          </ButtonSet>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headers.length}>
                        <div className={styles.emptyState}>
                          <p className={styles.emptyStateTitle}>
                            {t('noMatchingServices', 'No matching services to display')}
                          </p>
                          <p className={styles.emptyStateText}>
                            {t('checkFilters', 'Check the filters above')}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>

        {rows.length > 0 && (
          <div className={styles.paginationContainer}>
            <div>
              {t('showing', 'Showing')} {Math.min((currentPage - 1) * defaultPageSize + 1, rows.length)} - {Math.min(currentPage * defaultPageSize, rows.length)} {t('of', 'of')} {rows.length} {t('items', 'items')}
            </div>
            <div className={styles.pagination}>
              <Button
                kind="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => goTo(currentPage - 1)}
              >
                {t('previous', 'Previous')}
              </Button>
              <Button
                kind="ghost"
                size="sm"
                disabled={currentPage === Math.ceil(rows.length / defaultPageSize)}
                onClick={() => goTo(currentPage + 1)}
              >
                {t('next', 'Next')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FacilityServicePrice;
