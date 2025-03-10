/**
 * Billing Calculations Helper Functions
 * 
 */

import { type ConsommationItem } from '../types';

/**
 * Determines if an item is fully paid
 * @param {ConsommationItem} item - The item to check
 * @returns {boolean} True if the item is fully paid
 */
export const isItemPaid = (item: ConsommationItem): boolean => {
  const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
  
  if (item.paidAmount !== undefined && item.paidAmount >= itemTotal) {
    return true;
  }

  if (item.paid === true) {
    return true;
  }
  
  if (item.remainingAmount !== undefined && item.remainingAmount <= 0) {
    return true;
  }

  if (item.paidQuantity !== undefined && item.quantity !== undefined &&
      item.paidQuantity >= item.quantity) {
    return true;
  }
  
  return false;
};

/**
 * Determines if an item is partially paid
 * @param {ConsommationItem} item - The item to check
 * @returns {boolean} True if the item is partially paid
 */
export const isItemPartiallyPaid = (item: ConsommationItem): boolean => {
  if (isItemPaid(item)) {
    return false;
  }
  
  if (item.partiallyPaid === true) {
    return true;
  }
  
  const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
  const paidAmount = item.paidAmount || 0;
  
  return paidAmount > 0 && paidAmount < itemTotal;
};

/**
 * Calculates the remaining due amount
 * @param {number} patientDue - The total amount due
 * @param {number} paidAmount - The amount already paid
 * @returns {string} The remaining amount due as a formatted string
 */
export const calculateRemainingDue = (patientDue: number, paidAmount: number): string => {
  const remaining = Math.max(0, patientDue - paidAmount);
  return remaining.toFixed(2);
};

/**
 * Calculates the change amount from a cash payment
 * @param {string} receivedCash - The amount of cash received
 * @param {string} paymentAmount - The payment amount
 * @returns {string} The change amount as a formatted string
 */
export const calculateChange = (receivedCash: string, paymentAmount: string): string => {
  if (!receivedCash || !paymentAmount) return "-1.0";
  
  const received = parseFloat(receivedCash);
  const payment = parseFloat(paymentAmount);
  
  if (isNaN(received) || isNaN(payment) || received < payment) {
    return "-1.0";
  }
  
  return (received - payment).toFixed(2);
};

/**
 * Calculates the total of selected items that can be paid
 * @param {ConsommationItem[]} items - The array of items
 * @returns {number} The total amount for selected and unpaid items
 */
export const calculateSelectedItemsTotal = (items: ConsommationItem[]): number => {
  return items
    .filter(item => item.selected && !isItemPaid(item))
    .reduce((sum, item) => {
      // For partially paid items, only count the remaining amount
      const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
      const paidAmount = item.paidAmount || 0;
      const amountToAdd = Math.max(0, itemTotal - paidAmount);
      return sum + amountToAdd;
    }, 0);
};

/**
 * Calculates the total remaining amount for all unpaid items
 * @param {ConsommationItem[]} items - The array of items
 * @returns {number} The total remaining amount for all unpaid items
 */
export const calculateTotalRemainingAmount = (items: ConsommationItem[]): number => {
  return items
    .filter(item => !isItemPaid(item))
    .reduce((sum, item) => {
      const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
      const paidAmount = item.paidAmount || 0;
      return sum + Math.max(0, itemTotal - paidAmount);
    }, 0);
};

/**
 * Checks if all selected items are paid
 * @param {ConsommationItem[]} items - The array of items
 * @returns {boolean} True if all selected items are paid
 */
export const areAllSelectedItemsPaid = (items: ConsommationItem[]): boolean => {
  const selectedItems = items.filter(item => item.selected);
  return selectedItems.length > 0 && selectedItems.every(item => isItemPaid(item));
};

/**
 * Gets the CSS class for payment status
 * @param {ConsommationItem} item - The item to check
 * @param {Object} styles - The styles object
 * @returns {string} The CSS class name
 */
export const getStatusClass = (item: ConsommationItem, styles: any): string => {
  if (isItemPaid(item)) {
    return styles.itemPaid;
  } else if (isItemPartiallyPaid(item)) {
    return styles.itemPartiallyPaid;
  } else {
    return styles.itemUnpaid;
  }
};

/**
 * Calculates the total due amount for selected rows
 * @param {Array} rows - The rows data
 * @param {string[]} selectedRows - Array of selected row IDs
 * @returns {number} The total due amount for selected rows
 */
export const calculateTotalDueForSelected = (rows: any[], selectedRows: string[]): number => {
  let total = 0;
  rows.forEach(row => {
    if (selectedRows.includes(row.id)) {
      const remainingDue = Math.max(0, row.rawPatientDue - row.rawPaidAmount);
      total += remainingDue;
    }
  });
  return Number(total.toFixed(2));
};
