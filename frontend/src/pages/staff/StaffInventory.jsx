import React, { useState, useEffect } from 'react';
import { Package, Search, RefreshCw, AlertTriangle, Plus, Edit3, Loader2, Check, X } from 'lucide-react';
import api from '../../services/api';

export default function StaffInventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadParts(); }, []);

  const loadParts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parts');
      if (res.success) setParts(res.data);
    } catch (err) {
      setError('Failed to load parts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (part) => {
    setEditItem(part);
    setFormData({ ...part, unitPrice: Number(part.unitPrice) });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleNew = () => {
    setEditItem(null);
    setFormData({ stockQuantity: 0, minStockLevel: 5, status: 'IN_STOCK' });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = editItem
        ? await api.put(`/parts/${editItem.id}`, formData)
        : await api.post('/parts', formData);
      if (res.success) {
        setSuccess(editItem ? 'Part updated successfully.' : 'Part created successfully.');
        setShowForm(false);
        setEditItem(null);
        loadParts();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = parts.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.partNumber.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    ALL: parts.length,
    IN_STOCK: parts.filter(p => p.status === 'IN_STOCK').length,
    LOW_STOCK: parts.filter(p => p.status === 'LOW_STOCK').length,
    OUT_OF_STOCK: parts.filter(p => p.status === 'OUT_OF_STOCK').length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>Parts Inventory</h1>
          <p style={{ color: '#64748b', marginTop: '0.2rem' }}>Manage spare parts stock levels and catalog.</p>
        </div>
        <button onClick={handleNew} className="btn btn-primary"><Plus size={18} /> Add Part</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { key: 'ALL', label: 'Total Parts', color: '#eff6ff', textColor: '#2563eb' },
          { key: 'IN_STOCK', label: 'In Stock', color: '#f0fdf4', textColor: '#16a34a' },
          { key: 'LOW_STOCK', label: 'Low Stock', color: '#fffbeb', textColor: '#d97706' },
          { key: 'OUT_OF_STOCK', label: 'Out of Stock', color: '#fef2f2', textColor: '#dc2626' }
        ].map(card => (
          <button key={card.key} onClick={() => setFilter(card.key)}
            style={{ background: filter === card.key ? (card.key === 'ALL' ? '#eff6ff' : card.color) : '#fff', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: `2px solid ${filter === card.key ? card.textColor : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: card.textColor }}>{counts[card.key]}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', marginTop: '0.2rem' }}>{card.label}</div>
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.9rem' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', color: '#16a34a', fontSize: '0.9rem' }}>{success}</div>}

      {/* Low Stock Warning Banner */}
      {counts.OUT_OF_STOCK > 0 && (
        <div style={{ padding: '0.9rem 1.25rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#dc2626' }}>
          <AlertTriangle size={18} />
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{counts.OUT_OF_STOCK} part{counts.OUT_OF_STOCK > 1 ? 's are' : ' is'} out of stock. Raise purchase orders immediately.</span>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Parts Catalog ({filtered.length})</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Search parts..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: '2.2rem', width: '220px' }} />
            </div>
            <button onClick={loadParts} className="btn btn-outline btn-sm"><RefreshCw size={16} /></button>
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
                <tr><th>Part Number</th><th>Name</th><th>Category</th><th>Unit Price</th><th>Stock Qty</th><th>Min Level</th><th>Stock Health</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>
                    <Package size={36} style={{ margin: '0 auto 0.75rem', color: '#e2e8f0' }} />
                    <p>No parts found.</p>
                  </td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.82rem', color: '#475569' }}>{p.partNumber}</span></td>
                    <td style={{ fontWeight: '600' }}>{p.name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{p.category}</td>
                    <td style={{ fontWeight: '700' }}>₹{Number(p.unitPrice).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.05rem', color: p.stockQuantity === 0 ? '#dc2626' : p.stockQuantity <= p.minStockLevel ? '#d97706' : '#16a34a' }}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{p.minStockLevel}</td>
                    <td>
                      <span style={{ padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700',
                        backgroundColor: p.status === 'IN_STOCK' ? '#f0fdf4' : p.status === 'LOW_STOCK' ? '#fffbeb' : '#fef2f2',
                        color: p.status === 'IN_STOCK' ? '#16a34a' : p.status === 'LOW_STOCK' ? '#d97706' : '#dc2626'
                      }}>{p.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}><Edit3 size={14} /> Update Stock</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>{editItem ? 'Update Part' : 'Add New Part'}</h2>
              <button onClick={() => { setShowForm(false); setEditItem(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={22} /></button>
            </div>
            {error && <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '0.88rem', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[
                { key: 'partNumber', label: 'Part Number', type: 'text', disabled: !!editItem },
                { key: 'name', label: 'Part Name', type: 'text' },
                { key: 'category', label: 'Category', type: 'text' },
                { key: 'unitPrice', label: 'Unit Price (₹)', type: 'number' },
                { key: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
                { key: 'minStockLevel', label: 'Min Stock Level', type: 'number' }
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '0.3rem' }}>{f.label}</label>
                  <input type={f.type} disabled={f.disabled} value={formData[f.key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} className="input" style={{ opacity: f.disabled ? 0.6 : 1 }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Check size={16} /> {editItem ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
