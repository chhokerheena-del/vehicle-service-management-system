import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Public pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Services from './pages/public/Services';
import ServiceCenters from './pages/public/ServiceCenters';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import VivaGuide from './pages/public/VivaGuide';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyVehicles from './pages/customer/MyVehicles';
import BookService from './pages/customer/BookService';
import Appointments from './pages/customer/Appointments';
import ServiceHistory from './pages/customer/ServiceHistory';
import Invoices from './pages/customer/Invoices';
import Payments from './pages/customer/Payments';
import Profile from './pages/customer/Profile';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffAppointments from './pages/staff/StaffAppointments';
import ProcessService from './pages/staff/ProcessService';
import StaffInventory from './pages/staff/StaffInventory';
import StaffMechanics from './pages/staff/StaffMechanics';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagementConsole from './pages/admin/ManagementConsole';
import AdminReports from './pages/admin/AdminReports';
import AdminVivaQueries from './pages/admin/AdminVivaQueries';

// ─── Loading Spinner ─────────────────────────────────────────────────────────
function LoadingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        width: '48px', height: '48px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#64748b', fontWeight: '600' }}>Loading AutoCare Pro...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Route Guards ────────────────────────────────────────────────────────────
function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingPage />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
}

function RedirectIfLoggedIn({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }
  return children;
}

// ─── App Shell with Sidebar ───────────────────────────────────────────────────
function AppShell({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Public Shell (Navbar + Footer) ──────────────────────────────────────────
function PublicShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<PublicShell><Home /></PublicShell>} />
        <Route path="/services" element={<PublicShell><Services /></PublicShell>} />
        <Route path="/service-centers" element={<PublicShell><ServiceCenters /></PublicShell>} />
        <Route path="/about" element={<PublicShell><About /></PublicShell>} />
        <Route path="/contact" element={<PublicShell><Contact /></PublicShell>} />
        <Route path="/viva-guide" element={<PublicShell><VivaGuide /></PublicShell>} />

        {/* ── Auth Routes (redirect if logged in) ── */}
        <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
        <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />

        {/* ── Customer Routes ── */}
        <Route path="/customer/dashboard" element={
          <RequireAuth allowedRoles={['CUSTOMER']}>
            <AppShell><CustomerDashboard /></AppShell>
          </RequireAuth>
        } />
        <Route path="/customer/vehicles" element={
          <RequireAuth allowedRoles={['CUSTOMER']}>
            <AppShell><MyVehicles /></AppShell>
          </RequireAuth>
        } />
        <Route path="/customer/book-service" element={
          <RequireAuth allowedRoles={['CUSTOMER']}>
            <AppShell><BookService /></AppShell>
          </RequireAuth>
        } />
        <Route path="/customer/appointments" element={
          <RequireAuth allowedRoles={['CUSTOMER']}>
            <AppShell><Appointments /></AppShell>
          </RequireAuth>
        } />
        <Route path="/customer/history" element={
          <RequireAuth allowedRoles={['CUSTOMER']}>
            <AppShell><ServiceHistory /></AppShell>
          </RequireAuth>
        } />
        <Route path="/customer/invoices" element={
          <RequireAuth allowedRoles={['CUSTOMER']}>
            <AppShell><Invoices /></AppShell>
          </RequireAuth>
        } />
        <Route path="/customer/payments" element={
          <RequireAuth allowedRoles={['CUSTOMER']}>
            <AppShell><Payments /></AppShell>
          </RequireAuth>
        } />
        <Route path="/customer/profile" element={
          <RequireAuth allowedRoles={['CUSTOMER']}>
            <AppShell><Profile /></AppShell>
          </RequireAuth>
        } />

        {/* ── Staff Routes ── */}
        <Route path="/staff/dashboard" element={
          <RequireAuth allowedRoles={['STAFF', 'ADMIN']}>
            <AppShell><StaffDashboard /></AppShell>
          </RequireAuth>
        } />
        <Route path="/staff/appointments" element={
          <RequireAuth allowedRoles={['STAFF', 'ADMIN']}>
            <AppShell><StaffAppointments /></AppShell>
          </RequireAuth>
        } />
        <Route path="/staff/process/:id" element={
          <RequireAuth allowedRoles={['STAFF', 'ADMIN']}>
            <AppShell><ProcessService /></AppShell>
          </RequireAuth>
        } />
        <Route path="/staff/inventory" element={
          <RequireAuth allowedRoles={['STAFF', 'ADMIN']}>
            <AppShell><StaffInventory /></AppShell>
          </RequireAuth>
        } />
        <Route path="/staff/mechanics" element={
          <RequireAuth allowedRoles={['STAFF', 'ADMIN']}>
            <AppShell><StaffMechanics /></AppShell>
          </RequireAuth>
        } />

        {/* ── Admin Routes ── */}
        <Route path="/admin/dashboard" element={
          <RequireAuth allowedRoles={['ADMIN']}>
            <AppShell><AdminDashboard /></AppShell>
          </RequireAuth>
        } />
        <Route path="/admin/management" element={
          <RequireAuth allowedRoles={['ADMIN']}>
            <AppShell><ManagementConsole /></AppShell>
          </RequireAuth>
        } />
        <Route path="/admin/reports" element={
          <RequireAuth allowedRoles={['ADMIN']}>
            <AppShell><AdminReports /></AppShell>
          </RequireAuth>
        } />
        <Route path="/admin/viva-queries" element={
          <RequireAuth allowedRoles={['ADMIN']}>
            <AppShell><AdminVivaQueries /></AppShell>
          </RequireAuth>
        } />

        {/* ── Catch-all Redirect ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
