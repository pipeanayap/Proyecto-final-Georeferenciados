import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/citizen/Dashboard';
import NewReport from './pages/citizen/NewReport';
import ReportDetail from './pages/citizen/ReportDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import AdminReportDetail from './pages/admin/AdminReportDetail';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/reports/new" element={<ProtectedRoute><NewReport /></ProtectedRoute>} />
          <Route path="/reports/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/reports/:id" element={<ProtectedRoute adminOnly><AdminReportDetail /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
