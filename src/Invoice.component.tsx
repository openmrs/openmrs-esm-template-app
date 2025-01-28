import React from 'react';
import { useLocation } from 'react-router-dom';

const Invoice: React.FC = () => {
  const location = useLocation();
  const billData = location.state?.billData;

  if (!billData) {
    return <p>No bill data available</p>;
  }

  return (
    <div>
      <h2>Invoice Details</h2>
    </div>
  );
};

export default Invoice;