import React, { useEffect, useState } from 'react';
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
import { getDepartments, type Department as DepartmentType } from '../api/billing';
import styles from './Department.scss';
import BackButton from '../components/back-button';
import BillingAdminHeader from './billing-admin-header/billing-admin-header.component';

interface DepartmentProps {
  onBack: () => void;
}

const Department: React.FC<DepartmentProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Array<DepartmentType>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const headers = [
    { key: 'departmentId', header: '#' },
    { key: 'name', header: t('name', 'Name') },
    { key: 'description', header: t('description', 'Description') },
    { key: 'actions', header: t('services', 'Services') },
  ];

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      showToast({
        title: t('departmentLoadError', 'Error loading departments'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Transform departments into the format expected by DataTable
  const rows = departments.map((dept) => ({
    id: dept.departmentId.toString(),
    departmentId: dept.departmentId,
    name: dept.name,
    description: dept.description,
  }));

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <BillingAdminHeader
        title={t('departmentManagement', 'Department Management')}
        onBack={onBack}
        addButtonLabel={t('addNewDepartment', 'Add New Department')}
        onAdd={() => {/* TODO: Implement add */}}
      />
      
      <DataTable rows={rows} headers={headers}>
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
                  <TableCell>
                    <Button kind="ghost" size="sm">
                      {t('viewServices', '(0) view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default Department;
