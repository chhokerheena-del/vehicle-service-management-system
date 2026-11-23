import React from 'react';
import { Check, Clock, Car, Search, Wrench, PackageCheck, Flag, XCircle } from 'lucide-react';

const STEPS = [
  { id: 'PENDING', label: 'Booking Placed', icon: Clock },
  { id: 'CONFIRMED', label: 'Confirmed', icon: Check },
  { id: 'VEHICLE_RECEIVED', label: 'Vehicle Received', icon: Car },
  { id: 'INSPECTION', label: 'Inspection', icon: Search },
  { id: 'IN_PROGRESS', label: 'Work In Progress', icon: Wrench },
  { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: PackageCheck },
  { id: 'COMPLETED', label: 'Completed', icon: Flag }
];

export default function ServiceTimeline({ currentStatus }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#fee2e2',
        borderRadius: '10px',
        color: '#991b1b',
        fontWeight: '600'
      }}>
        <XCircle size={24} />
        <div>
          <div>This service appointment was cancelled.</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#b91c1c' }}>
            Reach out to our service center team if you need to schedule a new appointment.
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex(s => s.id === currentStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div style={{ width: '100%', padding: '1rem 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        {/* Background track line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          height: '4px',
          backgroundColor: '#e2e8f0',
          zIndex: 1
        }}>
          {/* Active progress track */}
          <div style={{
            height: '100%',
            backgroundColor: '#2563eb',
            width: `${(activeIdx / (STEPS.length - 1)) * 100}%`,
            transition: 'width 0.4s ease'
          }} />
        </div>

        {STEPS.map((step, idx) => {
          const isDone = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          const Icon = step.icon;

          return (
            <div key={step.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              minWidth: '70px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDone ? '#2563eb' : '#ffffff',
                border: isDone ? '2px solid #2563eb' : '2px solid #cbd5e1',
                color: isDone ? '#ffffff' : '#64748b',
                boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.25)' : 'none',
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }}>
                <Icon size={18} />
              </div>
              <span style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: isCurrent ? '700' : '500',
                color: isCurrent ? '#0f172a' : (isDone ? '#334155' : '#94a3b8'),
                maxWidth: '85px',
                lineHeight: 1.2
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
