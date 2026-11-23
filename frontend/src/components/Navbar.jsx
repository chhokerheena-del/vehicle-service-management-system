import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, User, LogOut, Menu, X, Database, Shield, LayoutDashboard, Calendar } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isCustomer, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isStaff) return '/staff/dashboard';
    return '/customer/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(37,99,235,0.35)'
          }}>
            <Wrench size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
              AutoCare <span style={{ color: '#2563eb' }}>Pro</span>
            </span>
            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Automobile Service Platform
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="no-print">
          <Link
            to="/services"
            style={{
              fontSize: '0.925rem',
              fontWeight: isActive('/services') ? '700' : '500',
              color: isActive('/services') ? '#2563eb' : '#475569'
            }}
          >
            Services
          </Link>
          <Link
            to="/service-centers"
            style={{
              fontSize: '0.925rem',
              fontWeight: isActive('/service-centers') ? '700' : '500',
              color: isActive('/service-centers') ? '#2563eb' : '#475569'
            }}
          >
            Service Centers
          </Link>
          <Link
            to="/about"
            style={{
              fontSize: '0.925rem',
              fontWeight: isActive('/about') ? '700' : '500',
              color: isActive('/about') ? '#2563eb' : '#475569'
            }}
          >
            About
          </Link>
          <Link
            to="/contact"
            style={{
              fontSize: '0.925rem',
              fontWeight: isActive('/contact') ? '700' : '500',
              color: isActive('/contact') ? '#2563eb' : '#475569'
            }}
          >
            Contact
          </Link>
          <Link
            to="/viva-guide"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#d97706',
              backgroundColor: '#fef3c7',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid #fde68a'
            }}
          >
            <Database size={14} /> DBMS Viva Guide
          </Link>
        </div>

        {/* Right CTA / Auth controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }} className="no-print">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to={getDashboardPath()} className="btn btn-primary btn-sm">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#2563eb' }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                title="Logout"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/login" className="btn btn-primary btn-sm">
                <Calendar size={16} /> Book Service
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
