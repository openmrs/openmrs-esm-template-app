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
  InlineNotification,
} from '@carbon/react';
import { isDesktop, showToast, useLayoutType, useSession } from '@openmrs/esm-framework';
import { getConsommationsByGlobalBillId, getConsommationItems, getConsommationById, submitBillPayment } from '../api/billing';
import { 
  isItemPaid, 
  isItemPartiallyPaid, 
  calculateRemainingDue,
  calculateChange,
  calculateSelectedItemsTotal,
  calculateTotalRemainingAmount,
  areAllSelectedItemsPaid,
  getStatusClass,
  calculateTotalDueForSelected
} from '../utils/billing-calculations';
import { type ConsommationListResponse, type ConsommationItem, type RowData } from '../types';
import styles from './embedded-consommations-list.scss';

interface EmbeddedConsommationsListProps {
  globalBillId: string;
  patientUuid?: string;
  insuranceCardNo?: string;
  onConsommationClick?: (consommationId: string) => void;
}

const EmbeddedConsommationsList: React.FC<EmbeddedConsommationsListProps> = ({ 
  globalBillId, 
  patientUuid, 
  insuranceCardNo,
  onConsommationClick 
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const collectorUuid = session?.user?.uuid;

  const [isLoading, setIsLoading] = useState(true);
  const [consommations, setConsommations] = useState<ConsommationListResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [selectedConsommationItems, setSelectedConsommationItems] = useState<ConsommationItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [receivedCash, setReceivedCash] = useState('');
  const [payWithDeposit, setPayWithDeposit] = useState(false);
  const [payWithCash, setPayWithCash] = useState(true);
  
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';

  const fetchConsommations = async () => {
    if (!globalBillId) return;
    
    setIsLoading(true);
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

  useEffect(() => {
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

  const rows = useMemo<RowData[]>(() => 
    consommations?.results?.map((item, index) => ({
      id: item.consommationId?.toString() || '',
      index: index + 1,
      createdDate: item.createdDate ? new Date(item.createdDate).toLocaleDateString() : '-',
      consommationId: item.consommationId?.toString() || '-',
      service: item?.department?.name || '-',
      createdBy: item?.insuranceBill?.creator?.person?.display || '-',
      insuranceCardNo: item.patientBill?.policyIdNumber || insuranceCardNo || '-',
      insuranceDue: Number(item.insuranceBill?.amount ?? 0).toFixed(2),
      thirdPartyDue: Number(item.thirdPartyBill?.amount ?? 0).toFixed(2),
      patientDue: Number(item.patientBill?.amount ?? 0).toFixed(2),
      paidAmount: Number(item.patientBill?.payments?.[0]?.amountPaid ?? 0).toFixed(2),
      status: item.patientBill?.status || 'N/A',
      rawPatientDue: Number(item.patientBill?.amount ?? 0),
      rawPaidAmount: Number(item.patientBill?.payments?.[0]?.amountPaid ?? 0),
    })) || [], [consommations?.results, insuranceCardNo]);

  const handleRowClick = (row: RowData) => {
    if (onConsommationClick && row.id) {
      onConsommationClick(row.id);
    }
  };

  // Helper function to get translated status text
  const getItemStatusText = (item: ConsommationItem): string => {
    if (isItemPaid(item)) {
      return t('paid', 'Paid');
    } else if (isItemPartiallyPaid(item)) {
      return t('partiallyPaid', 'Partially Paid');
    } else {
      return t('unpaid', 'Unpaid');
    }
  };

  const fetchConsommationItems = async (consommationId: string) => {
    try {
      setIsLoadingItems(true);
      const fullConsommationData = await getConsommationById(consommationId);
      
      const items = await getConsommationItems(consommationId);
      
      const hasPayments = fullConsommationData.patientBill?.payments && fullConsommationData.patientBill.payments.length > 0;
      
      if (hasPayments) {
        const totalPaid = fullConsommationData.patientBill.payments.reduce(
          (sum, payment) => sum + (payment.amountPaid || 0), 0
        );
        
        const updatedItems = items.map(item => {
          const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
          
          const paidAmount = item.paidQuantity ? item.paidQuantity * (item.unitPrice || 0) : (item.paid ? itemTotal : 0);
          
          const remainingAmount = Math.max(0, itemTotal - paidAmount);
          
          const isFullyPaid = paidAmount >= itemTotal;
          const isPartiallyPaid = !isFullyPaid && paidAmount > 0;
          
          return {
            ...item,
            paidAmount: paidAmount,
            remainingAmount: remainingAmount,
            paid: isFullyPaid,
            partiallyPaid: isPartiallyPaid
          };
        });
        
        setSelectedConsommationItems(updatedItems || []);
      } else {
        setSelectedConsommationItems(items || []);
      }
    } catch (error) {
      console.error('Failed to fetch consommation items:', error);
      showToast({
        title: t('error', 'Error'),
        description: t('failedToLoadItems', 'Failed to load consommation items'),
        kind: 'error',
      });
      setSelectedConsommationItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const toggleRowSelection = async (rowId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const newSelection = (prev: string[]) => {
      if (prev.includes(rowId)) {
        return prev.filter(id => id !== rowId);
      } else {
        return prev.length > 0 ? [rowId] : [...prev, rowId];
      }
    };
    
    const updatedSelection = newSelection(selectedRows);
    setSelectedRows(updatedSelection);
    
    if (updatedSelection.includes(rowId)) {
      await fetchConsommationItems(rowId);
    } else {
      setSelectedConsommationItems([]);
    }
  };

  const handleSelectAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedRows([]);
    setSelectedConsommationItems([]);
  };

  const toggleItemSelection = (index: number) => {
    const item = selectedConsommationItems[index];
    if (!isItemPaid(item)) {
      setSelectedConsommationItems(prevItems => {
        const newItems = [...prevItems];
        newItems[index] = { 
          ...newItems[index], 
          selected: !newItems[index].selected 
        };
        return newItems;
      });
    }
  };

  const openPaymentModal = () => {
    const totalDueForSelected = calculateTotalDueForSelected(rows, selectedRows);
    setPaymentAmount(totalDueForSelected.toString());
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setReferenceNumber('');
    setPaymentError('');
    setReceivedCash('');
    setPayWithDeposit(false);
    setPayWithCash(true);
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
      
      if (payWithCash && (!receivedCash || parseFloat(receivedCash) < parseFloat(paymentAmount))) {
        throw new Error(t('insufficientCash', 'Received cash amount must be equal to or greater than the payment amount'));
      }
      
      const selectedItemsTotal = calculateSelectedItemsTotal(selectedConsommationItems);
      const enteredAmount = parseFloat(paymentAmount);
      if (enteredAmount > selectedItemsTotal) {
        throw new Error(t('amountExceedsTotal', 'Payment amount cannot exceed the total of selected items'));
      }
      
      const selectedConsommation = consommations?.results?.find(
        c => c.consommationId?.toString() === selectedRows[0]
      );
      
      if (!selectedConsommation) {
        throw new Error(t('noConsommationSelected', 'No consommation selected'));
      }
      
      const fullConsommationData = await getConsommationById(selectedRows[0]);
      
      if (!fullConsommationData?.patientBill?.patientBillId) {
        throw new Error(t('noBillId', 'Could not retrieve patient bill ID'));
      }
      
      const selectedItems = selectedConsommationItems.filter(item => item.selected === true && !isItemPaid(item));
      
      if (selectedItems.length === 0) {
        throw new Error(t('noItemsSelected', 'No billable items selected'));
      }
      
      let remainingPayment = enteredAmount;
      const paidItems = [];
  
      const fullPayItems = selectedItems.map(item => {
        const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
        const paidAmount = item.paidAmount || 0;
        const itemCost = Math.max(0, itemTotal - paidAmount);
        
        return {
          ...item,
          itemCost
        };
      });
  
      const sortedItems = [...fullPayItems].sort((a, b) => a.itemCost - b.itemCost);
      
      for (const item of sortedItems) {
        if (remainingPayment <= 0) break;
        
        if (remainingPayment >= item.itemCost) {
          paidItems.push({
            billItem: { patientServiceBillId: item.patientServiceBillId },
            paidQty: item.quantity || 1 // Always use full quantity for full payments
          });
          remainingPayment -= item.itemCost;
        }
      }
  
      if (remainingPayment > 0) {
        const unpaidItems = sortedItems.filter(item => 
          !paidItems.some(paid => paid.billItem.patientServiceBillId === item.patientServiceBillId)
        );
        
        if (unpaidItems.length > 0) {
          const itemToPartiallyPay = unpaidItems[0];
          
          // Calculate what portion of the item we can pay
          // IMPORTANT: We need to round to a whole number for API compatibility
          // Instead of a partial payment, we'll pay for a whole quantity if possible
          const itemQuantity = itemToPartiallyPay.quantity || 1;
          const itemUnitPrice = itemToPartiallyPay.unitPrice || 0;
          
          if (itemQuantity > 1 && itemUnitPrice > 0) {
            const wholePaidQty = Math.floor(remainingPayment / itemUnitPrice);
            if (wholePaidQty >= 1) {
              paidItems.push({
                billItem: { patientServiceBillId: itemToPartiallyPay.patientServiceBillId },
                paidQty: wholePaidQty
              });
            }
          } else {
            // If we can't pay whole units, then pay for the entire item
            // API requires integers, so we'll pay for the whole item or nothing
            paidItems.push({
              billItem: { patientServiceBillId: itemToPartiallyPay.patientServiceBillId },
              paidQty: 1  // Always send integer quantities
            });
          }
        }
      }
      
      const amountPaidAsFloat = parseFloat(enteredAmount.toFixed(2));
      
      if (!collectorUuid) {
        throw new Error(t('noCollectorUuid', 'Unable to retrieve collector UUID. Please ensure you are logged in.'));
      }
      
      const paymentPayload = {
        amountPaid: amountPaidAsFloat,
        patientBill: { 
          patientBillId: fullConsommationData.patientBill.patientBillId,
          creator: collectorUuid  // Add creator with collector UUID
        },
        dateReceived: new Date().toISOString(),
        collector: { uuid: collectorUuid },
        paidItems: paidItems
      };
      
      try {
        const paymentResponse = await submitBillPayment(paymentPayload);
        
        setSelectedConsommationItems(prevItems => 
          prevItems.map(item => {
            const paidItem = paidItems.find(pi => pi.billItem.patientServiceBillId === item.patientServiceBillId);
            if (!paidItem) return item;
            
            const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
            const previousPaidAmount = item.paidAmount || 0;
            const additionalPaidAmount = paidItem.paidQty * (item.unitPrice || 0);
            const newPaidAmount = previousPaidAmount + additionalPaidAmount;
            const newRemainingAmount = Math.max(0, itemTotal - newPaidAmount);
            const isNowFullyPaid = newRemainingAmount <= 0;
            
            return {
              ...item,
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount,
              paid: isNowFullyPaid,
              partiallyPaid: !isNowFullyPaid && newPaidAmount > 0,
              paidQuantity: (item.paidQuantity || 0) + paidItem.paidQty,
              selected: false
            };
          })
        );
  
        showToast({
          title: t('paymentSuccess', 'Payment Successful'),
          description: t('paymentProcessed', 'Payment has been processed successfully'),
          kind: 'success',
        });
        closePaymentModal();
        
        await fetchConsommations();
        
        if (selectedRows.length > 0) {
          await fetchConsommationItems(selectedRows[0]);
        }
  
      } catch (paymentError) {
        console.error('Payment API error:', paymentError);
        throw new Error(t('paymentFailed', 'Payment processing failed. Please try again.'));
      }
    } catch (error: any) {
      console.error('Payment error:', error);
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
    const anyRowSelected = selectedRows.length > 0;
    const isDisabled = anyRowSelected && !isSelected;
    
    return {
      ...row,
      select: (
        <Checkbox 
          id={`row-select-${row.id}`}
          checked={isSelected}
          onChange={(e: any) => toggleRowSelection(row.id, e)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          labelText=""
          disabled={isDisabled}
        />
      )
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <h4>
          {t('consommationsList', 'Consommations List for Global Bill')} #{globalBillId}
        </h4>
      </div>
      {rows && rows.length > 0 ? (
        <>
          <DataTable rows={rowsWithCheckboxes} headers={headers} size={responsiveSize} useZebraStyles useStaticWidth>
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <Table {...getTableProps()} className={styles.table} useStaticWidth>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.key === 'select' ? (
                          <Checkbox
                            id="select-all-rows"
                            checked={false}
                            indeterminate={selectedRows.length > 0}
                            onChange={(e: any) => handleSelectAll(e)}
                            labelText=""
                            disabled={selectedRows.length > 0}
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
                {selectedRows.length > 0
                  ? t('selectedItemsAmount', 'Selected Items Due: {{amount}}', {
                      amount: calculateTotalDueForSelected(rows, selectedRows).toFixed(2),
                    })
                  : t('noItemsSelected', 'No items selected')}
              </p>
              <Button kind="primary" disabled={selectedRows.length === 0} onClick={openPaymentModal}>
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
            primaryButtonDisabled={
              isSubmitting ||
              selectedConsommationItems.filter((item) => item.selected && !isItemPaid(item)).length === 0
            }
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
                        <TextInput id="collector-name" value={session?.user?.display || 'Unknown'} readOnly />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('receivedDate', 'Received Date')}</div>
                      <div className={styles.formInput}>
                        <TextInput id="received-date" type="date" value={new Date().toISOString().split('T')[0]} />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('payWithDeposit', 'Pay with deposit')}</div>
                      <div className={styles.formInput}>
                        <Checkbox
                          id="pay-with-deposit"
                          labelText=""
                          checked={payWithDeposit}
                          onChange={() => setPayWithDeposit(!payWithDeposit)}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('payWithCash', 'Pay with cash')}</div>
                      <div className={styles.formInput}>
                        <Checkbox
                          id="pay-with-cash"
                          labelText=""
                          checked={payWithCash}
                          onChange={() => setPayWithCash(!payWithCash)}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('receivedCash', 'Received Cash')}</div>
                      <div className={styles.formInput}>
                        <NumberInput
                          id="received-cash"
                          value={receivedCash}
                          onChange={(e) => setReceivedCash(e.target.value)}
                          min={0}
                          step={0.01}
                          disabled={!payWithCash}
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
                          className={`${styles.amountInput} ${parseFloat(paymentAmount) > calculateSelectedItemsTotal(selectedConsommationItems) ? styles.invalidAmount : ''}`}
                          min={0}
                          max={calculateSelectedItemsTotal(selectedConsommationItems)}
                          step={0.01}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('paidByThirdParty', 'Paid by Third Party')}</div>
                      <div className={styles.formInput}>
                        <NumberInput id="third-party-payment" value="" min={0} step={0.01} />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formLabel}>{t('rest', 'Rest')}</div>
                      <div className={styles.formInput}>
                        <TextInput
                          id="rest-amount"
                          value={calculateChange(receivedCash, paymentAmount)}
                          className={`${styles.restInput} ${parseFloat(calculateChange(receivedCash, paymentAmount)) < 0 ? styles.negativeRest : ''}`}
                          readOnly
                        />
                      </div>
                    </div>
                  </FormGroup>
                </div>
              </div>

              <div className={styles.selectedItemsDetails}>
                <h5>{t('selectedConsommation', 'Selected Consommation')}</h5>
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
                    {rows
                      .filter((row) => selectedRows.includes(row.id))
                      .map((row) => (
                        <tr key={row.id}>
                          <td>{row.consommationId}</td>
                          <td>{row.service}</td>
                          <td>{row.paidAmount}</td>
                          <td>{calculateRemainingDue(row.rawPatientDue, row.rawPaidAmount)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <h5 className={styles.itemsListHeader}>{t('consommationItems', 'Consommation Items')}</h5>
                {isLoadingItems ? (
                  <div className={styles.loadingItems}>{t('loadingItems', 'Loading items...')}</div>
                ) : selectedConsommationItems.length > 0 ? (
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th></th>
                        <th>{t('serviceDate', 'Date')}</th>
                        <th>{t('itemName', 'Item Name')}</th>
                        <th>{t('quantity', 'Qty')}</th>
                        <th>{t('unitPrice', 'Unit Price')}</th>
                        <th>{t('itemTotal', 'Total')}</th>
                        <th>{t('paidAmt', 'Paid Amount')}</th>
                        <th>{t('status', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedConsommationItems.map((item, index) => {
                        const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
                        const paidAmt = item.paidAmount || 0;
                        const isPaid = isItemPaid(item);
                        const isPartiallyPaid = isItemPartiallyPaid(item);

                        return (
                          <tr key={index} className={item.selected ? styles.selectedItem : ''}>
                            <td>
                              <Checkbox
                                id={`item-select-${index}`}
                                checked={item.selected || false}
                                onChange={() => toggleItemSelection(index)}
                                labelText=""
                                disabled={isPaid} // Explicitly disable based on amount comparison
                              />
                            </td>
                            <td>{item.serviceDate ? new Date(item.serviceDate).toLocaleDateString() : '-'}</td>
                            <td>{item.itemName || '-'}</td>
                            <td>{item.quantity || '1'}</td>
                            <td>{Number(item.unitPrice || 0).toFixed(2)}</td>
                            <td>{Number(itemTotal).toFixed(2)}</td>
                            <td>{Number(paidAmt).toFixed(2)}</td>
                            <td>
                              {/* Use inline styles to ensure proper display regardless of CSS classes */}
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  color: 'white',
                                  backgroundColor: isPaid ? '#24a148' : isPartiallyPaid ? '#ff8c00' : '#da1e28',
                                  fontWeight: 'bold',
                                }}
                              >
                                {getItemStatusText(item)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={6}>
                          <strong>{t('selectedItemsTotal', 'Selected Items Total')}</strong>
                        </td>
                        <td colSpan={2}>
                          <strong>{calculateSelectedItemsTotal(selectedConsommationItems).toFixed(2)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6}>
                          <strong>{t('totalUnpaidAmount', 'Total Unpaid Amount')}</strong>
                        </td>
                        <td colSpan={2}>
                          <strong>
                            {calculateTotalRemainingAmount(selectedConsommationItems).toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <div className={styles.noItems}>
                    {selectedRows.length > 0
                      ? t('noItemsFound', 'No items found for this consommation')
                      : t('selectConsommation', 'Select a consommation to view items')}
                  </div>
                )}

                <div className={styles.paymentTotals}>
                  <div className={styles.paymentTotalRow}>
                    <span>{t('total', 'Total to Pay')}:</span>
                    <strong>{calculateSelectedItemsTotal(selectedConsommationItems).toFixed(2)}</strong>
                  </div>
                  {parseFloat(paymentAmount) > calculateSelectedItemsTotal(selectedConsommationItems) && (
                    <div className={styles.paymentError}>
                      {t('amountExceedsTotal', 'Payment amount cannot exceed the total of selected items')}
                    </div>
                  )}
                </div>
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