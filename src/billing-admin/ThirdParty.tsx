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
  Modal,
  Form,
  TextInput,
  NumberInput,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showToast, usePagination } from '@openmrs/esm-framework';
import { getThirdParties, type ThirdParty as ThirdPartyType } from '../api/billing';
import styles from './ThirdParty.scss';
import BackButton from '../components/back-button';

interface ThirdPartyProps {
  showAddButton?: boolean;
}

interface ThirdPartyFormData {
  name: string;
  rate: number;
}

const ThirdParty: React.FC<ThirdPartyProps> = ({ showAddButton = true }) => {
  const { t } = useTranslation();
  const defaultPageSize = 10;
  const [thirdParties, setThirdParties] = useState<Array<ThirdPartyType>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ThirdPartyFormData>({ name: '', rate: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const headers = [
    { key: 'id', header: '#' },
    { key: 'name', header: t('name', 'Third Party name') },
    { key: 'rate', header: t('rate', 'Third Party rate') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  useEffect(() => {
    loadThirdParties();
  }, []);

  const loadThirdParties = async () => {
    try {
      const data = await getThirdParties();
      setThirdParties(data);
    } catch (error) {
      setError(error);
      showToast({
        title: t('thirdPartyLoadError', 'Error loading third parties'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredThirdParties = useMemo(() => {
    if (!searchTerm) return thirdParties;
    return thirdParties.filter((party) => party.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [thirdParties, searchTerm]);

  const rows = filteredThirdParties.map((party) => ({
    id: party.thirdPartyId.toString(),
    name: party.name,
    rate: `${party.rate.toFixed(1)}%`,
  }));

  const { results: paginatedRows, goTo, currentPage } = usePagination(rows, defaultPageSize);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement create/update logic
    setIsFormOpen(false);
    setFormData({ name: '', rate: 0 });
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const party = thirdParties.find((p) => p.thirdPartyId.toString() === id);
    if (party) {
      setFormData({ name: party.name, rate: party.rate });
      setEditingId(id);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    // TODO: Implement delete logic
  };

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
            <h4>{t('thirdPartyManagement', 'Third Party Management')}</h4>
          </div>
          {showAddButton && (
            <Button
              className={styles.addButton}
              kind="ghost"
              renderIcon={Add}
              iconDescription={t('add', 'Add')}
              onClick={() => {
                setFormData({ name: '', rate: 0 });
                setEditingId(null);
                setIsFormOpen(true);
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
                            {index === 3 ? (
                              <div className={styles.actionsCell}>
                                <Button kind="tertiary" size="sm" renderIcon={Edit} onClick={() => handleEdit(row.id)}>
                                  {t('edit', 'Edit')}
                                </Button>
                                <Button
                                  kind="danger--tertiary"
                                  size="sm"
                                  renderIcon={TrashCan}
                                  onClick={() => handleDelete(row.id)}
                                >
                                  {t('delete', 'Delete')}
                                </Button>
                              </div>
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
                            {t('noMatchingThirdParties', 'No matching third parties to display')}
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

      <Modal
        open={isFormOpen}
        modalHeading={editingId ? t('editThirdParty', 'Edit Third Party') : t('addThirdParty', 'Add Third Party')}
        primaryButtonText={editingId ? t('save', 'Save') : t('create', 'Create')}
        secondaryButtonText={t('cancel', 'Cancel')}
        onRequestClose={() => {
          setIsFormOpen(false);
          setFormData({ name: '', rate: 0 });
          setEditingId(null);
        }}
        onRequestSubmit={handleSubmit}
      >
        <Form onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            <TextInput
              id="thirdPartyName"
              labelText={t('thirdPartyName', 'Third Party name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <NumberInput
              id="thirdPartyRate"
              label={t('thirdPartyRate', 'Third Party rate')}
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
              required
            />
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ThirdParty;
