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
  DataTableSkeleton,
  TableToolbarContent,
  Layer,
  Search,
  TableContainer,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showToast, usePagination } from '@openmrs/esm-framework';
import { getInsurances, type Insurance as InsuranceType } from '../api/billing';
import styles from './Insurance.scss';
import BackButton from '../components/back-button';

interface InsuranceProps {
  onBack: () => void;
  showAddButton?: boolean;
}

interface InsuranceActionsProps {
  insurance: any;
  responsiveSize: string;
}

const InsuranceActions: React.FC<InsuranceActionsProps> = ({ insurance, responsiveSize }) => {
  const { t } = useTranslation();

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        align="left"
        aria-label={t('actionsMenu', 'Actions menu')}
        flipped
        selectorPrimaryFocus={'#edit'}
        size={responsiveSize}
      >
        <OverflowMenuItem
          className={styles.menuItem}
          id="edit"
          itemText={t('editInsurance', 'Edit insurance')}
          onClick={() => {/* TODO: Implement edit */}}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="view"
          itemText={t('viewServices', 'View services')}
          onClick={() => {/* TODO: Implement view */}}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          hasDivider
          id="add"
          itemText={t('addServices', 'Add services')}
          onClick={() => {/* TODO: Implement add */}}
        />
      </OverflowMenu>
    </Layer>
  );
};

const Insurance: React.FC<InsuranceProps> = ({ onBack, showAddButton = true }) => {
  const { t } = useTranslation();
  const defaultPageSize = 10;
  const [insurances, setInsurances] = useState<Array<InsuranceType>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const headers = [
    { key: 'id', header: '#' },
    { key: 'name', header: t('name', 'Name') },
    { key: 'category', header: t('category', 'Category') },
    { key: 'address', header: t('address', 'Address') },
    { key: 'phone', header: t('phone', 'Phone') },
    { key: 'rate', header: t('rate', 'Rate') },
    { key: 'serviceCategory', header: t('serviceCategory', 'Service Category') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    try {
      const data = await getInsurances();
      setInsurances(data);
    } catch (error) {
      setError(error);
      showToast({
        title: t('insuranceLoadError', 'Error loading insurances'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInsurances = useMemo(() => {
    if (!searchTerm) return insurances;
    return insurances.filter(insurance => 
      insurance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [insurances, searchTerm]);

  const rows = filteredInsurances.map((insurance) => ({
    id: insurance.insuranceId.toString(),
    name: insurance.name,
    category: insurance.category,
    address: insurance.address,
    phone: insurance.phone,
    rate: 'N/A',
    serviceCategory: '(32)',
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
            <h4>{t('insuranceManagement', 'Insurance Management')}</h4>
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

        <DataTable rows={paginatedRows} headers={headers} useZebraStyles size="sm" isSortable>
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
                        {row.cells.map((cell, index) => (
                          <TableCell key={cell.id}>
                            {index === 7 ? (
                              <InsuranceActions insurance={row} responsiveSize="sm" />
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headers.length}>
                        <div className={styles.emptyState}>
                          <p className={styles.emptyStateTitle}>
                            {t('noMatchingInsurances', 'No matching insurances to display')}
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

export default Insurance;
