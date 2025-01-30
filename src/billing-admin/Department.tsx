import React, { useEffect, useState, useMemo } from 'react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbarContent,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showToast, usePagination } from '@openmrs/esm-framework';
import { getDepartments } from '../api/billing';
import BackButton from '../components/back-button';
import styles from './Department.scss';

interface DepartmentProps {
  showAddButton?: boolean;
  title?: string;
}

const Department: React.FC<DepartmentProps> = ({ showAddButton = true, title }) => {
  const { t } = useTranslation();
  const defaultPageSize = 10;
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const headers = [
    { key: 'departmentId', header: '#' },
    { key: 'name', header: t('name', 'Name') },
    { key: 'description', header: t('description', 'Description') },
    { key: 'actions', header: t('services', 'Services') },
  ];

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      setError(error);
      showToast({
        title: t('departmentLoadError', 'Error loading departments'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments;
    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, departments]);

  const rows = filteredDepartments.map((dept) => ({
    id: dept.departmentId.toString(),
    departmentId: dept.departmentId,
    name: dept.name,
    description: dept.description,
  }));

  const { results: paginatedRows, goTo, currentPage } = usePagination(rows, defaultPageSize);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" zebra />;
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
            <h4>Department Management</h4>
          </div>
          {showAddButton && (
            <Button
              className={styles.addButton}
              kind="ghost"
              renderIcon={Add}
              iconDescription={t('add', 'Add')}
              onClick={() => 'Add department clicked'}
            >
              {t('add', 'Add')}
            </Button>
          )}
        </div>

        <DataTable rows={paginatedRows} headers={headers} useZebraStyles size="sm" isSortable>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps, onInputChange }) => (
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
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell, index) => (
                          <TableCell key={cell.id}>
                            {index === 3 ? (
                              <Button kind="ghost" size="sm">
                                {t('viewServices', '(0) view')}
                              </Button>
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
                            {t('noMatchingDepartments', 'No matching departments to display')}
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

export default Department;
