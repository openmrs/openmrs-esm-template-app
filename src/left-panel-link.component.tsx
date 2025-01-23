import React, { useMemo, useState } from "react";
import last from "lodash-es/last";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { ConfigurableLink } from "@openmrs/esm-framework";
import BillingSidebarLinks from "./billing-sidebar/BillingSidebarLinks";
 
export interface LinkConfig {
  name: string;
  title: string;
}
 
function LinkExtension({ config }: { config: LinkConfig }) {
  const { name, title } = config;
  const location = useLocation();
  const navigate = useNavigate();
  const spaBasePath = window.getOpenmrsSpaBase() + "home";
  const [isExpanded, setIsExpanded] = useState(false);

  const urlSegment = useMemo(() => decodeURIComponent(last(location.pathname.split("/"))), [location.pathname]);
  const isActive = name === urlSegment || location.pathname.startsWith(`${spaBasePath}/${name}`);

  const handleBillingClick = (e: React.MouseEvent) => {
    if (name === "billing") {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        window.open(`${spaBasePath}/${name}`, '_blank');
      } else {
        setIsExpanded((prev) => !prev);
        // Navigate to billing page
        navigate(`${spaBasePath}/${name}`);
      }
    }
  };

  return (
    <div>
      {name === "billing" ? (
        <a 
          href={`${spaBasePath}/${name}`}
          onClick={handleBillingClick}
          className={`cds--side-nav__link ${isActive ? 'active-left-nav-link' : ''}`}
        >
          {title}
        </a>
      ) : (
        <ConfigurableLink
          to={`${spaBasePath}/${name}`}
          className={`cds--side-nav__link ${isActive && "active-left-nav-link"}`}
        >
          {title}
        </ConfigurableLink>
      )}
      {name === "billing" && isExpanded && (
        <div className="cds--side-nav__submenu" style={{flexDirection: 'column' }}>
          <BillingSidebarLinks />
        </div>
      )}
    </div>
  );
}
 
export const createLeftPanelLink = (config: LinkConfig) => () =>
  (
    <BrowserRouter>
      <LinkExtension config={config} />
    </BrowserRouter>
  );