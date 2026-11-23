import React, { useState, useEffect } from 'react';
import { Wrench, Search, RefreshCw, Edit3, Loader2, Check, X, Building2 } from 'lucide-react';
import api from '../../services/api';

export default function StaffMechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/mechanics').then(res => res.success && setMechanics(res.data)),
      api.get('/service-centers').then(res => res.success && setCenters(res.data))
    ]).finally(() => setLoading(false));
  }, []);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mechanics');
      if (res.success) setMechanics(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m) => {
    setEditItem(m);
    setFormData({ ...m, serviceCenterId: m.serviceCenterId });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.put(`/mechanics/${editItem.id}`, formData);
      if (res.success) {
        setSuccess('Mechanic updated successfully.');
        setShowForm(false);
        setEditItem(null);
        reload();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = mechanics.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch = !search || m.name.toLowerCase().includes(q) || m.employeeId.toLowerCase().includes(q) || m.specialization.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    AVAILABLE: { bg: '#f0fdf4', color: '#16a34a' },
    BUSY: { bg: '#fffbeb', color: '#d97706' },
    ON_LEAVE: { bg: '#f8fafc', color: '#94a3b8' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Workshop Mechanics</h1>
        <p style={{ color: '#64748b', marginTop: '0.2rem' }}>View and manage mechanic availability and assignments.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { key: 'ALL', label: 'Total Mechanics', count: mechanics.length, bg: '#eff6ff', color: '#2563eb' },
          { key: 'AVAILABLE', label: 'Available', count: mechanics.filter(m => m.status === 'AVAILABLE').length, bg: '#f0fdf4', color: '#16a34a' },
          { key: 'BUSY', label: 'Currently Busy', count: mechanics.filter(m => m.status === 'BUSY').length, bg: '#fffbeb', color: '#d97706' },
          { key: 'ON_LEAVE', label: 'On Leave', count: mechanics.filter(m => m.status === 'ON_LEAVE').length, bg: '#f8fafc', color: '#94a3b8' }
        ].map(card => (
          <button key={card.key} onClick={() => setStatusFilter(card.key)} style={{
            background: statusFilter === card.key ? card.bg : '#fff', borderRadius: '12px', padding: '1.25rem',
            textAlign: 'center', border: `2px solid ${statusFilter === card.key ? card.color : '#e2e8f0'}`,
            cursor: 'pointer', transition: 'all 0.15s'
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: card.color }}>{card.count}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', marginTop: '0.2rem' }}>{card.label}</div>
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.9rem' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', color: '#16a34a', fontSize: '0.9rem' }}>{success}</div>}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mechanics Roster ({filtered.length})</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Search mechanics..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: '2.2rem', width: '220px' }} />
            </div>
            <button onClick={reload} className="btn btn-outline btn-sm"><RefreshCw size={16} /></button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr><th>Employee ID</th><th>Name</th><th>Specialization</th><th>Exp.</th><th>Contact</th><th>Service Center</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>
                    <Wrench size={36} style={{ margin: '0 auto 0.75rem', color: '#e2e8f0' }} />
                    <p>No mechanics found.</p>
                  </td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.82rem', color: '#475569' }}>{m.employeeId}</span></td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{m.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{m.email || '—'}</div>
                    </td>
                    <td style={{ fontSize: '0.88rem' }}>{m.specialization}</td>
                    <td style={{ textAlign: 'center' }}><span style={{ fontWeight: '700', color: '#0f172a' }}>{m.experienceYears}</span> yrs</td>
                    <td style={{ fontSize: '0.85rem' }}>{m.phone}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Building2 size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        {m.serviceCenter?.name || `Center #${m.serviceCenterId}`}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{m.serviceCenter?.city}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700',
                        backgroundColor: statusConfig[m.status]?.bg || '#f8fafc',
                        color: statusConfig[m.status]?.color || '#94a3b8'
                      }}>
                        {m.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(m)}><Edit3 size={14} /> Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showForm && editItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>Edit Mechanic: {editItem.name}</h2>
              <button onClick={() => { setShowForm(false); setEditItem(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={22} /></button>
            </div>
            {error && <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '0.88rem', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[
                { key: 'name', label: 'Full Name', type: 'text' },
                { key: 'phone', label: 'Phone', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'specialization', label: 'Specialization', type: 'text' },
                { key: 'experienceYears', label: 'Experience (Years)', type: 'number' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '0.3rem' }}>{f.label}</label>
                  <input type={f.type} value={formData[f.key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} className="input" />
                </div>
              ))}
              <div>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Availability Status</label>
                <select value={formData.status || ''} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))} className="input">
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Service Center</label>
                <select value={formData.serviceCenterId || ''} onChange={e => setFormData(prev => ({ ...prev, serviceCenterId: Number(e.target.value) }))} className="input">
                  {centers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Check size={16} /> Update</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
