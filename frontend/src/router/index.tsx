import { Navigate, Route, Routes } from 'react-router-dom';

import EmployeeDetailsPage from '../pages/EmployeeDetailsPage';
import EmployeeFormPage from '../pages/EmployeeFormPage';
import EmployeeListPage from '../pages/EmployeeListPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/employees" replace />} />
      <Route path="/employees" element={<EmployeeListPage />} />
      <Route path="/employees/new" element={<EmployeeFormPage />} />
      <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
      <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}
