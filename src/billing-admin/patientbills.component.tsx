import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Loading, Tag, DatePicker, DatePickerInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { formatDate, showToast, useSession } from '@openmrs/esm-framework';
import { getPatientBills, type PatientBill } from '../api/billing';
import PaymentsDeskIcon from '../images/payments-desk-icon.svg';
import styles from './patientbills.scss';

const PatientBills: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const userLocation = session?.sessionLocation?.display || 'Unknown Location';
  const [isLoading, setIsLoading] = useState(true);
  const [bills, setBills] = useState<Array<PatientBill>>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const headers = [
    { key: 'no', header: t('no', 'No') },
    { key: 'date', header: t('date', 'Date') },
    { key: 'department', header: t('department', 'Department') },
    { key: 'creator', header: t('creator', 'Creator') },
    { key: 'policyId', header: t('policyId', 'Policy Id Number') },
    { key: 'beneficiary', header: t('beneficiary', 'Beneficiary') },
    { key: 'insuranceName', header: t('insuranceName', 'Insurance Name') },
    { key: 'total', header: t('total', 'Total') },
    { key: 'insuranceDue', header: t('insuranceDue', 'Insurance due') },
    { key: 'patientDue', header: t('patientDue', 'Patient Due') },
    { key: 'paidAmount', header: t('paidAmount', 'Paid Amount') },
    { key: 'phoneNumber', header: t('phoneNumber', 'Phone number') },
    { key: 'refId', header: t('refId', 'Ref. ID') },
    { key: 'billStatus', header: t('billStatus', 'Bill Status') },
    { key: 'payment', header: t('payment', 'Payment') },
    { key: 'viewBill', header: t('viewBill', 'View Bill') },
  ];

  const formatTableData = (bills: Array<PatientBill>) => {
    return bills.map((bill, index) => ({
      id: bill.patientBillId.toString(),
      no: index + 1,
      date: formatDate(new Date(bill.createdDate)),
      department: bill.departmentName,
      creator: bill.creator,
      policyId: bill.policyIdNumber,
      beneficiary: bill.beneficiaryName,
      insuranceName: bill.insuranceName,
      total: bill.amount.toFixed(2),
      insuranceDue: '0',
      patientDue: bill.amount.toFixed(2),
      paidAmount: bill.payments?.[0]?.amountPaid.toFixed(2) || '0',
      phoneNumber: bill.phoneNumber || '-',
      refId: bill.patientBillId.toString(),
      billStatus: bill.status || 'Pending',
      payment: '-',
      viewBill: 'View',
    }));
  };

  const handleDateChange = (dates) => {
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      navigate('/');
      return;
    }

    const loadBills = async () => {
      try {
        setIsLoading(true);
        const response = await getPatientBills(startDate, endDate);
        setBills(response.results);
      } catch (error) {
        showToast({
          title: t('billsLoadError', 'Error loading bills'),
          kind: 'error',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBills();
  }, [navigate, t]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.billingWrapper} id="patientbills-component-instance">
      <div className={styles.container}>
        {/* Use exactly the same header structure as in Billing component */}
        <div className={styles.headerWrapper}>
          <div className={styles.headerContainer}>
            <div className={styles.headerContent}>
              <div className={styles.leftSection}>
                {/* Use the PaymentsDeskIcon directly instead of Receipt */}
                <img src={PaymentsDeskIcon} alt="Payments Desk Icon" className={styles.headerIcon} />
                <div>
                  <p className={styles.location}>{userLocation}</p>
                  <p className={styles.billingTitle}>Billing</p>
                </div>
              </div>
              <div className={styles.rightSection}>
                <div className="cds--date-picker-input__wrapper">
                  <span>
                    <DatePicker datePickerType="single" dateFormat="d-M-Y" value={selectedDate} onChange={handleDateChange}>
                      <DatePickerInput
                        id="billing-date-picker"
                        pattern="\d{1,2}\/\d{1,2}\/\d{4}"
                        placeholder="DD-MMM-YYYY"
                        labelText=""
                        size="md"
                        style={{
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          border: 'none',
                          maxWidth: '10rem',
                        }}
                      />
                    </DatePicker>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <DataTable rows={formatTableData(bills)} headers={headers}>
            {({ rows, headers, getHeaderProps, getTableProps }) => (
              <Table {...getTableProps()} useZebraStyles>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>{header.header}</TableHeader>
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
                </TableBody>
              </Table>
            )}
          </DataTable>
          {isLoading && (
            <div className={styles.loadingMore}>
              <Loading small description={t('loading', 'Loading...')} />
            </div>
          )}
        </div>
      </div>
    </div>
      );
};

export default PatientBills;
