import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Car, 
  Wrench, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Loader2 
} from 'lucide-react';
import api from '../../services/api';

const STEPS = [
  { id: 1, label: 'Vehicle' },
  { id: 2, label: 'Service' },
  { id: 3, label: 'Service Center' },
  { id: 4, label: 'Date & Slot' },
  { id: 5, label: 'Summary & Confirm' }
];

const TIME_SLOTS = [
  '08:30 AM - 10:30 AM',
  '10:30 AM - 12:30 PM',
  '01:30 PM - 03:30 PM',
  '03:30 PM - 05:30 PM',
  '05:30 PM - 07:30 PM'
];

export default function BookService() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    // Tomorrow by default
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split('T')[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    setLoading(true);
    try {
      const [vRes, sRes, cRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/services'),
        api.get('/service-centers')
      ]);

      if (vRes.success) setVehicles(vRes.data);
      if (sRes.success) setServices(sRes.data);
      if (cRes.success) setCenters(cRes.data);

      // Pre-select from URL query parameters if present
      const paramVehicle = searchParams.get('vehicleId');
      const paramService = searchParams.get('serviceId');
      const paramCenter = searchParams.get('centerId');

      if (paramVehicle) setSelectedVehicleId(paramVehicle);
      else if (vRes.data && vRes.data.length > 0) setSelectedVehicleId(String(vRes.data[0].id));

      if (paramService) setSelectedServiceId(paramService);
      else if (sRes.data && sRes.data.length > 0) setSelectedServiceId(String(sRes.data[0].id));

      if (paramCenter) setSelectedCenterId(paramCenter);
      else if (cRes.data && cRes.data.length > 0) setSelectedCenterId(String(cRes.data[0].id));
    } catch (err) {
      console.error(err);
      setError('Failed to load booking catalog.');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => String(v.id) === String(selectedVehicleId));
  const selectedService = services.find(s => String(s.id) === String(selectedServiceId));
  const selectedCenter = centers.find(c => String(c.id) === String(selectedCenterId));

  const handleNext = () => {
    if (step === 1 && !selectedVehicleId) {
      setError('Please select or register a vehicle first.');
      return;
    }
    if (step === 2 && !selectedServiceId) {
      setError('Please select a service package.');
      return;
    }
    if (step === 3 && !selectedCenterId) {
      setError('Please select a regional service center.');
      return;
    }
    if (step === 4 && (!preferredDate || !preferredTimeSlot)) {
      setError('Please select preferred date and time slot.');
      return;
    }

    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        vehicleId: selectedVehicleId,
        serviceId: selectedServiceId,
        serviceCenterId: selectedCenterId,
        preferredDate,
        preferredTimeSlot,
        notes
      };

      const res = await api.post('/appointments', payload);
      if (res.success) {
        navigate('/customer/appointments');
      }
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
        Setting up booking catalog...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
          Book Service Appointment
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Schedule professional maintenance with certified mechanics in a few simple steps.
        </p>
      </div>

      {/* Wizard Step Tracker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        backgroundColor: '#ffffff',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        overflowX: 'auto'
      }}>
        {STEPS.map((s, idx) => {
          const isDone = s.id < step;
          const isCurrent = s.id === step;
          return (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  backgroundColor: isDone ? '#10b981' : (isCurrent ? '#2563eb' : '#f1f5f9'),
                  color: isDone || isCurrent ? '#ffffff' : '#64748b'
                }}>
                  {isDone ? <CheckCircle2 size={18} /> : s.id}
                </div>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: isCurrent ? '700' : '500',
                  color: isCurrent ? '#0f172a' : '#64748b'
                }}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{ height: '2px', backgroundColor: '#e2e8f0', flexGrow: 1, margin: '0 0.75rem', minWidth: '20px' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* STEP 1: SELECT VEHICLE */}
      {step === 1 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
            Step 1: Choose Vehicle for Service
          </h2>

          {vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <Car size={42} style={{ color: '#cbd5e1', margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: '600', color: '#334155' }}>You haven't registered any vehicles yet.</p>
              <Link to="/customer/vehicles" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Plus size={16} /> Add Vehicle First
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {vehicles.map(v => {
                const isSelected = String(v.id) === String(selectedVehicleId);
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(String(v.id))}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '800',
                        fontSize: '1rem',
                        color: isSelected ? '#1e40af' : '#2563eb'
                      }}>
                        {v.regNumber}
                      </span>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                        {v.make} {v.model} {v.variant ? `(${v.variant})` : ''}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {v.fuelType} | Year {v.year} | Mileage: {v.mileage.toLocaleString()} km
                      </div>
                    </div>

                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? '7px solid #2563eb' : '2px solid #cbd5e1',
                      backgroundColor: '#fff'
                    }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SELECT SERVICE */}
      {step === 2 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
            Step 2: Select Automotive Service Package
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxHeight: '450px', overflowY: 'auto' }}>
            {services.map(s => {
              const isSelected = String(s.id) === String(selectedServiceId);
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedServiceId(String(s.id))}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ maxWidth: '80%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-confirmed">{s.category}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                        ~{s.estimatedHours} Hours
                      </span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                      {s.name}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.4 }}>
                      {s.description}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb' }}>
                      ₹{Number(s.price).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: SELECT SERVICE CENTER */}
      {step === 3 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
            Step 3: Select Regional Service Hub
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {centers.map(c => {
              const isSelected = String(c.id) === String(selectedCenterId);
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCenterId(String(c.id))}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <span className="badge badge-received" style={{ marginBottom: '0.3rem' }}>
                      {c.city} • {c.code}
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {c.address}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '0.2rem', fontWeight: '600' }}>
                      Ph: {c.phone} | {c.openingHours}
                    </div>
                  </div>

                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '7px solid #2563eb' : '2px solid #cbd5e1',
                    backgroundColor: '#fff'
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: DATE, TIME & NOTES */}
      {step === 4 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a' }}>
            Step 4: Select Preferred Date & Arrival Slot
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Preferred Date *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="form-input"
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Preferred Time Slot *</label>
              <select
                className="form-select"
                value={preferredTimeSlot}
                onChange={e => setPreferredTimeSlot(e.target.value)}
              >
                {TIME_SLOTS.map((slot, i) => (
                  <option key={i} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Special Notes / Complaints (Optional)</label>
            <textarea
              rows={4}
              className="form-textarea"
              placeholder="e.g. Squeaking noise while braking, check cabin air filter, slight engine vibration on cold start..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* STEP 5: BOOKING SUMMARY & CONFIRM */}
      {step === 5 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a' }}>
            Step 5: Review Booking Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Selected Vehicle</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.regNumber})
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Fuel: {selectedVehicle?.fuelType} | Year: {selectedVehicle?.year} | Mileage: {selectedVehicle?.mileage.toLocaleString()} km
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Service Package</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {selectedService?.name}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#2563eb' }}>
                  ₹{Number(selectedService?.price || 0).toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Category: {selectedService?.category} | Estimated Duration: ~{selectedService?.estimatedHours} Hours
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Appointment Schedule & Hub</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                {selectedCenter?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Date: <strong>{new Date(preferredDate).toLocaleDateString()}</strong> | Slot: <strong>{preferredTimeSlot}</strong>
              </div>
            </div>

            {notes && (
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Customer Notes</div>
                <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.2rem' }}>{notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        {step > 1 ? (
          <button onClick={handleBack} className="btn btn-outline" disabled={submitting}>
            <ChevronLeft size={18} /> Back
          </button>
        ) : <div />}

        {step < 5 ? (
          <button onClick={handleNext} className="btn btn-primary">
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleConfirmBooking}
            className="btn btn-success btn-lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Confirming Booking...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} /> Confirm Service Booking
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
