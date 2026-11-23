import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Car, Calendar, CheckCircle2, IndianRupee,
  Clock, Package, Wrench, TrendingUp, AlertTriangle,
  ArrowRight, Loader2, BarChart3, Database
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import {
  RevenueBarChart,
  StatusDistribution,
  PopularServicesChart
} from '../../components/ChartComponents';

import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentApts, setRecentApts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, aRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/analytics-charts'),
        api.get('/appointments?limit=8')
      ]);
      if (sRes.success) setStats(sRes.data);
      if (cRes.success) setCharts(cRes.data);
      if (aRes.success) setRecentApts(aRes.data);
    } catch (err) {
      console.error('Admin dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        <Loader2 size={36} style={{ margin: '0 auto 1rem', color: '#2563eb', animation: 'spin 1s linear infinite' }} />
        <p>Loading executive dashboard...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        padding: '1.75rem 2rem', backgroundColor: '#ffffff',
        borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.08em' }}>
            System Administrator
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.1rem' }}>
            Executive Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Operational KPIs, revenue analytics, and system health overview.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/reports" className="btn btn-outline">
            <BarChart3 size={18} /> DBMS Reports
          </Link>
          <Link to="/admin/viva-queries" className="btn btn-primary">
            <Database size={18} /> SQL Explorer
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      {stats && (
        <div className="grid grid-cols-4">
          <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="primary" change="Registered accounts" />
          <StatCard title="Registered Vehicles" value={stats.totalVehicles} icon={Car} color="secondary" change="In system" />
          <StatCard title="Total Appointments" value={stats.totalAppointments} icon={Calendar} color="warning" change={`${stats.pendingAppointments} pending`} />
          <StatCard title="Completed Services" value={stats.completedServices} icon={CheckCircle2} color="success" change="Workshop verified" />
        </div>
      )}
      {stats && (
        <div className="grid grid-cols-4">
          <StatCard title="Total Revenue" value={`₹${Number(stats.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={IndianRupee} color="success" change="Collected (PAID)" />
          <StatCard title="Pending Revenue" value={`₹${Number(stats.pendingRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={Clock} color="warning" change="Awaiting payment" />
          <StatCard title="Active Mechanics" value={stats.activeMechanics} icon={Wrench} color="primary" change="Available now" />
          <StatCard title="Low Stock Alerts" value={stats.lowStockParts} icon={AlertTriangle} color={stats.lowStockParts > 0 ? 'danger' : 'secondary'} change="Parts needing reorder" />
        </div>
      )}

      {/* Charts */}
      {charts && <ChartComponents data={charts} />}

      {/* Recent Appointments Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Appointments</h3>
          <Link to="/staff/appointments" className="btn btn-outline btn-sm">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Appointment #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Center</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentApts.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No appointments found.</td></tr>
              ) : recentApts.map(a => (
                <tr key={a.id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#2563eb', fontSize: '0.85rem' }}>{a.appointmentNumber}</span></td>
                  <td><span style={{ fontWeight: '600' }}>{a.user?.name}</span><br /><span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{a.user?.phone}</span></td>
                  <td><span style={{ fontWeight: '600' }}>{a.vehicle?.make} {a.vehicle?.model}</span><br /><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#64748b' }}>{a.vehicle?.regNumber}</span></td>
                  <td style={{ fontSize: '0.88rem' }}>{a.service?.name}</td>
                  <td style={{ fontSize: '0.85rem' }}>{a.serviceCenter?.city}</td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(a.preferredDate).toLocaleDateString('en-IN')}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { to: '/admin/management', icon: Users, label: 'User & System Management', desc: 'Manage users, services, mechanics, and service centers.' },
          { to: '/admin/reports', icon: TrendingUp, label: 'Revenue & Analytics Reports', desc: 'View DBMS views for revenue, inventory, and performance.' },
          { to: '/admin/viva-queries', icon: Database, label: 'SQL Query Explorer', desc: '15 curated DBMS queries for academic viva demonstration.' }
        ].map(item => (
          <Link key={item.to} to={item.to} className="card" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>{item.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
