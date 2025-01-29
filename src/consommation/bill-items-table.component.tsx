import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
} from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import styles from './bill-items-table.scss';

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);

interface BillItem {
  serviceDate: string;
  unitPrice: number;
  quantity: number;
  paidQuantity: number;
  paid: boolean;
  serviceOther: string | null;
  serviceOtherDescription: string | null;
  drugFrequency: string;
  itemType: number;
}

interface BillItemsTableProps {
  items: Array<BillItem>;
  insuranceRate: number;
}

const BillItemsTable: React.FC<BillItemsTableProps> = ({ items, insuranceRate }) => {
  const { t } = useTranslation();

  const headers = [
    { key: 'no', header: t('no', 'No.') },
    { key: 'serviceDate', header: t('serviceDate', 'Service Date') },
    { key: 'description', header: t('description', 'Description') },
    { key: 'quantity', header: t('quantity', 'Qty') },
    { key: 'paidQuantity', header: t('paidQty', 'Paid Qty') },
    { key: 'unitPrice', header: t('unitPrice', 'Unit Price (RWF)') },
    { key: 'total', header: t('total', 'Total (RWF)') },
    { key: 'insuranceAmount', header: `${t('insurance', 'Insurance')}: ${insuranceRate}%` },
    { key: 'patientAmount', header: `${t('patient', 'Patient')}: ${100 - insuranceRate}%` },
  ];

  const rows = useMemo(() => 
    items.map((item, index) => ({
      id: `${index}`,
      no: index + 1,
      serviceDate: formatDate(new Date(item.serviceDate)),
      description: item.serviceOtherDescription || t('noDescription', 'No description'),
      quantity: item.quantity.toFixed(2),
      paidQuantity: item.paidQuantity.toFixed(2),
      unitPrice: formatCurrency(item.unitPrice),
      total: formatCurrency(item.unitPrice * item.quantity),
      insuranceAmount: formatCurrency((item.unitPrice * item.quantity * insuranceRate) / 100),
      patientAmount: formatCurrency((item.unitPrice * item.quantity * (100 - insuranceRate)) / 100),
    })), [items, insuranceRate, t]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const itemTotal = item.unitPrice * item.quantity;
        return {
          total: acc.total + itemTotal,
          insuranceAmount: acc.insuranceAmount + (itemTotal * insuranceRate) / 100,
          patientAmount: acc.patientAmount + (itemTotal * (100 - insuranceRate)) / 100,
        };
      },
      { total: 0, insuranceAmount: 0, patientAmount: 0 },
    );
  }, [items, insuranceRate]);

  return (
    <div className={styles.tableContainer}>
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer title={t('billItems', 'Bill Items')}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow className={styles.totalRow}>
                  <TableCell colSpan={6}>{t('total', 'Total')}</TableCell>
                  <TableCell>{formatCurrency(totals.total)}</TableCell>
                  <TableCell>{formatCurrency(totals.insuranceAmount)}</TableCell>
                  <TableCell>{formatCurrency(totals.patientAmount)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default BillItemsTable;
