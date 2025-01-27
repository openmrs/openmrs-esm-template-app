import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  ButtonSet,
  Loading,
  Tag,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showToast } from '@openmrs/esm-framework';
import { getFacilityServicePrices, type FacilityServicePrice as FacilityServicePriceType } from '../api/billing';
import styles from './FacilityServicePrice.scss';
import { Edit, Add } from '@carbon/react/icons';
import BackButton from '../components/back-button';
import BillingAdminHeader from './billing-admin-header/billing-admin-header.component';

interface FacilityServicePriceProps {
  onBack: () => void;
}

const FacilityServicePrice: React.FC<FacilityServicePriceProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [facilityServices, setFacilityServices] = useState<Array<FacilityServicePriceType>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const tableRef = useRef(null);
  const BATCH_SIZE = 30;

  const headers = [
    { key: 'name', header: t('name', 'Name') },
    { key: 'category', header: t('category', 'Category') },
    { key: 'description', header: t('description', 'Description') },
    { key: 'relatedConcept', header: t('relatedConcept', 'Related Concept') },
    { key: 'fullPrice', header: t('fullPrice', 'Full Price') },
    { key: 'itemType', header: t('itemType', 'Item Type') },
    { key: 'serviceStatus', header: t('serviceStatus', 'Item Status') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  const formatTableData = (services: Array<FacilityServicePriceType>) => {
    return services.map((service) => ({
      id: service.facilityServicePriceId.toString(),
      name: service.name,
      category: service.category,
      description: service.description,
      relatedConcept: service.concept?.display || '',
      fullPrice: service.fullPrice,
      itemType: service.itemType === 1 ? 'Ordinary' : String(service.itemType),
      serviceStatus: service.hidden ? 'Not Available' : 'Available',
    }));
  };

  const loadFacilityServices = async (index: number) => {
    try {
      const response = await getFacilityServicePrices(index, BATCH_SIZE);
      if (index === 0) {
        setFacilityServices(response.results);
      } else {
        setFacilityServices((prev) => [...prev, ...response.results]);
      }
      setHasMore(response.results.length === BATCH_SIZE);
    } catch (error) {
      showToast({
        title: t('facilityServiceLoadError', 'Error loading facility services'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (tableRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50 && !isLoadingMore && hasMore) {
        setIsLoadingMore(true);
        setStartIndex(prev => prev + BATCH_SIZE);
      }
    }
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    loadFacilityServices(0);
  }, []);

  useEffect(() => {
    if (startIndex > 0 && hasMore) {
      loadFacilityServices(startIndex);
    }
  }, [startIndex]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <BillingAdminHeader
        title={t('facilityServiceManagement', 'Manage Facility Services')}
        onBack={onBack}
        addButtonLabel={t('addNewFacilityService', 'Add New Facility Service')}
        onAdd={() => {/* TODO: Implement add */}}
      />
      
      <div className={styles.tableContainer} ref={tableRef} onScroll={handleScroll}>
        <DataTable rows={formatTableData(facilityServices)} headers={headers}>
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
                    <TableCell>{row.cells[4].value} RWF</TableCell>
                    <TableCell>{row.cells[5].value}</TableCell>
                    <TableCell>
                      <Tag type={row.cells[6].value === 'Available' ? 'green' : 'red'}>
                        {row.cells[6].value}
                      </Tag>
                    </TableCell>
                    <TableCell>
                      <ButtonSet className={styles.actionsCell}>
                        <Button
                          kind="tertiary"
                          size="sm"
                          renderIcon={Edit}
                          hasIconOnly
                        />
                        <Button
                          kind="tertiary"
                          size="sm"
                          renderIcon={Add}
                          hasIconOnly
                        />
                      </ButtonSet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
        {isLoadingMore && (
          <div className={styles.loadingMore}>
            <Loading small description={t('loadingMore', 'Loading more...')} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityServicePrice;
