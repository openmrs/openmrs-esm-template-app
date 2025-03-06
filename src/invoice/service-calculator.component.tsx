import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dropdown,
  Form,
  NumberInput,
  TextInput,
  Button,
  InlineLoading,
  Tile
} from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { getServices, getFacilityServicePrices, type HopService, type FacilityServicePrice } from '../api/billing';
import styles from './service-calculator.scss';

interface ServiceCalculatorProps {
  patientUuid?: string;
  insuranceCardNo?: string;
  onClose?: () => void;
  onSave?: (calculatorItems: any[]) => void;
}

const ServiceCalculator: React.FC<ServiceCalculatorProps> = ({ 
  patientUuid, 
  insuranceCardNo, 
  onClose, 
  onSave 
}) => {
  const { t } = useTranslation();
  const config = useConfig();
  const defaultCurrency = config?.defaultCurrency || 'RWF';
  
  const [departmentUuid, setDepartmentUuid] = useState('');
  const [serviceUuid, setServiceUuid] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [drugFrequency, setDrugFrequency] = useState('');
  
  const [departments, setDepartments] = useState<HopService[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  
  const [departmentServices, setDepartmentServices] = useState<Record<string, FacilityServicePrice[]>>({});
  
  const [errors, setErrors] = useState({
    departmentUuid: '',
    serviceUuid: '',
    quantity: '',
  });
  
  const [calculatorItems, setCalculatorItems] = useState([]);
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoadingDepartments(true);
      try {
        const services = await getServices();
        
        if (services && services.length > 0) {
          const transformedDepts = services.map(dept => ({
            ...dept,
            uuid: dept.serviceId.toString(),
          }));
          setDepartments(transformedDepts);
        } else {
          console.error('Failed to fetch departments: No data returned');
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setIsLoadingDepartments(false);
      }
    };
    
    fetchDepartments();
  }, []);
  
  const fetchServicesForDepartment = async (departmentId: string) => {
    if (!departmentId) return;
    
    if (departmentServices[departmentId]) return;
    
    setIsLoadingServices(true);
    try {
      // Fetch all facility service prices and filter by department
      const allServices = await getFacilityServicePrices(0, 500);
      
      if (allServices && allServices.results) {
        const departmentServicesList = allServices.results.filter(service => 
          service.category === departments.find(d => d.serviceId.toString() === departmentId)?.name
        );
        
        setDepartmentServices(prev => ({
          ...prev,
          [departmentId]: departmentServicesList
        }));
      } else {
        console.error('Failed to fetch services: No data returned');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };
  
  useEffect(() => {
    if (departmentUuid) {
      fetchServicesForDepartment(departmentUuid);
    }
  }, [departmentUuid]);
  
  const getServicesForDepartment = (departmentUuid: string) => {
    return departmentServices[departmentUuid] || [];
  };
  
  const getServiceByUuid = (serviceUuid: string) => {
    for (const deptUuid in departmentServices) {
      const service = departmentServices[deptUuid]?.find(s => s.facilityServicePriceId.toString() === serviceUuid);
      if (service) return service;
    }
    return null;
  };
  
  const validateForm = () => {
    const newErrors = {
      departmentUuid: '',
      serviceUuid: '',
      quantity: '',
    };
    
    if (!departmentUuid) {
      newErrors.departmentUuid = t('departmentRequired', 'Department is required');
    }
    
    if (!serviceUuid) {
      newErrors.serviceUuid = t('serviceRequired', 'Service is required');
    }
    
    if (!quantity || quantity < 1) {
      newErrors.quantity = t('quantityRequired', 'Quantity must be at least 1');
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const addService = () => {
    if (!validateForm()) return;
    
    const service = getServiceByUuid(serviceUuid);
    if (!service) return;
    
    const existingIndex = calculatorItems.findIndex(item => item.uuid === serviceUuid);
    
    let updatedItems;
    if (existingIndex >= 0) {
      updatedItems = [...calculatorItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity,
        drugFrequency: drugFrequency || updatedItems[existingIndex].drugFrequency,
      };
    } else {
      const department = departments.find(d => d.serviceId.toString() === departmentUuid);
      const newItem = {
        id: serviceUuid,
        uuid: serviceUuid,
        facilityServicePriceId: service.facilityServicePriceId,
        name: service.name,
        departmentName: department?.name || '',
        departmentId: departmentUuid,
        price: service.fullPrice,
        quantity,
        drugFrequency: drugFrequency || '',
        isDrug: departmentUuid === '11',
      };
      
      updatedItems = [...calculatorItems, newItem];
    }
    
    setCalculatorItems(updatedItems);
    onSave && onSave(updatedItems);
    
    setServiceUuid('');
    setQuantity(1);
    setDrugFrequency('');
  };
  
  useEffect(() => {
    const newTotal = calculatorItems.reduce(
      (sum, item) => sum + (item.totalPrice || (item.price * item.quantity)), 
      0
    );
    setTotal(newTotal);
  }, [calculatorItems]);
  
  const removeItem = (index) => {
    const updatedItems = [...calculatorItems];
    updatedItems.splice(index, 1);
    setCalculatorItems(updatedItems);
    
    onSave && onSave(updatedItems);
  };
  
  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...calculatorItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
    };
    setCalculatorItems(updatedItems);
    
    onSave && onSave(updatedItems);
  };
  
  // Update drug frequency
  const updateDrugFrequency = (index, frequency) => {
    const updatedItems = [...calculatorItems];
    updatedItems[index] = {
      ...updatedItems[index],
      drugFrequency: frequency,
    };
    setCalculatorItems(updatedItems);
    
    onSave && onSave(updatedItems);
  };

  return (
    <div className={styles.calculatorWrapper}>
      <h2 className={styles.formTitle}>Patient Bill Calculations</h2>
      
      <Tile light className={styles.formTile}>
        <Form className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>{t('department', 'Department')}</label>
              <Dropdown
                id="department"
                label={isLoadingDepartments ? t('loading', 'Loading...') : t('pleaseSelect', 'Please select')}
                items={departments.map(dept => dept.serviceId.toString())}
                itemToString={(uuid) => departments.find(d => d.serviceId.toString() === uuid)?.name || ''}
                invalid={!!errors.departmentUuid}
                invalidText={errors.departmentUuid}
                onChange={({ selectedItem }) => {
                  setDepartmentUuid(selectedItem);
                  setServiceUuid('');
                }}
                selectedItem={departmentUuid}
                size="sm"
                disabled={isLoadingDepartments}
              />
              {isLoadingDepartments && <InlineLoading className={styles.inlineLoading} />}
            </div>
            
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>{t('service', 'Service')}</label>
              <Dropdown
                id="service"
                label={isLoadingServices ? t('loading', 'Loading...') : t('pleaseSelect', 'Please select')}
                items={getServicesForDepartment(departmentUuid).map(svc => svc.facilityServicePriceId.toString())}
                itemToString={(uuid) => {
                  const service = getServicesForDepartment(departmentUuid).find(
                    s => s.facilityServicePriceId.toString() === uuid
                  );
                  return service ? `${service.name} (${service.fullPrice} ${defaultCurrency})` : '';
                }}
                invalid={!!errors.serviceUuid}
                invalidText={errors.serviceUuid}
                onChange={({ selectedItem }) => setServiceUuid(selectedItem)}
                selectedItem={serviceUuid}
                disabled={!departmentUuid || isLoadingServices}
                size="md"
              />
              {isLoadingServices && <InlineLoading className={styles.inlineLoading} />}
            </div>
          </div>
          
          <div className={styles.formControls}>
            <div className={styles.controlsGroup}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>{t('quantity', 'Quantity')}</label>
                <NumberInput
                  id="quantity"
                  min={1}
                  value={quantity}
                  onChange={(e, { value }) => setQuantity(value)}
                  invalidText={errors.quantity}
                  invalid={!!errors.quantity}
                  hideSteppers={true}
                  size="md"
                  className={styles.numberInput}
                />
              </div>
              
              {departmentUuid === '11' && (
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>{t('frequency', 'Frequency')}</label>
                  <TextInput
                    id="drugFrequency"
                    value={drugFrequency}
                    onChange={(e) => setDrugFrequency(e.target.value)}
                    placeholder="e.g. 1×3"
                    size="md"
                  />
                </div>
              )}
            </div>
            
            <div className={styles.addButtonContainer}>
              <Button 
                className={styles.addButton}
                kind="primary" 
                onClick={addService} 
                disabled={!serviceUuid}
                size="md"
              >
                {t('addItem', 'Add Item')}
              </Button>
            </div>
          </div>
        </Form>
      </Tile>
      
      {/* Items table */}
      {calculatorItems.length > 0 && (
        <div className={styles.tableContainerCompact}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th className={styles.itemColumn}>{t('item', 'Item')}</th>
                <th className={styles.qtyColumn}>{t('qty', 'Qty')}</th>
                <th className={styles.dosageColumn}>{t('dosage', 'Dosage')}</th>
                <th className={styles.priceColumn}>{t('price', 'Price')}</th>
                <th className={styles.actionColumn}></th>
              </tr>
            </thead>
            
            <tbody>
              {calculatorItems.map((item, index) => (
                <tr key={`${item.uuid}-${index}`}>
                  <td className={styles.itemCell}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDept}>{item.departmentName}</div>
                  </td>
                  
                  <td className={styles.qtyCell}>
                    <input
                      type="number"
                      id={`item-qty-${index}`}
                      value={item.quantity}
                      min={1}
                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                      className={styles.qtyInputPlain}
                    />
                  </td>
                  
                <td className={styles.dosageCell}>
                    {item.isDrug ? item.drugFrequency : (
                      <span className={styles.notApplicable}>-</span>
                    )}
                  </td>
                  
                  <td className={styles.priceCell}>
                    {(item.totalPrice || (item.price * item.quantity)).toLocaleString()} {defaultCurrency}
                  </td>
                  
                  <td className={styles.actionCell}>
                    <Button
                      kind="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className={styles.removeButton}
                      iconDescription={t('remove', 'Remove')}
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            
            <tfoot>
              <tr className={styles.totalRow}>
                <td colSpan={3} className={styles.totalLabelCell}>
                  <span className={styles.totalLabel}>{t('total', 'Total')}:</span>
                </td>
                <td colSpan={2} className={styles.totalAmountCell}>
                  <span className={styles.totalAmount}>{total.toLocaleString()} {defaultCurrency}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServiceCalculator;
