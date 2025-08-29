import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Role } from './types';

// Page Components
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import CashierPOS from './pages/cashier/CashierPOS';
import StudentDashboard from './pages/student/StudentDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          user ? (
            <MainDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
       <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const MainDashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case Role.ADMIN:
      return <AdminDashboard />;
    case Role.MANAGER:
      return <ManagerDashboard />;
    case Role.CASHIER:
      return <CashierPOS />;
    case Role.STUDENT:
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};


export default App;