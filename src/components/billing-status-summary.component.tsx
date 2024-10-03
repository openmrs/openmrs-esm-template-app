import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckmarkFilledIcon,
  CloseFilledIcon,
  ErrorState,
  formatDate,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import styles from './billing-status-summary.scss';
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { useBillingStatus } from '../resources/billing-status.resource';

interface PatientBillingStatusSummaryProps {
  patient: fhir.Patient;
}

const PatientBillingStatusSummary: React.FC<PatientBillingStatusSummaryProps> = ({ patient }) => {
  const defaultPageSize = 10;
  const { t } = useTranslation();
  const headerTitle = t('billingStatus', 'Billing Status');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const { groupedLines, isLoading, isValidating, error } = useBillingStatus(patient.id);

  const tableRows = useMemo(() => {
    if (!groupedLines) return [];
    return Object.entries(groupedLines).map(([visitId, group]) => {
      return {
        id: visitId,
        visitDate: `${formatDate(new Date(group.visit.startDate))} - ${formatDate(new Date(group.visit.endDate))}`,
        status: group.approved,
        lines: group.lines,
      };
    });
  }, [groupedLines]);

  const { results: paginatedRows, goTo, currentPage } = usePagination(tableRows, defaultPageSize);

  const headers = [
    { key: 'visitDate', header: 'Visit Date' },
    { key: 'status', header: 'Status' },
  ];

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <span>{isValidating ? <InlineLoading /> : null}</span>
      </CardHeader>
      <DataTable
        aria-label={t('orderBillingStatuses', 'Order Billing Statuses')}
        data-floating-menu-container
        overflowMenuOnHover={!isTablet}
        isSortable
        rows={paginatedRows}
        headers={headers}
        useZebraStyles
      >
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
          getExpandHeaderProps,
        }) => (
          <>
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()} className={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header: { header: string }) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: { id: React.Key; cells: { value: any }[]; isExpanded: any }) => (
                    <React.Fragment key={row.id}>
                      <TableExpandRow className={styles.row} {...getRowProps({ row })}>
                        <TableCell>{row.cells[0].value}</TableCell>
                        <TableCell>
                          {row.cells[1].value ? (
                            <CheckmarkFilledIcon className={styles.approvedIcon} />
                          ) : (
                            <CloseFilledIcon className={styles.warningIcon} />
                          )}
                        </TableCell>
                      </TableExpandRow>
                      {row.isExpanded && paginatedRows.find((r) => r.id === row.id)?.lines?.length > 0 ? (
                        <TableExpandedRow colSpan={headers.length + 2}>
                          <div className={styles.expandedContent}>
                            {paginatedRows
                              .find((r) => r.id === row.id)
                              ?.lines?.map((line) => (
                                <div key={line.id} className={styles.expandedTile}>
                                  <div className={styles.statusIcon}>
                                    {line.approved ? (
                                      <CheckmarkFilledIcon className={styles.approvedIcon} />
                                    ) : (
                                      <CloseFilledIcon className={styles.warningIcon} />
                                    )}
                                  </div>
                                  <div className={styles.nameSection}>{line.displayName}</div>
                                  <div className={styles.documentSection}>{line.document}</div>
                                </div>
                              ))}
                          </div>
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.emptyStateTile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noMatchingOrdersToDisplay', 'No billing status to display')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </>
        )}
      </DataTable>
      <div className={styles.paginationContainer}>
        <PatientChartPagination
          pageNumber={currentPage}
          totalItems={tableRows.length}
          currentItems={paginatedRows.length}
          pageSize={defaultPageSize}
          onPageNumberChange={({ page }) => goTo(page)}
        />
      </div>
    </div>
  );
};

export default PatientBillingStatusSummary;
