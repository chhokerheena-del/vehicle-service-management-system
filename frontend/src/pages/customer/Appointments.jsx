import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Car, 
  Wrench, 
  FileText, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Loader2, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ServiceTimeline from '../../components/ServiceTimeline';
import InvoiceModal from '../../components/InvoiceModal';
import PaymentModal from '../../components/PaymentModal';
import api from '../../services/api';

const TIME_SLOTS = [
  '08:30 AM - 10:30 AM',
  '10:30 AM - 12:30 PM',
  '01:30 PM - 03:30 PM',
  '03:30 PM - 05:30 PM',
  '05:30 PM - 07:30 PM'
];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL');

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      if (res.success) setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, aptNumber) => {
    const reason = window.prompt(`Enter reason for cancelling appointment ${aptNumber}:`, 'Schedule conflict');
    if (!reason) return;

    try {
      await api.put(`/appointments/${id}/cancel`, { reason });
      loadAppointments();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const handleOpenReschedule = (apt) => {
    setRescheduleApt(apt);
    setNewDate(new Date(apt.preferredDate).toISOString().split('T')[0]);
    setNewSlot(apt.preferredTimeSlot || TIME_SLOTS[0]);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleApt) return;
    setRescheduleLoading(true);

    try {
      await api.put(`/appointments/${rescheduleApt.id}/reschedule`, {
        preferredDate: newDate,
        preferredTimeSlot: newSlot
      });
      setRescheduleApt(null);
      loadAppointments();
    } catch (err) {
      alert(err.message || 'Reschedule failed');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterTab === 'ACTIVE') {
      return !['COMPLETED', 'CANCELLED'].includes(a.status);
    }
    if (filterTab === 'COMPLETED') {
      return a.status === 'COMPLETED';
    }
    if (filterTab === 'CANCELLED') {
      return a.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
            Service Appointments
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Track active repair jobs, review technician diagnostic logs, and manage bookings.
          </p>
        </div>
        <Link to="/customer/book-service" className="btn btn-primary">
          <Calendar size={18} /> Book New Service
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
        {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: filterTab === tab ? '700' : '500',
              backgroundColor: filterTab === tab ? '#2563eb' : '#ffffff',
              color: filterTab === tab ? '#ffffff' : '#64748b',
              border: '1px solid var(--border)'
            }}
          >
            {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
          Loading your service appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Clock size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>No Appointments Found</h3>
          <p style={{ color: '#64748b', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            You do not have any appointments under the "{filterTab}" filter.
          </p>
          <Link to="/customer/book-service" className="btn btn-primary">
            Book Service Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredAppointments.map(a => {
            const isCompleted = a.status === 'COMPLETED';
            const isCancelled = a.status === 'CANCELLED';
            const canCancelOrReschedule = ['PENDING', 'CONFIRMED'].includes(a.status);

            return (
              <div key={a.id} className="card">
                {/* Header */}
                <div className="card-header" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '800',
                        fontSize: '1.05rem',
                        color: '#2563eb'
                      }}>
                        {a.appointmentNumber}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                      {a.service?.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Vehicle: <strong style={{ color: '#0f172a' }}>{a.vehicle?.make} {a.vehicle?.model}</strong> (<span style={{ fontFamily: 'var(--font-mono)' }}>{a.vehicle?.regNumber}</span>) | Hub: <strong>{a.serviceCenter?.name}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Scheduled For:</div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                      {new Date(a.preferredDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600' }}>
                      {a.preferredTimeSlot}
                    </div>
                  </div>
                </div>

                {/* Live Service Lifecycle Timeline */}
                <div style={{ margin: '1rem 0' }}>
                  <ServiceTimeline currentStatus={a.status} />
                </div>

                {/* Technician & Inspection Notes if available */}
                {a.serviceRecord && (a.serviceRecord.inspectionNotes || a.serviceRecord.workPerformed || a.serviceRecord.mechanic) && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem'
                  }}>
                    {a.serviceRecord.mechanic && (
                      <div style={{ marginBottom: '0.5rem', color: '#0f172a' }}>
                        Assigned Master Mechanic: <strong>{a.serviceRecord.mechanic.name}</strong> ({a.serviceRecord.mechanic.specialization})
                      </div>
                    )}
                    {a.serviceRecord.inspectionNotes && (
                      <div style={{ marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: '700', color: '#475569' }}>Inspection Findings: </span>
                        <span style={{ color: '#334155' }}>{a.serviceRecord.inspectionNotes}</span>
                      </div>
                    )}
                    {a.serviceRecord.workPerformed && (
                      <div>
                        <span style={{ fontWeight: '700', color: '#475569' }}>Work Executed: </span>
                        <span style={{ color: '#334155' }}>{a.serviceRecord.workPerformed}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Notes */}
                {a.notes && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                    <strong>Customer Instructions:</strong> {a.notes}
                  </div>
                )}

                {/* Action Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {canCancelOrReschedule && (
                      <>
                        <button
                          onClick={() => handleOpenReschedule(a)}
                          className="btn btn-outline btn-sm"
                        >
                          <RotateCcw size={15} /> Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(a.id, a.appointmentNumber)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#ef4444' }}
                        >
                          <XCircle size={15} /> Cancel Booking
                        </button>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {a.invoice && (
                      <>
                        <button
                          onClick={() => setSelectedInvoice(a.invoice)}
                          className="btn btn-outline btn-sm"
                        >
                          <FileText size={16} /> View Tax Invoice
                        </button>

                        {a.invoice.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => setPayingInvoice(a.invoice)}
                            className="btn btn-success btn-sm"
                          >
                            Pay ₹{Number(a.invoice.totalAmount).toFixed(2)}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="modal-overlay" onClick={() => setRescheduleApt(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Reschedule Appointment</h3>
              <button onClick={() => setRescheduleApt(null)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#475569' }}>
                  Rescheduling appointment <strong>{rescheduleApt.appointmentNumber}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">New Preferred Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">New Time Slot *</label>
                  <select
                    className="form-select"
                    value={newSlot}
                    onChange={e => setNewSlot(e.target.value)}
                  >
                    {TIME_SLOTS.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setRescheduleApt(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={rescheduleLoading}>
                  {rescheduleLoading ? 'Updating...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onOpenPayment={(inv) => {
            setSelectedInvoice(null);
            setPayingInvoice(inv);
          }}
        />
      )}

      {/* Payment Simulation Modal */}
      {payingInvoice && (
        <PaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentSuccess={() => {
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}
