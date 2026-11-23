import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Users, Wrench, Loader2, RefreshCw, IndianRupee } from 'lucide-react';
import api from '../../services/api';

const TABS = [
  { id: 'revenue', label: 'Revenue by Center', icon: TrendingUp },
  { id: 'mechanics', label: 'Mechanic Performance', icon: Wrench },
  { id: 'inventory', label: 'Inventory Status', icon: Package },
  { id: 'history', label: 'Customer History', icon: Users },
  { id: 'services', label: 'Services Demand', icon: BarChart3 }
];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReport(); }, [activeTab]);

  const loadReport = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'revenue') res = await api.get('/reports/revenue');
      else if (activeTab === 'mechanics') res = await api.get('/reports/mechanics');
      else if (activeTab === 'inventory') res = await api.get('/reports/inventory');
      else if (activeTab === 'history') res = await api.get('/reports/customer-history');
      else if (activeTab === 'services') res = await api.get('/reports/services');
      if (res?.success) setData(res.data);
    } catch (err) {
      console.error('Report load error:', err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>DBMS Reports & Analytics</h1>
        <p style={{ color: '#64748b', marginTop: '0.2rem' }}>Reports generated from SQL Views, Raw Queries, and Aggregated Data.</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', borderRadius: '12px', padding: '0.5rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
              backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{TABS.find(t => t.id === activeTab)?.label} Report</h3>
          <button onClick={loadReport} className="btn btn-outline btn-sm"><RefreshCw size={16} /> Refresh</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p>Executing SQL query...</p>
          </div>
        ) : !data ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <p>Failed to load report. Ensure MySQL is running and views are created.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'revenue' && <RevenueReport data={data} />}
            {activeTab === 'mechanics' && <MechanicsReport data={data} />}
            {activeTab === 'inventory' && <InventoryReport data={data} />}
            {activeTab === 'history' && <HistoryReport data={data} />}
            {activeTab === 'services' && <ServicesReport data={data} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Individual Report Tables ─────────────────────────────────────────────────
function RevenueReport({ data }) {
  const summary = data.summary || {};
  const centers = data.centers || [];
  return (
    <>
      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', margin: '1.5rem 1rem' }}>
        {[
          { label: 'Total Appointments', value: Number(summary.total_appointments || 0), color: '#eff6ff', textColor: '#2563eb' },
          { label: 'Completed', value: Number(summary.completed_appointments || 0), color: '#f0fdf4', textColor: '#16a34a' },
          { label: 'Gross Revenue', value: `₹${Number(summary.gross_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#fffbeb', textColor: '#b45309' },
          { label: 'Collected Revenue', value: `₹${Number(summary.realized_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#f0fdf4', textColor: '#16a34a' }
        ].map(card => (
          <div key={card.label} style={{ background: card.color, borderRadius: '10px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: card.textColor }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop: '0.2rem' }}>{card.label}</div>
          </div>
        ))}
      </div>
      <table className="table">
        <thead><tr><th>Service Center</th><th>City</th><th>Appointments</th><th>Completed</th><th>Gross Revenue</th><th>Realized Revenue</th><th>Pending Revenue</th><th>Tax Collected</th><th>Realization %</th></tr></thead>
        <tbody>
          {centers.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No data available. Run database migrations and seed data first.</td></tr> : centers.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: '700' }}>{r.service_center_name}</td>
              <td>{r.city}</td>
              <td style={{ textAlign: 'center' }}>{Number(r.total_appointments || 0)}</td>
              <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: '600' }}>{Number(r.completed_appointments || 0)}</td>
              <td style={{ fontWeight: '600' }}>₹{Number(r.gross_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
              <td style={{ color: '#16a34a', fontWeight: '700' }}>₹{Number(r.realized_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
              <td style={{ color: '#d97706', fontWeight: '600' }}>₹{Number(r.pending_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
              <td>₹{Number(r.total_tax_collected || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
              <td>
                <span style={{ fontWeight: '700', color: Number(r.realization_percentage || 0) >= 80 ? '#16a34a' : '#d97706' }}>
                  {r.realization_percentage ? `${Number(r.realization_percentage).toFixed(1)}%` : 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function MechanicsReport({ data }) {
  const rows = Array.isArray(data) ? data : [];
  return (
    <table className="table">
      <thead><tr><th>Mechanic</th><th>Employee ID</th><th>Specialization</th><th>Exp. (Yrs)</th><th>Service Center</th><th>Jobs Completed</th><th>Avg Rating</th><th>Feedback Count</th></tr></thead>
      <tbody>
        {rows.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No mechanic performance data.</td></tr> : rows.map((r, i) => (
          <tr key={i}>
            <td style={{ fontWeight: '700' }}>{r.mechanic_name}</td>
            <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#475569' }}>{r.employee_id}</span></td>
            <td>{r.specialization}</td>
            <td style={{ textAlign: 'center' }}>{r.experience_years}</td>
            <td>{r.service_center_name}</td>
            <td style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>{Number(r.jobs_completed || 0)}</td>
            <td style={{ textAlign: 'center' }}>
              {r.average_customer_rating ? (
                <span style={{ fontWeight: '700', color: Number(r.average_customer_rating) >= 4 ? '#16a34a' : '#d97706' }}>
                  ★ {Number(r.average_customer_rating).toFixed(1)}
                </span>
              ) : <span style={{ color: '#94a3b8' }}>No ratings</span>}
            </td>
            <td style={{ textAlign: 'center' }}>{Number(r.feedback_count || 0)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InventoryReport({ data }) {
  const summary = data.summary || {};
  const parts = Array.isArray(data.parts) ? data.parts : [];
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', margin: '1.5rem 1rem' }}>
        {[
          { label: 'Total Parts', value: Number(summary.total_parts_catalog || 0), color: '#eff6ff', textColor: '#2563eb' },
          { label: 'Total Units in Stock', value: Number(summary.total_units_in_stock || 0), color: '#f0fdf4', textColor: '#16a34a' },
          { label: 'Out of Stock', value: Number(summary.out_of_stock_count || 0), color: '#fef2f2', textColor: '#dc2626' },
          { label: 'Low Stock Alerts', value: Number(summary.low_stock_count || 0), color: '#fffbeb', textColor: '#d97706' }
        ].map(card => (
          <div key={card.label} style={{ background: card.color, borderRadius: '10px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: card.textColor }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop: '0.2rem' }}>{card.label}</div>
          </div>
        ))}
      </div>
      <table className="table">
        <thead><tr><th>Part Number</th><th>Name</th><th>Category</th><th>Unit Price</th><th>Stock</th><th>Min Level</th><th>Stock Health</th><th>Reorder Qty</th><th>Inventory Value</th></tr></thead>
        <tbody>
          {parts.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No inventory data.</td></tr> : parts.map((p, i) => (
            <tr key={i}>
              <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#475569' }}>{p.part_number}</span></td>
              <td style={{ fontWeight: '600' }}>{p.part_name}</td>
              <td>{p.category}</td>
              <td>₹{Number(p.unit_price || 0).toLocaleString('en-IN')}</td>
              <td style={{ fontWeight: '700', color: Number(p.stock_quantity) === 0 ? '#dc2626' : Number(p.stock_quantity) <= Number(p.min_stock_level) ? '#d97706' : '#16a34a' }}>{p.stock_quantity}</td>
              <td>{p.min_stock_level}</td>
              <td>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700',
                  backgroundColor: p.replenishment_recommendation === 'URGENT_REORDER' ? '#fef2f2' : p.replenishment_recommendation === 'REORDER_SOON' ? '#fffbeb' : '#f0fdf4',
                  color: p.replenishment_recommendation === 'URGENT_REORDER' ? '#dc2626' : p.replenishment_recommendation === 'REORDER_SOON' ? '#d97706' : '#16a34a'
                }}>
                  {p.replenishment_recommendation?.replace(/_/g, ' ') || 'HEALTHY'}
                </span>
              </td>
              <td style={{ textAlign: 'center', fontWeight: p.reorder_qty > 0 ? '700' : '400', color: p.reorder_qty > 0 ? '#dc2626' : '#94a3b8' }}>{p.reorder_qty || 0}</td>
              <td>₹{Number(p.inventory_valuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function HistoryReport({ data }) {
  const rows = Array.isArray(data) ? data : [];
  return (
    <table className="table">
      <thead><tr><th>Appointment #</th><th>Customer</th><th>Vehicle</th><th>Service</th><th>Center</th><th>Date</th><th>Total</th><th>Rating</th><th>Status</th></tr></thead>
      <tbody>
        {rows.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No history data available.</td></tr> : rows.map((r, i) => (
          <tr key={i}>
            <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: '700', color: '#2563eb' }}>{r.appointment_number}</span></td>
            <td>{r.customer_name}</td>
            <td style={{ fontSize: '0.82rem' }}>{r.vehicle_info}<br /><span style={{ color: '#94a3b8' }}>{r.reg_number}</span></td>
            <td style={{ fontSize: '0.85rem' }}>{r.service_name}</td>
            <td style={{ fontSize: '0.82rem' }}>{r.service_center_city}</td>
            <td style={{ fontSize: '0.82rem' }}>{r.booking_date ? new Date(r.booking_date).toLocaleDateString('en-IN') : '—'}</td>
            <td style={{ fontWeight: '700' }}>{r.total_amount ? `₹${Number(r.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}</td>
            <td>{r.customer_rating ? `★ ${r.customer_rating}` : '—'}</td>
            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: r.appointment_status === 'COMPLETED' ? '#f0fdf4' : '#f8fafc', color: r.appointment_status === 'COMPLETED' ? '#16a34a' : '#64748b' }}>{r.appointment_status?.replace(/_/g, ' ') || '—'}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ServicesReport({ data }) {
  const rows = Array.isArray(data) ? data : [];
  return (
    <table className="table">
      <thead><tr><th>Service Name</th><th>Category</th><th>Catalog Price</th><th>Est. Hours</th><th>Total Bookings</th><th>Completed</th><th>Total Revenue</th></tr></thead>
      <tbody>
        {rows.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No services data.</td></tr> : rows.map((r, i) => (
          <tr key={i}>
            <td style={{ fontWeight: '700' }}>{r.name}</td>
            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '600' }}>{r.category}</span></td>
            <td style={{ fontWeight: '600' }}>₹{Number(r.price || 0).toLocaleString('en-IN')}</td>
            <td style={{ textAlign: 'center' }}>{Number(r.estimated_hours || 0)} hrs</td>
            <td style={{ textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>{Number(r.booking_count || 0)}</td>
            <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: '600' }}>{Number(r.completed_count || 0)}</td>
            <td style={{ fontWeight: '700', color: '#16a34a' }}>₹{Number(r.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
