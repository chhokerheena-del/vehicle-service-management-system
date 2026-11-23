import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, ShieldCheck, Clock, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      paddingTop: '3.5rem',
      paddingBottom: '2rem'
    }} className="no-print">
      <div className="container">
        <div className="grid grid-cols-4" style={{ marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Wrench size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                AutoCare <span style={{ color: '#3b82f6' }}>Pro</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8' }}>
              Next-generation enterprise vehicle service & maintenance management platform. Real-time telemetry tracking, certified mechanics, transparent invoicing, and 100% genuine OEM parts.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#38bdf8', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} /> 6-Month / 10,000 km Service Warranty
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Automotive Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Link to="/services" style={{ color: '#94a3b8' }}>Periodic Maintenance</Link>
              <Link to="/services" style={{ color: '#94a3b8' }}>Synthetic Oil Change</Link>
              <Link to="/services" style={{ color: '#94a3b8' }}>Brake System Overhaul</Link>
              <Link to="/services" style={{ color: '#94a3b8' }}>AC Sanitization & Gas Recharge</Link>
              <Link to="/services" style={{ color: '#94a3b8' }}>ECU Scan & OBD-II Diagnostics</Link>
              <Link to="/services" style={{ color: '#94a3b8' }}>3D Wheel Alignment</Link>
            </div>
          </div>

          {/* Service Hubs */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Service Centers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Link to="/service-centers" style={{ color: '#94a3b8' }}>Delhi South Hub (Okhla)</Link>
              <Link to="/service-centers" style={{ color: '#94a3b8' }}>Bengaluru Tech Hub (Koramangala)</Link>
              <Link to="/service-centers" style={{ color: '#94a3b8' }}>Mumbai Metro (Andheri East)</Link>
              <Link to="/service-centers" style={{ color: '#94a3b8' }}>Pune Prime (Baner)</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', color: '#e2e8f0', fontSize: '0.8rem' }}>
                <Clock size={14} /> Open 7 Days: 8:00 AM - 8:00 PM
              </div>
            </div>
          </div>

          {/* Viva & Academic Info */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DBMS Viva & Architecture
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#94a3b8', marginBottom: '1rem' }}>
              Developed as a 3NF normalized relational database management system using MySQL 8.0, Prisma ORM, and Express.js.
            </p>
            <Link
              to="/viva-guide"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: '600'
              }}
            >
              <Database size={15} /> Open DBMS Viva Guide
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem'
        }}>
          <div>
            © {new Date().getFullYear()} AutoCare Pro. All rights reserved. BTech CSE DBMS Major Project.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>MySQL 8.0 Engine: InnoDB</span>
            <span>Prisma ORM 5.22</span>
            <span>REST API v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
