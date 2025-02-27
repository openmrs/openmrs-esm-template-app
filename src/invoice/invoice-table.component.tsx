import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import fuzzy from 'fuzzy';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectRow,
  TableToolbarSearch,
  Tile,
  InlineNotification,
  InlineLoading,
  type DataTableRow,
} from '@carbon/react';
import { Delete, Edit } from '@carbon/react/icons';
import { isDesktop, useConfig, useDebounce, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import styles from './invoice-table.scss';
import { usePatientBill } from './invoice.resource';
import GlobalBillHeader from '.././bill-list/global-bill-list.component';

// Define proper interfaces for router objects
interface RouteParams {
  insuranceCardNo?: string;
  [key: string]: string | undefined;
}

interface LocationState {
  insuranceCardNo?: string;
  [key: string]: any;
}

interface NavigateFunction {
  (path: string, options?: any): void;
}

const InvoiceTable: React.FC = () => {
  const { t } = useTranslation();
  
  // Initialize with type-safe default values
  let params: RouteParams = {};
  let locationState: LocationState = {};
  let navigateFn: NavigateFunction = (path, options) => {
    console.warn('Navigation not available:', path, options);
  };
  
  // Try to use router hooks, but provide fallbacks if they're not available
  try {
    // Import hooks dynamically to prevent errors at component definition time
    const { useParams, useLocation, useNavigate } = require('react-router-dom');
    
    try {
      params = useParams() as RouteParams || {};
      const location = useLocation() || { state: {} };
      locationState = location.state as LocationState || {};
      navigateFn = useNavigate() as NavigateFunction || ((path, options) => {
        console.warn('Navigation not available:', path, options);
      });
    } catch (routerError) {
      console.warn('Router hooks failed to execute:', routerError);
    }
  } catch (importError) {
    console.warn('Router hooks not available:', importError);
  }
  
  // Safely get config with defaults
  const config = useConfig();
  const defaultCurrency = config?.defaultCurrency || 'RWF';
  const showEditBillButton = config?.showEditBillButton || false;
  
  const layout = useLayoutType();

  // Get insurance card number from multiple possible sources
  const insuranceCardNo = params?.insuranceCardNo || locationState?.insuranceCardNo || '';
  
  const { bills: lineItems = [], isLoading, error, isValidating } = usePatientBill(insuranceCardNo);
  const paidLineItems = useMemo(() => lineItems?.filter((item) => item?.paymentStatus === 'PAID') ?? [], [lineItems]);
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const isTablet = layout === 'tablet';
  const isDesktopLayout = layout === 'small-desktop' || layout === 'large-desktop';

  const [selectedLineItems, setSelectedLineItems] = useState(paidLineItems ?? []);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);

  const filteredLineItems = useMemo(() => {
    if (!debouncedSearchTerm) {
      return lineItems || [];
    }

    return debouncedSearchTerm
      ? fuzzy
          .filter(debouncedSearchTerm, lineItems || [], {
            extract: (lineItem: any) => `${lineItem?.item || ''}`,
          })
          .sort((r1, r2) => r1.score - r2.score)
          .map((result) => result.original)
      : lineItems || [];
  }, [debouncedSearchTerm, lineItems]);

  const tableHeaders = [
    { key: 'no', header: 'No' },
    { key: 'globalBillId', header: 'Global Bill ID' },
    { key: 'date', header: 'Date of Bill' },
    { key: 'createdBy', header: 'Created by' },
    { key: 'policyId', header: 'Policy ID Node.' },
    { key: 'admissionDate', header: 'Admission Date' },
    { key: 'dischargeDate', header: 'Discharge Date' },
    { key: 'billIdentifier', header: 'Bill Identifier' },
    { key: 'patientDueAmount', header: 'Patient Due Amount' },
    { key: 'paidAmount', header: 'Paid Amount' },
    { key: 'paymentStatus', header: 'Payment Status' },
    { key: 'actionButton', header: t('status', 'Status') },
  ];

  const tableRows: Array<typeof DataTableRow> = useMemo(
    () =>
      (filteredLineItems || [])?.map((item, index) => {
        if (!item) return null;
        return {
          no: `${index + 1}`,
          id: `${item.globalBillId || ''}`,
          globalBillId: item.globalBillId || '',
          date: item.date || '',
          createdBy: item.createdBy || '',
          policyId: item.policyId || '',
          admissionDate: item.admissionDate || '',
          dischargeDate: item.dischargeDate || '',
          billIdentifier: item.billIdentifier || '',
          patientDueAmount: item.patientDueAmount || '',
          paidAmount: item.paidAmount || '',
          paymentStatus: item.paymentStatus || '',
          actionButton: (
            <span>
              {item.bill && (
                <>
                  <Button
                    data-testid={`edit-button-${item.uuid || ''}`}
                    renderIcon={Edit}
                    hasIconOnly
                    kind="ghost"
                    iconDescription={t('editThisBillItem', 'Edit this bill item')}
                    tooltipPosition="left"
                    //   onClick={() => handleSelectBillItem(item)}
                  />
                  <Button
                    data-testid={`delete-button-${item.uuid || ''}`}
                    renderIcon={Delete}
                    hasIconOnly
                    kind="ghost"
                    iconDescription={t('deleteThisBillItem', 'Delete this bill item')}
                    tooltipPosition="left"
                    //   onClick={() => handleSelectBillItem(item)}
                  />
                </>
              )}
            </span>
          ),
        };
      }).filter(Boolean) ?? [],
    [filteredLineItems, defaultCurrency, showEditBillButton, t],
  );

  const handleRowClick = useCallback(
    (row) => {
      if (row.id) {
        try {
          navigateFn(`/consommations/${row.id}`, {
            state: { insuranceCardNo: insuranceCardNo },
          });
        } catch (error) {
          console.error('Navigation failed:', error);
        }
      }
    },
    [navigateFn, insuranceCardNo],
  );

  const handleRowSelection = (row: typeof DataTableRow, checked: boolean) => {
    const matchingRow = filteredLineItems?.find((item) => item?.uuid === row.id);
    let newSelectedLineItems;

    if (checked && matchingRow) {
      newSelectedLineItems = [...selectedLineItems, matchingRow];
    } else {
      newSelectedLineItems = selectedLineItems.filter((item) => item?.uuid !== row.id);
    }
    setSelectedLineItems(newSelectedLineItems);
  };

  if (isLoading) {
    return (
      <DataTableSkeleton 
        role="progressbar" 
        compact={isDesktopLayout} 
        zebra 
        headers={tableHeaders}
      />
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <InlineNotification
          kind="error"
          title={t('error', 'Error')}
          subtitle={typeof error === 'string' ? error : 'Failed to load billing data'}
          hideCloseButton
        />
      </div>
    );
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={t('globalBillList', 'Global Bill List')}>
        <span>{isValidating ? <InlineLoading /> : null}</span>
      </CardHeader>

      {insuranceCardNo && (
        <div>
          <GlobalBillHeader />
        </div>
      )}

      <div className={styles.tableContainer}>
        <DataTable headers={tableHeaders} isSortable rows={tableRows} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getHeaderProps, getRowProps, getSelectionProps, getTableProps }) => (
            <TableContainer>
              <TableToolbarSearch
                className={styles.searchbox}
                expanded
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                placeholder={t('searchThisTable', 'Search this table')}
                size={responsiveSize}
              />
              <Table {...getTableProps()} aria-label="Invoice line items" className={styles.invoiceTable}>
                <TableHead>
                  <TableRow>
                    {rows.length > 1 ? <TableHeader /> : null}
                    {headers.map((header) => (
                      <TableHeader 
                        className={styles.tableHeader} 
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      {...getRowProps({
                        row,
                      })}
                      onClick={() => handleRowClick(row)}
                      className={styles.clickableRow}
                    >
                      {rows.length > 1 && (
                        <TableSelectRow
                          aria-label="Select row"
                          {...getSelectionProps({ row })}
                          disabled={tableRows[index]?.status === 'PAID'}
                          onChange={(checked: boolean) => handleRowSelection(row, checked)}
                          checked={
                            tableRows[index]?.status === 'PAID' ||
                            Boolean(selectedLineItems?.find((item) => item?.uuid === row?.id))
                          }
                        />
                      )}
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        {(filteredLineItems?.length === 0 || !filteredLineItems) && (
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
        )}
      </div>
    </div>
  );
};

export default InvoiceTable;
