import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Wrench, Package, Settings,
  Plus, Trash2, Edit3, Check, X, Loader2, Search,
  RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

// ─── Tab Navigation ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'services', label: 'Services Catalog', icon: Settings },
  { id: 'parts', label: 'Parts Inventory', icon: Package },
  { id: 'mechanics', label: 'Mechanics', icon: Wrench },
  { id: 'centers', label: 'Service Centers', icon: Building2 }
];

export default function ManagementConsole() {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
    setShowForm(false);
    setEditItem(null);
    setFormData({});
    setError('');
    setSuccess('');
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'users') res = await api.get('/admin/users');
      else if (activeTab === 'services') res = await api.get('/services?activeOnly=false');
      else if (activeTab === 'parts') res = await api.get('/parts');
      else if (activeTab === 'mechanics') res = await api.get('/mechanics');
      else if (activeTab === 'centers') res = await api.get('/service-centers');
      if (res?.success) setData(res.data);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({ ...item });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleNew = () => {
    setEditItem(null);
    setFormData({});
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      let res;
      if (activeTab === 'services') res = await api.delete(`/services/${id}`);
      else if (activeTab === 'parts') res = await api.delete(`/parts/${id}`);
      else if (activeTab === 'mechanics') res = await api.delete(`/mechanics/${id}`);
      else if (activeTab === 'centers') res = await api.delete(`/service-centers/${id}`);
      if (res?.success) {
        setSuccess('Deleted successfully.');
        loadData();
      }
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      let res;
      if (activeTab === 'services') {
        res = editItem
          ? await api.put(`/services/${editItem.id}`, formData)
          : await api.post('/services', formData);
      } else if (activeTab === 'parts') {
        res = editItem
          ? await api.put(`/parts/${editItem.id}`, formData)
          : await api.post('/parts', formData);
      } else if (activeTab === 'mechanics') {
        res = editItem
          ? await api.put(`/mechanics/${editItem.id}`, formData)
          : await api.post('/mechanics', formData);
      } else if (activeTab === 'centers') {
        res = editItem
          ? await api.put(`/service-centers/${editItem.id}`, formData)
          : await api.post('/service-centers', formData);
      } else if (activeTab === 'users') {
        // Admin can create staff/admin accounts
        res = editItem
          ? await api.put(`/auth/profile`, formData)
          : await api.post('/auth/register', formData);
      }
      if (res?.success) {
        setSuccess(editItem ? 'Record updated successfully.' : 'Record created successfully.');
        setShowForm(false);
        setEditItem(null);
        loadData();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.partNumber && item.partNumber.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Management Console</h1>
        <p style={{ color: '#64748b', marginTop: '0.2rem' }}>Full CRUD operations for all system entities.</p>
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

      {/* Alerts */}
      {error && <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.9rem' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', color: '#16a34a', fontSize: '0.9rem' }}>{success}</div>}

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{TABS.find(t => t.id === activeTab)?.label}</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.2rem', width: '200px' }}
              />
            </div>
            <button onClick={loadData} className="btn btn-outline btn-sm"><RefreshCw size={16} /> Refresh</button>
            {activeTab !== 'users' && (
              <button onClick={handleNew} className="btn btn-primary btn-sm"><Plus size={16} /> Add New</button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'users' && <UsersTable data={filtered} />}
            {activeTab === 'services' && <ServicesTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} />}
            {activeTab === 'parts' && <PartsTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} />}
            {activeTab === 'mechanics' && <MechanicsTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} />}
            {activeTab === 'centers' && <CentersTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} />}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && activeTab !== 'users' && (
        <FormModal
          tab={activeTab}
          editItem={editItem}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditItem(null); setError(''); }}
          saving={saving}
        />
      )}
    </div>
  );
}

