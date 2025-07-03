import React from 'react';
import { Routes, Route } from 'react-router-dom';
const OfferingsDashboard = React.lazy(() => import('./OfferingsDashboard'));

function Offerings() {
  return (
    <Routes>
      <Route index element={<OfferingsDashboard />} />
    </Routes>
  );
}

export default Offerings;
