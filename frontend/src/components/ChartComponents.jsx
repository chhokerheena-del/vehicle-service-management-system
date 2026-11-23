import React from 'react';

// Monthly Revenue Bar Chart
export function RevenueBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No revenue records available</div>;
  }

  const maxRevenue = Math.max(...data.map(d => Number(d.revenue) || 0), 1000);

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1.5rem',
        height: '200px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.5rem'
      }}>
        {data.map((item, idx) => {
          const heightPct = Math.max(10, ((Number(item.revenue) || 0) / maxRevenue) * 100);
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                ₹{Math.round(item.revenue).toLocaleString()}
              </div>
              <div style={{
                width: '100%',
                maxWidth: '45px',
                height: `${heightPct}%`,
                backgroundColor: '#2563eb',
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.4s ease',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }} />
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
                {item.month}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Appointment Status Distribution Progress Bars
export function StatusDistribution({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>No appointment data</div>;
  }

  const total = data.reduce((sum, item) => sum + (Number(item.count) || 0), 0) || 1;

  const colorMap = {
    PENDING: '#f59e0b',
    CONFIRMED: '#6366f1',
    VEHICLE_RECEIVED: '#06b6d4',
    INSPECTION: '#eab308',
    IN_PROGRESS: '#f97316',
    READY_FOR_PICKUP: '#10b981',
    COMPLETED: '#16a34a',
    CANCELLED: '#ef4444'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {data.map((item, idx) => {
        const count = Number(item.count) || 0;
        const pct = Math.round((count / total) * 100);
        const barColor = colorMap[item.status] || '#64748b';

        return (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                {item.status.replace(/_/g, ' ')}
              </span>
              <span style={{ fontWeight: '700', color: '#64748b' }}>
                {count} ({pct}%)
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: barColor,
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Top Popular Services
export function PopularServicesChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>No service data</div>;
  }

  const maxCount = Math.max(...data.map(d => Number(d.count) || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {data.map((item, idx) => {
        const count = Number(item.count) || 0;
        const widthPct = Math.round((count / maxCount) * 100);

        return (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.name}</span>
              <span style={{ fontWeight: '700', color: '#2563eb' }}>{count} bookings</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${widthPct}%`,
                backgroundColor: '#3b82f6',
                borderRadius: '4px'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
