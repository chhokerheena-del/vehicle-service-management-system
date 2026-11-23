import React, { useState, useEffect } from 'react';
import { 
  History, 
  Car, 
  Wrench, 
  Star, 
  FileText, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Loader2, 
  X, 
  MessageSquare 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import InvoiceModal from '../../components/InvoiceModal';
import api from '../../services/api';

export default function ServiceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Feedback Modal State
  const [feedbackApt, setFeedbackApt] = useState(null);
  const [rating, setRating] = useState(5);
  const [serviceQuality, setServiceQuality] = useState(5);
  const [staffCourtesy, setStaffCourtesy] = useState(5);
  const [timelyDelivery, setTimelyDelivery] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadCompletedServices();
  }, []);

  const loadCompletedServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments?status=COMPLETED');
      if (res.success) setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFeedback = (apt) => {
    setFeedbackApt(apt);
    if (apt.feedback) {
      setRating(apt.feedback.rating);
      setServiceQuality(apt.feedback.serviceQuality || 5);
      setStaffCourtesy(apt.feedback.staffCourtesy || 5);
      setTimelyDelivery(apt.feedback.timelyDelivery || 5);
      setComments(apt.feedback.comments || '');
    } else {
      setRating(5);
      setServiceQuality(5);
      setStaffCourtesy(5);
      setTimelyDelivery(5);
      setComments('');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackApt) return;
    setSubmittingFeedback(true);

    try {
      await api.post('/feedback', {
        appointmentId: feedbackApt.id,
        rating,
        serviceQuality,
        staffCourtesy,
        timelyDelivery,
        comments
      });
      setFeedbackApt(null);
      loadCompletedServices();
    } catch (err) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
          Completed Service History & Logs
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Permanent automotive service records, technician inspection logs, and verified parts consumption history.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
          Retrieving service history records...
        </div>
      ) : records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <History size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>No Completed Services Yet</h3>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Completed maintenance and repair records will appear here with full diagnostic logs and invoices.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {records.map(a => {
            const sr = a.serviceRecord || {};
            const parts = sr.serviceParts || [];

            return (
              <div key={a.id} className="card">
                {/* Header */}
                <div className="card-header" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-completed">
                        <CheckCircle2 size={13} /> Completed
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {a.appointmentNumber}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                      {a.service?.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {a.vehicle?.make} {a.vehicle?.model} (<span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{a.vehicle?.regNumber}</span>) • {a.serviceCenter?.name}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Service Date</div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>
                      {new Date(a.preferredDate).toLocaleDateString()}
                    </div>
                    {sr.currentMileage && (
                      <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600' }}>
                        Odo: {sr.currentMileage.toLocaleString()} km
                      </div>
                    )}
                  </div>
                </div>

                {/* Technician Report */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  margin: '1rem 0',
                  fontSize: '0.9rem'
                }}>
                  {sr.mechanic && (
                    <div style={{ marginBottom: '0.5rem', color: '#0f172a' }}>
                      Lead Technician: <strong>{sr.mechanic.name}</strong> ({sr.mechanic.specialization})
                    </div>
                  )}
                  {sr.inspectionNotes && (
                    <div style={{ marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: '700', color: '#475569' }}>Diagnostic Inspection: </span>
                      <span style={{ color: '#334155' }}>{sr.inspectionNotes}</span>
                    </div>
                  )}
                  {sr.workPerformed && (
                    <div style={{ marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: '700', color: '#475569' }}>Work Completed: </span>
                      <span style={{ color: '#334155' }}>{sr.workPerformed}</span>
                    </div>
                  )}

                  {/* Consumed OEM Parts Table */}
                  {parts.length > 0 && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        OEM Spare Parts Installed ({parts.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {parts.map(p => (
                          <span key={p.id} style={{
                            backgroundColor: '#ffffff',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            color: '#1e293b'
                          }}>
                            <strong>{p.part?.name}</strong> (Qty: {p.quantity}) - ₹{Number(p.totalCost).toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Feedback Display if already submitted */}
                {a.feedback && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fffbeb',
                    borderRadius: '8px',
                    border: '1px solid #fde68a',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', color: '#f59e0b' }}>
                        {[...Array(a.feedback.rating)].map((_, i) => (
                          <Star key={i} size={16} fill="#f59e0b" />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#92400e', fontStyle: 'italic' }}>
                        "{a.feedback.comments || 'Great service experience'}"
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                      Feedback Submitted
                    </span>
                  </div>
                )}

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleOpenFeedback(a)}
                    className="btn btn-outline btn-sm"
                  >
                    <Star size={16} color="#f59e0b" />
                    {a.feedback ? 'Update Feedback' : 'Rate Service'}
                  </button>

                  {a.invoice && (
                    <button
                      onClick={() => setSelectedInvoice(a.invoice)}
                      className="btn btn-primary btn-sm"
                    >
                      <FileText size={16} /> View Tax Invoice
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Submission Modal */}
      {feedbackApt && (
        <div className="modal-overlay" onClick={() => setFeedbackApt(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                Service Feedback & Review
              </h3>
              <button onClick={() => setFeedbackApt(null)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback}>
              <div className="modal-body">
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    How would you rate the overall service for {feedbackApt.service?.name}?
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ color: star <= rating ? '#f59e0b' : '#cbd5e1' }}
                      >
                        <Star size={32} fill={star <= rating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Service Quality</label>
                    <select
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                      value={serviceQuality}
                      onChange={e => setServiceQuality(parseInt(e.target.value))}
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Average</option>
                      <option value={2}>2 - Poor</option>
                      <option value={1}>1 - Bad</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Staff Courtesy</label>
                    <select
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                      value={staffCourtesy}
                      onChange={e => setStaffCourtesy(parseInt(e.target.value))}
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Average</option>
                      <option value={2}>2 - Poor</option>
                      <option value={1}>1 - Bad</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Timely Delivery</label>
                    <select
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                      value={timelyDelivery}
                      onChange={e => setTimelyDelivery(parseInt(e.target.value))}
                    >
                      <option value={5}>5 - On Time</option>
                      <option value={4}>4 - Minor Delay</option>
                      <option value={3}>3 - Delayed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Review / Technician Remarks (Optional)</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Share your experience regarding repair quality, workshop staff, and vehicle performance..."
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setFeedbackApt(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingFeedback}>
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
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
        />
      )}
    </div>
  );
}
