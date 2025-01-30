import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SideNav, SideNavItems, SideNavLink, SideNavMenu, SideNavMenuItem } from '@carbon/react';
import { Wallet, Money, Settings } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { UserHasAccess, navigate } from '@openmrs/esm-framework';
import styles from './billing-home.scss';
import Department from '../Department';
import Service from '../Service';
import FacilityServicePrice from '../FacilityServicePrice';
import PatientBills from '../patientbills.component';
import Insurance from '../Insurance';
import BillingAdminHeader from '../billing-admin-header/billing-admin-header.component';

const BillingAdminHome: React.FC = () => {
  const { t } = useTranslation();
  const basePath = `${window.spaBase}/billing-admin`;

  const handleNavigation = (path: string) => {
    navigate({ to: `${basePath}/${path}` });
  };

  const handleCloseAddService = () => {
    navigate({ to: `${basePath}` });
  };

  return (
    <BrowserRouter basename={`${window.spaBase}/billing-admin`}>
      <main className={styles.mainSection}>
        <section>
          <SideNav>
            <SideNavItems>
              <SideNavLink onClick={() => handleNavigation('')} renderIcon={Wallet} isActive>
                {t('billingAdmin', 'Billing Admin')}
              </SideNavLink>
              <UserHasAccess privilege="coreapps.systemAdministration">
                <SideNavLink onClick={() => handleNavigation('department')} renderIcon={Money}>
                  {t('department', 'Department')}
                </SideNavLink>
                <SideNavMenu title={t('billingSettings', 'Billing Settings')} renderIcon={Settings}>
                  <SideNavMenuItem onClick={() => handleNavigation('add-service')}>
                    {t('add-service', 'Add service')}
                  </SideNavMenuItem>
                  <SideNavMenuItem onClick={() => handleNavigation('facility-service-price')}>
                    {t('facility-service-price', 'Facility service price')}
                  </SideNavMenuItem>
                </SideNavMenu>
              </UserHasAccess>
            </SideNavItems>
          </SideNav>
        </section>
        <section>
          <BillingAdminHeader title={t('billingAdmin', 'Billing Admin')} />
          <Routes>
            <Route path="/" element={<Insurance />} />
            <Route path="/department" element={<Department />} />
            <Route path="/add-service" element={<Service />} />
            <Route path="/facility-service-price" element={<FacilityServicePrice />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
};

export default BillingAdminHome;
