import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Car, 
  Wrench, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Loader2, 
  XCircle, 
  Calendar 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';

export default function StaffAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments?limit=100');
      if (res.success) setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatus = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      loadAppointments();
    } catch (err) {
      alert(err.message || 'Status transition failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = appointments.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch = a.appointmentNumber.toLowerCase().includes(search.toLowerCase()) ||
                          a.user?.name.toLowerCase().includes(search.toLowerCase()) ||
                          a.vehicle?.regNumber.toLowerCase().includes(search.toLowerCase()) ||
                          a.service?.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
            Service Queue & Dispatch
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Confirm pending customer bookings, mark vehicle intake at reception, and dispatch jobs.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: '#ffffff',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'CONFIRMED', 'VEHICLE_RECEIVED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: statusFilter === st ? '700' : '500',
                backgroundColor: statusFilter === st ? '#2563eb' : '#f8fafc',
                color: statusFilter === st ? '#ffffff' : '#64748b',
                border: '1px solid var(--border)'
              }}
            >
              {st === 'ALL' ? 'All Queue' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by customer, vehicle, or ID..."
          className="form-input"
          style={{ maxWidth: '300px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
          Loading service queue...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Clock size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>No Appointments in Queue</h3>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            No records matched the selected status filter.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appointment #</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Center</th>
                  <th>Date & Time</th>
                  <th>Mechanic</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Fast Action</th>
                  <th style={{ textAlign: 'center' }}>Workspace</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#2563eb' }}>
                      {a.appointmentNumber}
                    </td>
                    <td>
                      <strong>{a.user?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.user?.phone}</div>
                    </td>
                    <td>
                      <strong>{a.vehicle?.make} {a.vehicle?.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {a.vehicle?.regNumber}
                      </div>
                    </td>
                    <td>{a.service?.name}</td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {a.serviceCenter?.city}
                    </td>
                    <td>
                      {new Date(a.preferredDate).toLocaleDateString()}
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.preferredTimeSlot}</div>
                    </td>
                    <td>
                      {a.serviceRecord?.mechanic ? (
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>
                          {a.serviceRecord.mechanic.name}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>

                    {/* Inline Quick Action */}
                    <td style={{ textAlign: 'center' }}>
                      {a.status === 'PENDING' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleQuickStatus(a.id, 'CONFIRMED')}
                          disabled={actionLoading === a.id}
                        >
                          Confirm
                        </button>
                      )}
                      {a.status === 'CONFIRMED' && (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: '#06b6d4', color: '#0891b2' }}
                          onClick={() => handleQuickStatus(a.id, 'VEHICLE_RECEIVED')}
                          disabled={actionLoading === a.id}
                        >
                          Mark Received
                        </button>
                      )}
                      {a.status === 'VEHICLE_RECEIVED' && (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: '#f59e0b', color: '#d97706' }}
                          onClick={() => handleQuickStatus(a.id, 'INSPECTION')}
                          disabled={actionLoading === a.id}
                        >
                          Start Inspect
                        </button>
                      )}
                      {a.status === 'INSPECTION' && (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: '#f97316', color: '#ea580c' }}
                          onClick={() => handleQuickStatus(a.id, 'IN_PROGRESS')}
                          disabled={actionLoading === a.id}
                        >
                          Start Work
                        </button>
                      )}
                      {a.status === 'IN_PROGRESS' && (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: '#10b981', color: '#059669' }}
                          onClick={() => handleQuickStatus(a.id, 'READY_FOR_PICKUP')}
                          disabled={actionLoading === a.id}
                        >
                          Ready Pickup
                        </button>
                      )}
                      {a.status === 'READY_FOR_PICKUP' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleQuickStatus(a.id, 'COMPLETED')}
                          disabled={actionLoading === a.id}
                        >
                          Complete Job
                        </button>
                      )}
                      {a.status === 'COMPLETED' && (
                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700' }}>
                          ✓ Done
                        </span>
                      )}
                      {a.status === 'CANCELLED' && (
                        <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Technician Full Workspace */}
                    <td style={{ textAlign: 'center' }}>
                      <Link
                        to={`/staff/process/${a.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Open Workspace <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
