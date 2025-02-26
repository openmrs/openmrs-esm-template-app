import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from '@carbon/react';
import styles from './bill-items-table.scss';

const BillItemsTable = ({ items, insuranceRate }) => {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return <p>{t('noBillItems', 'No bill items available')}</p>;
  }

  const headers = [
    { key: 'no', header: t('no', 'No.') },
    { key: 'serviceDate', header: t('serviceDate', 'Service Date') },
    { key: 'description', header: t('description', 'Description') },
    { key: 'qty', header: t('qty', 'Qty') },
    { key: 'paidQty', header: t('paidQty', 'Paid Qty') },
    { key: 'unitPrice', header: t('unitPrice', 'Unit Price (RWF)') },
    { key: 'total', header: t('total', 'Total (RWF)') },
    { key: 'insurance', header: t('insurance', 'Insurance: ' + insuranceRate.toFixed(1) + '%') },
    { key: 'patient', header: t('patient', 'Patient: ' + (100 - insuranceRate).toFixed(1) + '%') }
  ];

  const rows = items.map((item, index) => {
    const totalPrice = item.unitPrice * item.quantity;
    const insuranceAmount = (totalPrice * insuranceRate) / 100;
    const patientAmount = totalPrice - insuranceAmount;

    return {
      id: (index + 1).toString(),
      no: index + 1,
      serviceDate: new Date(item.serviceDate).toLocaleDateString(),
      description: item.serviceOtherDescription || item.serviceOther || t('noDescription', 'No description'),
      qty: item.quantity,
      paidQty: item.paidQuantity,
      unitPrice: item.unitPrice.toLocaleString(),
      total: totalPrice.toLocaleString(),
      insurance: insuranceAmount.toLocaleString(),
      patient: patientAmount.toLocaleString(),
    };
  });

  // Calculate totals for the footer
  const totals = items.reduce(
    (acc, item) => {
      const totalPrice = item.unitPrice * item.quantity;
      acc.total += totalPrice;
      acc.insurance += (totalPrice * insuranceRate) / 100;
      acc.patient += totalPrice - (totalPrice * insuranceRate) / 100;
      return acc;
    },
    { total: 0, insurance: 0, patient: 0 }
  );

  return (
    <div className={styles.tableContainer}>
      <DataTable rows={rows} headers={headers} useZebraStyles size="sm">
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className={styles.totalRow}>
                <TableCell colSpan={6}>{t('total', 'Total')}</TableCell>
                <TableCell>{totals.total.toLocaleString()}</TableCell>
                <TableCell>{totals.insurance.toLocaleString()}</TableCell>
                <TableCell>{totals.patient.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default BillItemsTable;
