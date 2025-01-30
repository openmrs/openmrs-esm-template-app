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
import { getServices, type HopService } from '../api/billing';
import styles from './Service.scss';
import BackButton from '../components/back-button';

interface ServiceProps {
  showAddButton?: boolean;
}

interface ServiceActionsProps {
  service: any;
  responsiveSize: string;
}

const ServiceActions: React.FC<ServiceActionsProps> = ({ service, responsiveSize }) => {
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
          itemText={t('editService', 'Edit service')}
          onClick={() => {
            /* TODO: Implement edit */
          }}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="view"
          itemText={t('viewDetails', 'View details')}
          onClick={() => {
            /* TODO: Implement view */
          }}
        />
      </OverflowMenu>
    </Layer>
  );
};

const Service: React.FC<ServiceProps> = ({ showAddButton = true }) => {
  const { t } = useTranslation();
  const defaultPageSize = 10;
  const [services, setServices] = useState<Array<HopService>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const headers = [
    { key: 'id', header: '#' },
    { key: 'name', header: t('name', 'Name') },
    { key: 'description', header: t('description', 'Description') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      setError(error);
      showToast({
        title: t('serviceLoadError', 'Error loading services'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [services, searchTerm]);

  const rows = filteredServices.map((service) => ({
    id: service.serviceId.toString(),
    name: service.name,
    description: service.description || 'N/A',
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
      <div className={styles.widgetCard}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>
            <h4>{t('serviceManagement', 'Service Management')}</h4>
          </div>
          {showAddButton && (
            <Button
              className={styles.addButton}
              kind="ghost"
              renderIcon={Add}
              iconDescription={t('add', 'Add')}
              onClick={() => {
                /* TODO: Implement add */
              }}
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
                            {index === 3 ? <ServiceActions service={row} responsiveSize="sm" /> : cell.value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headers.length}>
                        <div className={styles.emptyState}>
                          <p className={styles.emptyStateTitle}>
                            {t('noMatchingServices', 'No matching services to display')}
                          </p>
                          <p className={styles.emptyStateText}>{t('checkFilters', 'Check the filters above')}</p>
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
              {t('showing', 'Showing')} {Math.min((currentPage - 1) * defaultPageSize + 1, rows.length)} -{' '}
              {Math.min(currentPage * defaultPageSize, rows.length)} {t('of', 'of')} {rows.length} {t('items', 'items')}
            </div>
            <div className={styles.pagination}>
              <Button kind="ghost" size="sm" disabled={currentPage === 1} onClick={() => goTo(currentPage - 1)}>
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

export default Service;
