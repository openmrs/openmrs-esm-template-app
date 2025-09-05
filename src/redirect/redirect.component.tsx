
import React, { useEffect } from 'react';

const Redirect: React.FC = () => {
  useEffect(() => {
    const hasBeenRedirected = sessionStorage.getItem('hasBeenRedirected');

    if (!hasBeenRedirected) {
      sessionStorage.setItem('hasBeenRedirected', 'true');
      window.location.href = '/openmrs/spa/root';
    }
  }, []);

  return null;
};

export default Redirect;
