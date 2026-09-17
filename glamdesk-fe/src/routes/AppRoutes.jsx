import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layout/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AppointmentsPage from '../pages/appointments/AppointmentsPage';
import ClientsPage from '../pages/clients/ClientsPage';
import QuotationsPage from '../pages/quotations/QuotationsPage';
import PaymentsPage from '../pages/payments/PaymentsPage';
import MastersPage from '../pages/masters/MastersPage';
import SettingsPage from '../pages/settings/SettingsPage';
import NotFoundPage from '../pages/error/NotFoundPage';

// ProtectedRoute component: Requires authentication to access CRM
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// PublicOnlyRoute component: Prevents logged-in users from seeing login/signup pages
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth / Public Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* Main Layout Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        
        {/* Payments Routes */}
        <Route path="payments" element={<Navigate to="/payments/client" replace />} />
        <Route path="payments/client" element={<PaymentsPage subTab="client" />} />
        <Route path="payments/vendor" element={<PaymentsPage subTab="vendor" />} />

        {/* Masters Routes */}
        <Route path="masters" element={<Navigate to="/masters/services" replace />} />
        <Route path="masters/services" element={<MastersPage subTab="services" />} />
        <Route path="masters/venue" element={<MastersPage subTab="venue" />} />
        <Route path="masters/vendors" element={<MastersPage subTab="vendors" />} />

        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 Page for unspecified/invalid endpoints */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
