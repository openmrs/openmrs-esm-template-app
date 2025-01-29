import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
} from '@carbon/react';
import { isDesktop, showToast, useLayoutType } from '@openmrs/esm-framework';
import { getConsommationsByGlobalBillId } from '../api/billing';
import GlobalBillHeader from '../bill-list/global-bill-list.component';
import styles from './consommations-list.scss';

const ConsommationsList: React.FC = () => {
  const { t } = useTranslation();
  const { globalBillId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [consommations, setConsommations] = useState(null);
  const navigate = useNavigate();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const location = useLocation();
  const { insuranceCardNo } = location.state || {};

  useEffect(() => {
    const fetchConsommations = async () => {
      try {
        const data = await getConsommationsByGlobalBillId(globalBillId);
        setConsommations(data);
      } catch (error) {
        showToast({
          title: t('error', 'Error'),
          description: error.message,
          kind: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (globalBillId) {
      fetchConsommations();
    }
  }, [globalBillId, t]);

  const headers = [
    { key: 'index', header: '#' },
    { key: 'createdDate', header: t('createdDate', 'Created Date') },
    { key: 'consommationId', header: t('consomId', 'Consom ID') },
    { key: 'service', header: t('service', 'Service') },
    { key: 'createdBy', header: t('createdBy', 'Created By') },
    { key: 'insuranceCardNo', header: t('cardNo', 'Card No') },
    { key: 'insuranceDue', header: t('insuranceDue', 'Insurance Due') },
    { key: 'thirdPartyDue', header: t('thirdPartyDue', 'Third Party Due') },
    { key: 'patientDue', header: t('patientDue', 'Patient Due') },
    { key: 'paidAmount', header: t('paidAmount', 'Paid Amount') },
    { key: 'status', header: t('status', 'Status') },
  ];

  const rows = useMemo(() => 
    consommations?.results?.map((item, index) => ({
      id: item.consommationId?.toString(),
      index: index + 1,
      createdDate: item.createdDate ? new Date(item.createdDate).toLocaleString() : '-',
      consommationId: item.consommationId || '-',
      service: item?.department?.name || '-',
      createdBy: item?.insuranceBill?.creator?.person?.display || '-',
      insuranceCardNo: item.patientBill?.policyIdNumber || '-',
      insuranceDue: Number(item.insuranceBill?.amount ?? 0).toFixed(2),
      thirdPartyDue: Number(item.thirdPartyBill?.amount ?? 0).toFixed(2),
      patientDue: Number(item.patientBill?.amount ?? 0).toFixed(2),
      paidAmount: Number(item.patientBill?.payments?.[0]?.amountPaid ?? 0).toFixed(2),
      status: item.patientBill?.status || 'N/A',
    })), [consommations?.results]);

  const handleRowClick = (row) => {
    navigate(`/consommation/${row.id}`, { 
      state: { insuranceCardNo }
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <GlobalBillHeader />
        <DataTableSkeleton headers={headers} rowCount={5} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <GlobalBillHeader />
      <div className={styles.tableHeader}>
        <h4>{t('consommationsList', 'Consommations List for Global Bill')} #{globalBillId}</h4>
      </div>
      <DataTable rows={rows} headers={headers} size={responsiveSize} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()} className={styles.table}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} onClick={() => handleRowClick(row)} className={styles.clickableRow}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <div className={styles.totals}>
        <p>
          {t('totalDueAmount', 'Total Due Amount')}: {(consommations?.totalDueAmount ?? 0).toFixed(2)}
        </p>
        <p>
          {t('totalPaidAmount', 'Total Paid Amount')}: {(consommations?.totalPaidAmount ?? 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default ConsommationsList;
