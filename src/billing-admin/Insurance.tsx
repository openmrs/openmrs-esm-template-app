import React, { useEffect, useState, useRef } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Loading,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showToast } from '@openmrs/esm-framework';
import { getInsurances, type Insurance as InsuranceType } from '../api/billing';
import styles from './Insurance.scss';
import { Edit, Add } from '@carbon/react/icons';
import BackButton from '../components/back-button';
import BillingAdminHeader from './billing-admin-header/billing-admin-header.component';

interface InsuranceProps {
  onBack: () => void;
}

const Insurance: React.FC<InsuranceProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [insurances, setInsurances] = useState<Array<InsuranceType>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tableRef = useRef(null);

  const headers = [
    { key: 'id', header: '#' },
    { key: 'name', header: t('name', 'Name') },
    { key: 'category', header: t('category', 'Category') },
    { key: 'address', header: t('address', 'Address') },
    { key: 'phone', header: t('phone', 'Phone') },
    { key: 'rate', header: t('rate', 'Rate') },
    { key: 'serviceCategory', header: t('serviceCategory', 'Service Category') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  const formatInsurancesForTable = (insurances: Array<InsuranceType>) => {
    return insurances.map((insurance) => ({
      id: insurance.insuranceId.toString(),
      name: insurance.name,
      category: insurance.category,
      address: insurance.address,
      phone: insurance.phone,
      rate: 'N/A',
      serviceCategory: '(32)',
    }));
  };

  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    try {
      const data = await getInsurances();
      setInsurances(data);
    } catch (error) {
      showToast({
        title: t('insuranceLoadError', 'Error loading insurances'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <BillingAdminHeader
        title={t('insuranceManagement', 'Insurance Management')}
        onBack={onBack}
        addButtonLabel={t('addNewInsurance', 'Add New Insurance')}
        onAdd={() => {/* TODO: Implement add */}}
      />
      
      <div className={styles.tableContainer} ref={tableRef}>
        <DataTable rows={formatInsurancesForTable(insurances)} headers={headers}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.cells[0].value}</TableCell>
                    <TableCell>{row.cells[1].value}</TableCell>
                    <TableCell>{row.cells[2].value}</TableCell>
                    <TableCell>{row.cells[3].value}</TableCell>
                    <TableCell>{row.cells[4].value}</TableCell>
                    <TableCell>{row.cells[5].value}</TableCell>
                    <TableCell>{row.cells[6].value}</TableCell>
                    <TableCell>
                      <div className={styles.actionsCell}>
                        <Button
                          kind="tertiary"
                          size="sm"
                          onClick={() => {/* TODO: Implement edit */}}
                        >
                          {t('edit', 'Edit')}
                        </Button>
                        <Button
                          kind="tertiary"
                          size="sm"
                          onClick={() => {/* TODO: Implement add/view */}}
                        >
                          {t('addViewServices', 'Add / View')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
      </div>
    </div>
  );
};

export default Insurance;