import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Clock, 
  History, 
  FileText, 
  CreditCard, 
  User, 
  LogOut, 
  Wrench, 
  Package, 
  Users, 
  BarChart3, 
  Database,
  Building2,
  SlidersHorizontal
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, isCustomer, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar no-print">
      {/* Header Info */}
      <div className="sidebar-header">
        <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
          {isAdmin ? 'ADMIN CONSOLE' : (isStaff ? 'STAFF WORKSPACE' : 'CUSTOMER PORTAL')}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.name || 'User'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600' }}>
          {user?.role}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="sidebar-nav">
        {/* CUSTOMER MENU */}
        {isCustomer && (
          <>
            <NavLink to="/customer/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/customer/vehicles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Car size={18} /> My Vehicles
            </NavLink>
            <NavLink to="/customer/book-service" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} /> Book Service
            </NavLink>
            <NavLink to="/customer/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Clock size={18} /> Appointments
            </NavLink>
            <NavLink to="/customer/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <History size={18} /> Service History
            </NavLink>
            <NavLink to="/customer/invoices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} /> Invoices
            </NavLink>
            <NavLink to="/customer/payments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} /> Payments
            </NavLink>
            <NavLink to="/customer/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <User size={18} /> Profile
            </NavLink>
          </>
        )}

        {/* STAFF MENU */}
        {isStaff && (
          <>
            <NavLink to="/staff/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Operations Overview
            </NavLink>
            <NavLink to="/staff/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Clock size={18} /> Service Queue
            </NavLink>
            <NavLink to="/staff/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Package size={18} /> Parts Inventory
            </NavLink>
            <NavLink to="/staff/mechanics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Wrench size={18} /> Workshop Mechanics
            </NavLink>
          </>
        )}

        {/* ADMIN MENU */}
        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Executive Dashboard
            </NavLink>
            <NavLink to="/admin/management" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <SlidersHorizontal size={18} /> Management Console
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} /> DBMS Reports
            </NavLink>
            <NavLink to="/admin/viva-queries" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Database size={18} /> Viva SQL Explorer
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer / Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', color: '#f87171' }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
