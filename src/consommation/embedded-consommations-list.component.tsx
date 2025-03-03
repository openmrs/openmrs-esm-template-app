import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
  Button,
  Modal,
  Checkbox,
  Form,
  FormGroup,
  TextInput,
  NumberInput,
  RadioButtonGroup,
  RadioButton,
  InlineNotification,
} from '@carbon/react';
import { isDesktop, showToast, useLayoutType } from '@openmrs/esm-framework';
import { getConsommationsByGlobalBillId } from '../api/billing';
import styles from './embedded-consommations-list.scss';

interface EmbeddedConsommationsListProps {
  globalBillId: string;
  patientUuid?: string;
  insuranceCardNo?: string;
  onConsommationClick?: (consommationId: string) => void;
}

interface ConsommationListItem {
  consommationId?: number;
  createdDate?: string;
  department?: {
    name?: string;
  };
  insuranceBill?: {
    amount?: number;
    creator?: {
      person?: {
        display?: string;
      };
    };
  };
  thirdPartyBill?: {
    amount?: number;
  };
  patientBill?: {
    amount?: number;
    policyIdNumber?: string;
    status?: string;
    payments?: Array<{
      amountPaid?: number;
    }>;
  };
}

interface ConsommationListResponse {
  results?: ConsommationListItem[];
  totalDueAmount?: number;
  totalPaidAmount?: number;
}

