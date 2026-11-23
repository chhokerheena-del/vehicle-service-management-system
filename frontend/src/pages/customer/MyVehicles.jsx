import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Edit2, Trash2, Calendar, Fuel, Gauge, Palette, Loader2, X } from 'lucide-react';
import api from '../../services/api';

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    regNumber: '',
    make: 'Maruti Suzuki',
    model: '',
    variant: '',
    year: 2022,
    fuelType: 'PETROL',
    mileage: 25000,
    color: 'White'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles');
      if (res.success) setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      regNumber: '',
      make: 'Maruti Suzuki',
      model: '',
      variant: '',
      year: 2022,
      fuelType: 'PETROL',
      mileage: 20000,
      color: 'White'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      regNumber: v.regNumber,
      make: v.make,
      model: v.model,
      variant: v.variant || '',
      year: v.year,
      fuelType: v.fuelType,
      mileage: v.mileage,
      color: v.color || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, formData);
      } else {
        await api.post('/vehicles', formData);
      }
      setModalOpen(false);
      loadVehicles();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, reg) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${reg}?`)) return;

    try {
      await api.delete(`/vehicles/${id}`);
      loadVehicles();
    } catch (err) {
      alert(err.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
            My Registered Vehicles
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Manage the automobiles in your garage and monitor maintenance intervals.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Add New Vehicle
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
          Loading your vehicles...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Car size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Your Garage is Empty</h3>
          <p style={{ color: '#64748b', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            Add your vehicle to book hassle-free maintenance services and track servicing history.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} /> Add Vehicle Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {vehicles.map(v => (
            <div key={v.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe',
                    display: 'inline-block'
                  }}>
                    {v.regNumber}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
                    {v.make} {v.model}
                  </h3>
                  {v.variant && (
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                      {v.variant}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.35rem' }}
                    title="Edit vehicle"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id, v.regNumber)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.35rem', color: '#ef4444' }}
                    title="Delete vehicle"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Attributes Chips */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                backgroundColor: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '8px',
                margin: '1rem 0',
                fontSize: '0.8rem',
                color: '#475569'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Fuel size={15} color="#2563eb" />
                  <span>{v.fuelType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="#2563eb" />
                  <span>Mfg Year: {v.year}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Gauge size={15} color="#2563eb" />
                  <span>{v.mileage.toLocaleString()} km</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Palette size={15} color="#2563eb" />
                  <span>{v.color || 'Standard'}</span>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <Link
                  to={`/customer/book-service?vehicleId=${v.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Calendar size={16} /> Book Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle to Garage'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Registration Number * (Unique)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. DL-01-AB-1234 or MH-12-CD-5678"
                    value={formData.regNumber}
                    onChange={e => setFormData({ ...formData, regNumber: e.target.value })}
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Make / Brand *</label>
                    <select
                      className="form-select"
                      value={formData.make}
                      onChange={e => setFormData({ ...formData, make: e.target.value })}
                    >
                      <option>Maruti Suzuki</option>
                      <option>Hyundai</option>
                      <option>Tata</option>
                      <option>Mahindra</option>
                      <option>Honda</option>
                      <option>Toyota</option>
                      <option>Kia</option>
                      <option>Volkswagen</option>
                      <option>Skoda</option>
                      <option>MG</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Swift, Nexon, Creta, City"
                      value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Variant</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. VXI, SX(O), XZ+"
                      value={formData.variant}
                      onChange={e => setFormData({ ...formData, variant: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manufacturing Year *</label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={2026}
                      className="form-input"
                      value={formData.year}
                      onChange={e => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Fuel Type</label>
                    <select
                      className="form-select"
                      value={formData.fuelType}
                      onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
                    >
                      <option value="PETROL">Petrol</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="ELECTRIC">Electric (EV)</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Odometer (km)</label>
                    <input
                      type="number"
                      min={0}
                      className="form-input"
                      value={formData.mileage}
                      onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pearl Arctic White"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
