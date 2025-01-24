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
  Form,
  TextInput,
  NumberInput,
} from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showToast } from '@openmrs/esm-framework';
import { getThirdParties, ThirdParty as ThirdPartyType } from '../api/billing';
import styles from './ThirdParty.scss';
import BackButton from '../components/back-button';

interface ThirdPartyProps {
  onBack: () => void;
}

const ThirdParty: React.FC<ThirdPartyProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [thirdParties, setThirdParties] = useState<Array<ThirdPartyType>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newThirdParty, setNewThirdParty] = useState({ name: '', rate: 0 });

  const headers = [
    { key: 'thirdPartyId', header: '#' },
    { key: 'name', header: t('name', 'Third Party name') },
    { key: 'rate', header: t('rate', 'Third Party rate') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  useEffect(() => {
    loadThirdParties();
  }, []);

  const loadThirdParties = async () => {
    try {
      const data = await getThirdParties();
      setThirdParties(data);
    } catch (error) {
      showToast({
        title: t('thirdPartyLoadError', 'Error loading third parties'),
        kind: 'error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement create third party
    console.log('Create third party:', newThirdParty);
  };

  const formatTableData = (thirdParties: Array<ThirdPartyType>) => {
    return thirdParties.map((party) => ({
      id: party.thirdPartyId.toString(),
      thirdPartyId: party.thirdPartyId,
      name: party.name,
      rate: party.rate,
    }));
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <BackButton onBack={onBack} />
          <h4>{t('thirdPartyManagement', 'Manage Third Parties')}</h4>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formContent}>
          <TextInput
            id="thirdPartyName"
            labelText={t('thirdPartyName', 'Third Party name')}
            value={newThirdParty.name}
            onChange={(e) => setNewThirdParty({ ...newThirdParty, name: e.target.value })}
            required
          />
          <NumberInput
            id="thirdPartyRate"
            label={t('thirdPartyRate', 'Third Party rate')}
            value={newThirdParty.rate}
            onChange={(e) => setNewThirdParty({ ...newThirdParty, rate: Number(e.target.value) })}
            required
          />
          <Button type="submit">
            {t('createThirdParty', 'Create Third Party')}
          </Button>
        </div>
      </Form>
      
      <h5>{t('existingThirdParties', 'All Existing Third Parties')}</h5>
      <DataTable rows={formatTableData(thirdParties)} headers={headers}>
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
                  <TableCell>{row.cells[2].value.toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className={styles.actionsCell}>
                      <Button
                        kind="tertiary"
                        size="sm"
                        renderIcon={(props) => <Edit size={16} {...props} />}
                        onClick={() => {/* TODO: Implement edit */}}
                      >
                        {t('edit', 'Edit')}
                      </Button>
                      <Button
                        kind="danger--tertiary"
                        size="sm"
                        renderIcon={(props) => <TrashCan size={16} {...props} />}
                        onClick={() => {/* TODO: Implement delete */}}
                      >
                        {t('delete', 'Delete')}
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
  );
};

export default ThirdParty;
