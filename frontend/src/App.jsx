import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import InvoicesPage from './pages/InvoicesPage';
import SummaryPage from './pages/SummaryPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/invoices" replace />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="summary" element={<SummaryPage />} />
        <Route path="customers/:id" element={<CustomerProfilePage />} />
        <Route path="*" element={<Navigate to="/invoices" replace />} />
      </Route>
    </Routes>
  );
}
