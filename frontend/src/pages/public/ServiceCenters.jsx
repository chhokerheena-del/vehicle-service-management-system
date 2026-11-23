import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Wrench, Shield, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function ServiceCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/service-centers')
      .then(res => {
        if (res.success) setCenters(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Authorized Network
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.35rem' }}>
            Regional Automotive Service Hubs
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            State-of-the-art multi-bay repair facilities equipped with advanced hydraulic lifts, OBD-II scanners, and paint booths.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
            Loading service centers...
          </div>
        ) : (
          <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
            {centers.map(c => (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-confirmed" style={{ marginBottom: '0.4rem' }}>
                      {c.code}
                    </span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                      {c.name}
                    </h3>
                  </div>
                  <span className="badge badge-completed">Open Now</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', flexGrow: 1, fontSize: '0.9rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <MapPin size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                    <span>{c.address}, {c.city}, {c.state} - {c.pincode}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Phone size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <span style={{ fontWeight: '600' }}>{c.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Mail size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <span>{c.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Clock size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <span>{c.openingHours}</span>
                  </div>
                </div>

                {/* Mechanics Preview */}
                {c.mechanics && c.mechanics.length > 0 && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.825rem' }}>
                    <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                      Stationed Master Mechanics ({c.mechanics.length}):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {c.mechanics.map(m => (
                        <span key={m.id} style={{ backgroundColor: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#334155' }}>
                          {m.name} ({m.specialization.split('&')[0]})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <Link
                    to={`/customer/book-service?centerId=${c.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Select Center & Book <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