const EmbeddedConsommationsList: React.FC<EmbeddedConsommationsListProps> = ({ 
  globalBillId, 
  patientUuid, 
  insuranceCardNo,
  onConsommationClick 
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [consommations, setConsommations] = useState<ConsommationListResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';

  useEffect(() => {
    const fetchConsommations = async () => {
      if (!globalBillId) return;
      
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

    fetchConsommations();
  }, [globalBillId, t]);

  const headers = [
    { key: 'select', header: '' },
    { key: 'index', header: '#' },
    { key: 'createdDate', header: t('date', 'Date') },
    { key: 'consommationId', header: t('id', 'ID') },
    { key: 'service', header: t('service', 'Service') },
    { key: 'createdBy', header: t('by', 'By') },
    { key: 'insuranceCardNo', header: t('cardNo', 'Card #') },
    { key: 'insuranceDue', header: t('insDue', 'Ins Due') },
    { key: 'thirdPartyDue', header: t('tpDue', 'TP Due') },
    { key: 'patientDue', header: t('patDue', 'Pat Due') },
    { key: 'paidAmount', header: t('paid', 'Paid') },
    { key: 'status', header: t('status', 'Status') },
  ];

  interface RowData {
    id: string;
    index: number;
    createdDate: string;
    consommationId: string;
    service: string;
    createdBy: string;
    insuranceCardNo: string;
    insuranceDue: string;
    thirdPartyDue: string;
    patientDue: string;
    paidAmount: string;
    status: string;
    rawPatientDue: number;
    rawPaidAmount: number;
    select?: React.ReactNode;
  }

  const rows = useMemo<RowData[]>(() => 
    consommations?.results?.map((item, index) => ({
      id: item.consommationId?.toString() || '',
      index: index + 1,
      createdDate: item.createdDate ? new Date(item.createdDate).toLocaleDateString() : '-',
      consommationId: item.consommationId?.toString() || '-',
      service: item?.department?.name || '-',
      createdBy: item?.insuranceBill?.creator?.person?.display || '-',
      insuranceCardNo: item.patientBill?.policyIdNumber || '-',
      insuranceDue: Number(item.insuranceBill?.amount ?? 0).toFixed(2),
      thirdPartyDue: Number(item.thirdPartyBill?.amount ?? 0).toFixed(2),
      patientDue: Number(item.patientBill?.amount ?? 0).toFixed(2),
      paidAmount: Number(item.patientBill?.payments?.[0]?.amountPaid ?? 0).toFixed(2),
      status: item.patientBill?.status || 'N/A',
      rawPatientDue: Number(item.patientBill?.amount ?? 0),
      rawPaidAmount: Number(item.patientBill?.payments?.[0]?.amountPaid ?? 0),
    })) || [], [consommations?.results]);

  const handleRowClick = (row: RowData) => {
    if (onConsommationClick && row.id) {
      onConsommationClick(row.id);
    }
  };

  const toggleRowSelection = (rowId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setSelectedRows(prev => {
      if (prev.includes(rowId)) {
        return prev.filter(id => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };

  const handleSelectAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedRows.length === rows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(rows.map(row => row.id));
    }
  };

  const openPaymentModal = () => {
    const totalDueForSelected = calculateTotalDueForSelected();
    setPaymentAmount(totalDueForSelected.toString());
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setReferenceNumber('');
    setPaymentError('');
  };

  const calculateTotalDueForSelected = () => {
    let total = 0;
    rows.forEach(row => {
      if (selectedRows.includes(row.id)) {
        const remainingDue = Math.max(0, row.rawPatientDue - row.rawPaidAmount);
        total += remainingDue;
      }
    });
    return Number(total.toFixed(2));
  };

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setPaymentError('');

    try {
      if (!paymentAmount || Number(paymentAmount) <= 0) {
        throw new Error(t('invalidAmount', 'Please enter a valid payment amount'));
      }

      if (paymentMethod !== 'cash' && !referenceNumber) {
        throw new Error(t('referenceRequired', 'Reference number is required for non-cash payments'));
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast({
        title: t('paymentSuccess', 'Payment Successful'),
        description: t('paymentProcessed', 'Payment has been processed successfully'),
        kind: 'success',
      });

      setSelectedRows([]);
      closePaymentModal();

      setIsLoading(true);
      const data = await getConsommationsByGlobalBillId(globalBillId);
      setConsommations(data as ConsommationListResponse);
    } catch (error: any) {
      setPaymentError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <DataTableSkeleton headers={headers} rowCount={5} />
      </div>
    );
  }

  const rowsWithCheckboxes = rows.map(row => {
    const isSelected = selectedRows.includes(row.id);
    return {
      ...row,
      select: (
        <Checkbox 
          id={`row-select-${row.id}`}
          checked={isSelected}
          onChange={(e: any) => toggleRowSelection(row.id, e)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          labelText=""
        />
      )
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <h4>{t('consommationsList', 'Consommations List for Global Bill')} #{globalBillId}</h4>
      </div>
      {rows && rows.length > 0 ? (
        <>
          <DataTable 
            rows={rowsWithCheckboxes} 
            headers={headers} 
            size={responsiveSize} 
            useZebraStyles
            useStaticWidth
          >
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <Table {...getTableProps()} className={styles.table} useStaticWidth>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.key === 'select' ? (
                          <Checkbox 
                            id="select-all-rows"
                            checked={selectedRows.length === rowsWithCheckboxes.length && rowsWithCheckboxes.length > 0}
                            indeterminate={selectedRows.length > 0 && selectedRows.length < rowsWithCheckboxes.length}
                            onChange={(e: any) => handleSelectAll(e)}
                            labelText=""
                          />
                        ) : (
                          header.header
                        )}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow 
                      key={row.id} 
                      {...getRowProps({ row })} 
                      onClick={() => handleRowClick(row)} 
                      className={styles.clickableRow}
                    >
                      {row.cells.map((cell) => (
                        <TableCell 
                          key={cell.id} 
                          onClick={cell.info.header === 'select' ? (e: any) => e.stopPropagation() : undefined}
                        >
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>
          
          <div className={styles.actionsContainer}>
            <div className={styles.totals}>
              <p>
                {t('totalDueAmount', 'Total Due Amount')}: {(consommations?.totalDueAmount ?? 0).toFixed(2)}
              </p>
              <p>
                {t('totalPaidAmount', 'Total Paid Amount')}: {(consommations?.totalPaidAmount ?? 0).toFixed(2)}
              </p>
            </div>
            
            <div className={styles.paymentActions}>
              <p className={styles.selectedSummary}>
                {selectedRows.length > 0 ? 
                  t('selectedItemsAmount', 'Selected Items Due: {{amount}}', { amount: calculateTotalDueForSelected().toFixed(2) }) :
                  t('noItemsSelected', 'No items selected')}
              </p>
              <Button 
                kind="primary"
                disabled={selectedRows.length === 0}
                onClick={openPaymentModal}
              >
                {t('paySelected', 'Pay Selected')}
              </Button>
            </div>
          </div>
          
          <Modal
            open={isPaymentModalOpen}
            modalHeading={t('paymentForm', 'Payment Form')}
            primaryButtonText={t('confirmPayment', 'Confirm Payment')}
            secondaryButtonText={t('cancel', 'Cancel')}
            onRequestClose={closePaymentModal}
            onRequestSubmit={handlePaymentSubmit}
            primaryButtonDisabled={isSubmitting}
            size="md"
          >
            <Form>
              {paymentError && (
                <InlineNotification
                  kind="error"
                  title={t('error', 'Error')}
                  subtitle={paymentError}
                  className={styles.errorNotification}
                />
              )}
              
              <div className={styles.paymentFormGrid}>
                {/* Left side - Collector & Payment Info */}
                <div className={styles.paymentFormColumn}>
                  <FormGroup legendText="">
                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('collector', 'Collector')}</div>
                      <div className={styles.formInput}>
                        <TextInput
                          id="collector-name"
                          value="Heavendy Ange Heaven"
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('receivedDate', 'Received Date')}</div>
                      <div className={styles.formInput}>
                        <TextInput
                          id="received-date"
                          type="date"
                          value={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('payWithDeposit', 'Pay with deposit')}</div>
                      <div className={styles.formInput}>
                        <Checkbox
                          id="pay-with-deposit"
                          labelText=""
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('payWithCash', 'Pay with cash')}</div>
                      <div className={styles.formInput}>
                        <Checkbox
                          id="pay-with-cash"
                          labelText=""
                          defaultChecked
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('receivedCash', 'Received Cash')}</div>
                      <div className={styles.formInput}>
                        <NumberInput
                          id="received-cash"
                          value=""
                          min={0}
                          step={0.01}
                        />
                      </div>
                    </div>
                  </FormGroup>
                </div>
                
                <div className={styles.paymentFormColumn}>
                  <FormGroup legendText="">
                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('amountPaid', 'Amount Paid')}</div>
                      <div className={styles.formInput}>
                        <NumberInput
                          id="amount-paid"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className={styles.amountInput}
                          min={0}
                          step={0.01}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('paidByThirdParty', 'Paid by Third Part')}</div>
                      <div className={styles.formInput}>
                        <NumberInput
                          id="third-party-payment"
                          value=""
                          min={0}
                          step={0.01}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('rest', 'Rest')}</div>
                      <div className={styles.formInput}>
                        <TextInput
                          id="rest-amount"
                          value="-1.0"
                          className={styles.restInput}
                        />
                      </div>
                    </div>
                  </FormGroup>
                </div>
              </div>
              
              <div className={styles.selectedItemsDetails}>
                <h5>{t('selectedItems', 'Selected Items')}</h5>
                <table className={styles.selectedItemsTable}>
                  <thead>
                    <tr>
                      <th>{t('consomId', 'Consom ID')}</th>
                      <th>{t('service', 'Service')}</th>
                      <th>{t('paidAmount', 'Amount Paid')}</th>
                      <th>{t('patientDue', 'Amount Due')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.filter(row => selectedRows.includes(row.id)).map(row => (
                      <tr key={row.id}>
                        <td>{row.consommationId}</td>
                        <td>{row.service}</td>
                        <td>{row.paidAmount}</td>
                        <td>{Number(row.rawPatientDue - row.rawPaidAmount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}><strong>{t('total', 'Total')}</strong></td>
                      <td><strong>{calculateTotalDueForSelected().toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Form>
          </Modal>
        </>
      ) : (
        <p className={styles.noData}>{t('noConsommations', 'No consommations found for this global bill')}</p>
      )}
    </div>
  );
};

export default EmbeddedConsommationsList;