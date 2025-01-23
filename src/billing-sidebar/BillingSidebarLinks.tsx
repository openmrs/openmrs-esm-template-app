import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Enterprise,
    ServiceLevels,
    Hospital,
    Money,
    Finance,
} from '@carbon/react/icons';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useLocation } from 'react-router-dom';

const BillingSidebarLinks: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const spaBasePath = window.getOpenmrsSpaBase() + "home/billing";

    const links = [
        {
            name: 'department',
            title: t('department', 'Department'),
            Icon: Enterprise
        },
        {
            name: 'service',
            title: t('service', 'Service'),
            Icon: ServiceLevels
        },
        {
            name: 'insurance',
            title: t('insurance', 'Insurance'),
            Icon: Hospital
        },
        {
            name: 'facility-service-price',
            title: t('facilityServicePrice', 'Facility Service Price'),
            Icon: Money
        },
        {
            name: 'third-party',
            title: t('thirdParty', 'Third Party'),
            Icon: Finance
        },
    ];

    return (
        <>
            {links.map(({ name, title, Icon }) => {
                const to = `${spaBasePath}/${name}`;
                const isActive = location.pathname === to;
                
                return (
                    <ConfigurableLink
                        key={name}
                        to={to}
                        className={`cds--side-nav__link ${isActive ? 'active-left-nav-link' : ''}`}
                    >
                        <div className="cds--side-nav__icon-wrapper">
                            <Icon size={16} className="cds--side-nav__menu-icon" />
                        </div>
                        <span className="cds--side-nav__link-text">{title}</span>
                    </ConfigurableLink>
                );
            })}
        </>
    );
};

export default BillingSidebarLinks;