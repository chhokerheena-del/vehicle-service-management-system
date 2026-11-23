import React from 'react';

export default function StatCard({ title, value, icon: Icon, change, trend = 'neutral', color = 'primary' }) {
  const colorMap = {
    primary: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    success: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    warning: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    danger: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    secondary: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        backgroundColor: scheme.bg,
        border: `1px solid ${scheme.border}`,
        color: scheme.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {Icon && <Icon size={28} />}
      </div>
      <div style={{ flexGrow: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, marginTop: '0.15rem' }}>
          {value}
        </div>
        {change && (
          <div style={{
            fontSize: '0.8rem',
            marginTop: '0.25rem',
            color: trend === 'up' ? '#059669' : (trend === 'down' ? '#dc2626' : '#64748b'),
            fontWeight: '600'
          }}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
}
