import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Wrench, 
  Car, 
  User, 
  Package, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  Loader2, 
  Clock, 
  ShieldCheck, 
  Save 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ServiceTimeline from '../../components/ServiceTimeline';
import InvoiceModal from '../../components/InvoiceModal';
import PaymentModal from '../../components/PaymentModal';
import api from '../../services/api';

const STATUS_ORDER = [
  'PENDING',
  'CONFIRMED',
  'VEHICLE_RECEIVED',
  'INSPECTION',
  'IN_PROGRESS',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED'
];

export default function ProcessService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [partsCatalog, setPartsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for service record
  const [currentStatus, setCurrentStatus] = useState('INSPECTION');
  const [mechanicId, setMechanicId] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [savingRecord, setSavingRecord] = useState(false);
  const [recordFeedback, setRecordFeedback] = useState('');

  // Parts consumption form
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [addingPart, setAddingPart] = useState(false);
  const [partError, setPartError] = useState('');

  // Invoice & Payment state
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [id]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [aptRes, partsRes] = await Promise.all([
        api.get(`/appointments/${id}`),
        api.get('/parts')
      ]);

      if (aptRes.success && aptRes.data) {
        const apt = aptRes.data;
        setAppointment(apt);
        setCurrentStatus(apt.status);

        // Load mechanics for this center
        const mecRes = await api.get(`/mechanics?serviceCenterId=${apt.serviceCenterId}`);
        if (mecRes.success) setMechanics(mecRes.data);

        // Populate service record fields if available
        if (apt.serviceRecord) {
          const sr = apt.serviceRecord;
          setMechanicId(sr.mechanicId ? String(sr.mechanicId) : '');
          setInspectionNotes(sr.inspectionNotes || '');
          setWorkPerformed(sr.workPerformed || '');
          setCurrentMileage(sr.currentMileage || apt.vehicle?.mileage || '');
        }
      }

      if (partsRes.success) {
        setPartsCatalog(partsRes.data);
        if (partsRes.data.length > 0) {
          setSelectedPartId(String(partsRes.data[0].id));
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load appointment workspace data.');
    } finally {
      setLoading(false);
    }
  };

  // Update Status & Save Diagnostic Record
  const handleSaveRecord = async (newStatusOverride = null) => {
    setSavingRecord(true);
    setRecordFeedback('');

    const targetStatus = newStatusOverride || currentStatus;

    try {
      const res = await api.put(`/appointments/${id}/status`, {
        status: targetStatus,
        mechanicId: mechanicId ? parseInt(mechanicId) : null,
        inspectionNotes,
        workPerformed,
        currentMileage: currentMileage ? parseInt(currentMileage) : null
      });

      if (res.success) {
        setRecordFeedback(`Service updated to '${targetStatus}' successfully!`);
        setAppointment(res.data);
        setCurrentStatus(res.data.status);
      }
    } catch (err) {
      alert(err.message || 'Failed to update service record.');
    } finally {
      setSavingRecord(false);
    }
  };

  // Add Part to Record (Atomic stock decrement in MySQL)
  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!selectedPartId || partQty <= 0) return;
    setAddingPart(true);
    setPartError('');

    try {
      const res = await api.post(`/service-records/${id}/parts`, {
        partId: parseInt(selectedPartId),
        quantity: parseInt(partQty)
      });

      if (res.success) {
        setPartQty(1);
        // Refresh appointment data and parts catalog
        loadAllData();
      }
    } catch (err) {
      setPartError(err.message || 'Failed to add part.');
    } finally {
      setAddingPart(false);
    }
  };

  // Remove Part from Record (Restores stock)
  const handleRemovePart = async (spId) => {
    if (!window.confirm('Remove this part from service record? Stock will be restored to inventory.')) return;

    try {
      await api.delete(`/service-records/${id}/parts/${spId}`);
      loadAllData();
    } catch (err) {
      alert(err.message || 'Failed to remove part.');
    }
  };

  // Generate / Recalculate Invoice
  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const res = await api.post('/invoices/generate', {
        appointmentId: id
      });

      if (res.success) {
        setAppointment(prev => ({ ...prev, invoice: res.data }));
        setSelectedInvoice(res.data);
      }
    } catch (err) {
      alert(err.message || 'Invoice generation failed');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
        Loading service bay workspace...
      </div>
    );
  }

  if (!appointment) {
    return <div className="card" style={{ padding: '2rem' }}>Appointment not found.</div>;
  }

  const vehicle = appointment.vehicle || {};
  const customer = appointment.user || {};
  const service = appointment.service || {};
  const serviceParts = appointment.serviceRecord?.serviceParts || [];
  const invoice = appointment.invoice;

  // Selected Part metadata
  const selectedPart = partsCatalog.find(p => String(p.id) === String(selectedPartId));

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/staff/appointments" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Back to Queue
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Current Status:</span>
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      {/* Appointment & Vehicle Dossier Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '800',
                fontSize: '1.2rem',
                color: '#2563eb'
              }}>
                {appointment.appointmentNumber}
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
              {service.name}
            </h1>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
              Service Hub: <strong>{appointment.serviceCenter?.name}</strong> ({appointment.serviceCenter?.city})
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.2rem',
              fontWeight: '800',
              color: '#0f172a',
              backgroundColor: '#eff6ff',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              display: 'inline-block'
            }}>
              {vehicle.regNumber}
            </span>
            <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '0.35rem' }}>
              {vehicle.make} {vehicle.model} ({vehicle.variant || ''})
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {vehicle.fuelType} | Year {vehicle.year} | Base Mileage: {vehicle.mileage?.toLocaleString()} km
            </div>
          </div>
        </div>

        {/* Customer & Slot row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Customer</span>
            <div style={{ fontWeight: '700', color: '#0f172a' }}>{customer.name}</div>
            <div style={{ color: '#475569' }}>{customer.phone} | {customer.email}</div>
          </div>

          <div>
            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Scheduled Slot</span>
            <div style={{ fontWeight: '700', color: '#0f172a' }}>{new Date(appointment.preferredDate).toLocaleDateString()}</div>
            <div style={{ color: '#2563eb', fontWeight: '600' }}>{appointment.preferredTimeSlot}</div>
          </div>

          <div>
            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Customer Complaints</span>
            <div style={{ color: '#334155', fontStyle: appointment.notes ? 'normal' : 'italic' }}>
              {appointment.notes || 'No specific complaints recorded.'}
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Progress Timeline */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
          Workflow Progression
        </h3>
        <ServiceTimeline currentStatus={appointment.status} />

        {/* Fast Status Advancer Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
            Transition Status To:
          </span>
          {STATUS_ORDER.filter(s => s !== 'CANCELLED').map(status => (
            <button
              key={status}
              onClick={() => handleSaveRecord(status)}
              className="btn btn-outline btn-sm"
              style={{
                backgroundColor: appointment.status === status ? '#2563eb' : '#fff',
                color: appointment.status === status ? '#fff' : '#0f172a',
                borderColor: appointment.status === status ? '#2563eb' : 'var(--border)'
              }}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Technician & Diagnostic Findings Editor */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div className="card-header">
          <h2 className="card-title">Technician Service Record</h2>
          {recordFeedback && (
            <span style={{ color: '#15803d', fontWeight: '700', fontSize: '0.85rem' }}>
              ✓ {recordFeedback}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assign Master Mechanic</label>
            <select
              className="form-select"
              value={mechanicId}
              onChange={e => setMechanicId(e.target.value)}
            >
              <option value="">-- Select Technician --</option>
              {mechanics.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.specialization}) - {m.status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Current Odometer / Mileage (km)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 32500"
              value={currentMileage}
              onChange={e => setCurrentMileage(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Pre-Service Inspection Notes & Diagnostic Findings</label>
          <textarea
            rows={3}
            className="form-textarea"
            placeholder="Record engine condition, brake pad thickness (mm), battery CCA rating, suspension noises, fluid contamination..."
            value={inspectionNotes}
            onChange={e => setInspectionNotes(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Work Performed / Repairs Completed</label>
          <textarea
            rows={3}
            className="form-textarea"
            placeholder="Document all operations completed: oil drained and refilled, spark plugs cleaned, brake bleeding performed, alignment calibrated..."
            value={workPerformed}
            onChange={e => setWorkPerformed(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleSaveRecord()}
            className="btn btn-primary"
            disabled={savingRecord}
          >
            <Save size={16} /> {savingRecord ? 'Saving...' : 'Save Service Record'}
          </button>
        </div>
      </div>

      {/* OEM Spare Parts Consumption & Inventory Control */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Spare Parts & Consumables</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Consuming parts automatically decrements warehouse inventory in MySQL with zero negative-stock tolerance.
            </p>
          </div>
        </div>

        {partError && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {partError}
          </div>
        )}

        {/* Add Part Form */}
        <form onSubmit={handleAddPart} style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr auto',
          gap: '1rem',
          alignItems: 'flex-end',
          backgroundColor: '#f8fafc',
          padding: '1.25rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem'
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Select Part from Inventory
              {selectedPart && (
                <span style={{
                  marginLeft: '0.5rem',
                  fontWeight: 'normal',
                  color: selectedPart.stockQuantity > 0 ? '#15803d' : '#dc2626'
                }}>
                  (In Stock: <strong>{selectedPart.stockQuantity}</strong> units | Price: ₹{Number(selectedPart.unitPrice).toFixed(2)})
                </span>
              )}
            </label>
            <select
              className="form-select"
              value={selectedPartId}
              onChange={e => setSelectedPartId(e.target.value)}
            >
              {partsCatalog.map(p => (
                <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                  {p.name} [{p.partNumber}] - ₹{Number(p.unitPrice).toFixed(2)} ({p.stockQuantity} available)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quantity</label>
            <input
              type="number"
              min={1}
              max={selectedPart?.stockQuantity || 1}
              required
              className="form-input"
              value={partQty}
              onChange={e => setPartQty(parseInt(e.target.value) || 1)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={addingPart || !selectedPart || selectedPart.stockQuantity <= 0}
          >
            <Plus size={16} /> {addingPart ? 'Adding...' : 'Add Part'}
          </button>
        </form>

        {/* Table of Consumed Parts */}
        {serviceParts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            No spare parts consumed for this service record yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>Part Number</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total Cost (₹)</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {serviceParts.map(sp => (
                  <tr key={sp.id}>
                    <td><strong>{sp.part?.name}</strong></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#2563eb' }}>
                      {sp.part?.partNumber}
                    </td>
                    <td><span className="badge badge-received">{sp.part?.category}</span></td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{sp.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{Number(sp.unitPrice).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>{Number(sp.totalCost).toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemovePart(sp.id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#ef4444', padding: '0.3rem 0.5rem' }}
                        title="Remove part and restore stock"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoicing & Final Billing Station */}
      <div className="card" style={{ padding: '1.75rem', border: '1px solid #bfdbfe' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Invoicing & Settlement Station</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Computes Labor + Parts Charges + 18% Integrated GST. Supports counter payments.
            </p>
          </div>
          {invoice && <StatusBadge status={invoice.paymentStatus} type="payment" />}
        </div>

        {invoice ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              backgroundColor: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '10px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Labor Charges</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                  ₹{Number(invoice.serviceCharges).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Parts Total</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                  ₹{Number(invoice.partsCharges).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>GST (18%)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                  ₹{Number(invoice.taxAmount).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: '700' }}>Grand Total</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb' }}>
                  ₹{Number(invoice.totalAmount).toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleGenerateInvoice}
                className="btn btn-outline btn-sm"
                disabled={generatingInvoice}
              >
                Recalculate Bill
              </button>

              <button
                onClick={() => setSelectedInvoice(invoice)}
                className="btn btn-outline btn-sm"
              >
                <FileText size={16} /> View Tax Invoice
              </button>

              {invoice.paymentStatus !== 'PAID' && (
                <button
                  onClick={() => setPayingInvoice(invoice)}
                  className="btn btn-success"
                >
                  <CreditCard size={16} /> Record Counter Payment
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              No official invoice has been generated for this appointment yet.
            </p>
            <button
              onClick={handleGenerateInvoice}
              className="btn btn-primary"
              disabled={generatingInvoice}
            >
              <FileText size={16} /> {generatingInvoice ? 'Generating...' : 'Generate Official Tax Invoice'}
            </button>
          </div>
        )}
      </div>

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

      {/* Payment Modal */}
      {payingInvoice && (
        <PaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentSuccess={() => {
            loadAllData();
          }}
        />
      )}
    </div>
  );
}
