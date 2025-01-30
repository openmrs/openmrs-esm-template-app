import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SideNav, SideNavItems, SideNavLink } from '@carbon/react';
import { Wallet, Money, HelpDesk, TagImport, PricingTailored } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { UserHasAccess, navigate } from '@openmrs/esm-framework';
import styles from './billing-home.scss';
import Department from '../Department';
import Service from '../Service';
import FacilityServicePrice from '../FacilityServicePrice';
import Insurance from '../Insurance';
import BillingAdminHeader from '../billing-admin-header/billing-admin-header.component';
import ThirdParty from '../ThirdParty';

const BillingAdminHome: React.FC = () => {
  const { t } = useTranslation();
  const basePath = `${window.spaBase}/billing-admin`;

  const handleNavigation = (path: string) => {
    navigate({ to: `${basePath}/${path}` });
  };

  return (
    <BrowserRouter basename={`${window.spaBase}/billing-admin`}>
      <main className={styles.mainSection}>
        <section>
          <SideNav>
            <SideNavItems>
              <SideNavLink onClick={() => handleNavigation('')} renderIcon={Wallet} isActive>
                {t('department', 'Department')}
              </SideNavLink>
              <UserHasAccess privilege="coreapps.systemAdministration">
                <SideNavLink onClick={() => handleNavigation('service')} renderIcon={Money}>
                  {t('service', 'Service')}
                </SideNavLink>
                <SideNavLink onClick={() => handleNavigation('facility-service-price')} renderIcon={PricingTailored}>
                  {t('facility-service-price', 'Facility service price')}
                </SideNavLink>
                <SideNavLink onClick={() => handleNavigation('insurance')} renderIcon={TagImport}>
                  {t('insurance', 'Insurance')}
                </SideNavLink>
                <SideNavLink onClick={() => handleNavigation('third-party')} renderIcon={HelpDesk}>
                  {t('third-party', 'Third party')}
                </SideNavLink>
              </UserHasAccess>
            </SideNavItems>
          </SideNav>
        </section>
        <section>
          <BillingAdminHeader title={t('billingAdmin', 'Billing Admin')} />
          <Routes>
            <Route path="/" element={<Department />} />
            <Route path="/service" element={<Service />} />
            <Route path="/facility-service-price" element={<FacilityServicePrice />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/third-party" element={<ThirdParty />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
};

export default BillingAdminHome;