// ─── Sub-Tables ───────────────────────────────────────────────────────────────
function UsersTable({ data }) {
  return (
    <table className="table">
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>City</th><th>Vehicles</th><th>Appointments</th><th>Joined</th></tr></thead>
      <tbody>
        {data.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No users found.</td></tr> : data.map(u => (
          <tr key={u.id}>
            <td style={{ fontWeight: '600' }}>{u.name}</td>
            <td style={{ fontSize: '0.85rem', color: '#475569' }}>{u.email}</td>
            <td style={{ fontSize: '0.85rem' }}>{u.phone || '—'}</td>
            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: u.role === 'ADMIN' ? '#fef2f2' : u.role === 'STAFF' ? '#fffbeb' : '#eff6ff', color: u.role === 'ADMIN' ? '#dc2626' : u.role === 'STAFF' ? '#b45309' : '#2563eb' }}>{u.role}</span></td>
            <td>{u.city || '—'}</td>
            <td>{u._count?.vehicles ?? '—'}</td>
            <td>{u._count?.appointments ?? '—'}</td>
            <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ServicesTable({ data, onEdit, onDelete }) {
  return (
    <table className="table">
      <thead><tr><th>Name</th><th>Category</th><th>Price (₹)</th><th>Est. Hours</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {data.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No services found.</td></tr> : data.map(s => (
          <tr key={s.id}>
            <td style={{ fontWeight: '600' }}>{s.name}</td>
            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '600' }}>{s.category}</span></td>
            <td style={{ fontWeight: '700', color: '#0f172a' }}>₹{Number(s.price).toLocaleString('en-IN')}</td>
            <td>{s.estimatedHours} hrs</td>
            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: s.isActive ? '#f0fdf4' : '#f8fafc', color: s.isActive ? '#16a34a' : '#94a3b8' }}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => onEdit(s)}><Edit3 size={14} /></button>
                <button className="btn btn-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => onDelete(s.id)}><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PartsTable({ data, onEdit, onDelete }) {
  return (
    <table className="table">
      <thead><tr><th>Part Number</th><th>Name</th><th>Category</th><th>Unit Price</th><th>Stock</th><th>Min Level</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {data.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No parts found.</td></tr> : data.map(p => (
          <tr key={p.id}>
            <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.82rem', color: '#475569' }}>{p.partNumber}</span></td>
            <td style={{ fontWeight: '600' }}>{p.name}</td>
            <td style={{ fontSize: '0.85rem' }}>{p.category}</td>
            <td style={{ fontWeight: '700' }}>₹{Number(p.unitPrice).toLocaleString('en-IN')}</td>
            <td style={{ fontWeight: '700', color: p.stockQuantity === 0 ? '#dc2626' : p.stockQuantity <= p.minStockLevel ? '#d97706' : '#16a34a' }}>{p.stockQuantity}</td>
            <td>{p.minStockLevel}</td>
            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: p.status === 'IN_STOCK' ? '#f0fdf4' : p.status === 'LOW_STOCK' ? '#fffbeb' : '#fef2f2', color: p.status === 'IN_STOCK' ? '#16a34a' : p.status === 'LOW_STOCK' ? '#d97706' : '#dc2626' }}>{p.status.replace(/_/g, ' ')}</span></td>
            <td>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => onEdit(p)}><Edit3 size={14} /></button>
                <button className="btn btn-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => onDelete(p.id)}><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MechanicsTable({ data, onEdit, onDelete }) {
  return (
    <table className="table">
      <thead><tr><th>Employee ID</th><th>Name</th><th>Specialization</th><th>Exp. (Yrs)</th><th>Service Center</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {data.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No mechanics found.</td></tr> : data.map(m => (
          <tr key={m.id}>
            <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.82rem', color: '#475569' }}>{m.employeeId}</span></td>
            <td style={{ fontWeight: '600' }}>{m.name}</td>
            <td style={{ fontSize: '0.85rem' }}>{m.specialization}</td>
            <td style={{ textAlign: 'center' }}>{m.experienceYears}</td>
            <td style={{ fontSize: '0.85rem' }}>{m.serviceCenter?.name || '—'}</td>
            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: m.status === 'AVAILABLE' ? '#f0fdf4' : m.status === 'BUSY' ? '#fffbeb' : '#f8fafc', color: m.status === 'AVAILABLE' ? '#16a34a' : m.status === 'BUSY' ? '#d97706' : '#94a3b8' }}>{m.status}</span></td>
            <td>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => onEdit(m)}><Edit3 size={14} /></button>
                <button className="btn btn-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => onDelete(m.id)}><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CentersTable({ data, onEdit, onDelete }) {
  return (
    <table className="table">
      <thead><tr><th>Code</th><th>Name</th><th>City</th><th>Phone</th><th>Opening Hours</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {data.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No service centers found.</td></tr> : data.map(c => (
          <tr key={c.id}>
            <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.82rem', color: '#475569' }}>{c.code}</span></td>
            <td style={{ fontWeight: '600' }}>{c.name}</td>
            <td>{c.city}</td>
            <td style={{ fontSize: '0.85rem' }}>{c.phone}</td>
            <td style={{ fontSize: '0.82rem', color: '#475569' }}>{c.openingHours}</td>
            <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: c.isActive ? '#f0fdf4' : '#f8fafc', color: c.isActive ? '#16a34a' : '#94a3b8' }}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => onEdit(c)}><Edit3 size={14} /></button>
                <button className="btn btn-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={() => onDelete(c.id)}><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function FormModal({ tab, editItem, formData, setFormData, onSubmit, onClose, saving }) {
  const field = (key, label, type = 'text', options = null) => (
    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>{label}</label>
      {options ? (
        <select
          value={formData[key] ?? ''}
          onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
          className="input"
        >
          <option value="">Select...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={formData[key] ?? ''}
          onChange={e => setFormData(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className="input"
          placeholder={label}
        />
      )}
    </div>
  );

  const fields = {
    services: [
      field('name', 'Service Name'),
      field('category', 'Category'),
      field('description', 'Description'),
      field('price', 'Price (₹)', 'number'),
      field('estimatedHours', 'Estimated Hours', 'number'),
      field('isActive', 'Status', 'text', [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }])
    ],
    parts: [
      field('partNumber', 'Part Number'),
      field('name', 'Part Name'),
      field('category', 'Category'),
      field('unitPrice', 'Unit Price (₹)', 'number'),
      field('stockQuantity', 'Stock Quantity', 'number'),
      field('minStockLevel', 'Minimum Stock Level', 'number')
    ],
    mechanics: [
      field('name', 'Full Name'),
      field('employeeId', 'Employee ID'),
      field('phone', 'Phone'),
      field('email', 'Email', 'email'),
      field('specialization', 'Specialization'),
      field('experienceYears', 'Experience (Years)', 'number'),
      field('serviceCenterId', 'Service Center ID', 'number'),
      field('status', 'Status', 'text', [
        { value: 'AVAILABLE', label: 'Available' },
        { value: 'BUSY', label: 'Busy' },
        { value: 'ON_LEAVE', label: 'On Leave' }
      ])
    ],
    centers: [
      field('name', 'Center Name'),
      field('code', 'Center Code'),
      field('address', 'Address'),
      field('city', 'City'),
      field('state', 'State'),
      field('pincode', 'Pincode'),
      field('phone', 'Phone'),
      field('email', 'Email', 'email'),
      field('openingHours', 'Opening Hours')
    ]
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a' }}>
            {editItem ? 'Edit Record' : 'Create New Record'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={22} /></button>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fields[tab]}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Check size={16} /> {editItem ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
