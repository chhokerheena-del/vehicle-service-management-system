import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Wrench, Shield, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/services')
      .then(res => {
        if (res.success) setServices(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', 'Periodic Maintenance', 'Diagnostic', 'Repair', 'Inspection'];

  const filtered = services.filter(s => {
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Comprehensive Service Catalog
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.35rem' }}>
            Automotive Services & Maintenance Packages
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            Precision servicing performed by certified mechanics using factory-approved OEM diagnostics and equipment.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid var(--border)',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: selectedCategory === cat ? '700' : '500',
                  backgroundColor: selectedCategory === cat ? '#2563eb' : '#f1f5f9',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search services..."
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>

        {/* Service Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
            Loading automotive services catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No services found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {filtered.map(s => (
              <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-confirmed">{s.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                    <Clock size={15} /> ~{s.estimatedHours} Hrs
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                  {s.name}
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, flexGrow: 1, marginBottom: '1.5rem' }}>
                  {s.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Package Price</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: '800', color: '#2563eb' }}>
                      ₹{Number(s.price).toLocaleString()}
                    </span>
                  </div>
                  <Link
                    to={`/customer/book-service?serviceId=${s.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Book Now <ChevronRight size={16} />
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
