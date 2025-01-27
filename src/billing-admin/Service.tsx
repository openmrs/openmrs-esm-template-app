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
import { getServices, type HopService } from '../api/billing';
import styles from './Service.scss';
import BackButton from '../components/back-button';
import BillingAdminHeader from './billing-admin-header/billing-admin-header.component';

interface ServiceProps {
  onBack: () => void;
}

const Service: React.FC<ServiceProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Array<HopService>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const headers = [
    { key: 'serviceId', header: '#' },
    { key: 'name', header: t('name', 'Name') },
    { key: 'description', header: t('description', 'Description') },
  ];

  const formatServicesForTable = (services: Array<HopService>) => {
    return services.map(service => ({
      id: service.serviceId.toString(),
      serviceId: service.serviceId,
      name: service.name,
      description: service.description
    }));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      showToast({
        title: t('serviceLoadError', 'Error loading services'),
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
        title={t('serviceManagement', 'Service Management')}
        onBack={onBack}
        addButtonLabel={t('addNewService', 'Add New Service')}
        onAdd={() => {/* TODO: Implement add */}}
      />
      
      <DataTable rows={formatServicesForTable(services)} headers={headers}>
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
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default Service;
