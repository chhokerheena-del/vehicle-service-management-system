import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Car, 
  CheckCircle2, 
  Star, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  Activity, 
  Cpu, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const featuredServices = [
    {
      title: 'Periodic General Service',
      category: 'Maintenance',
      price: '₹1,999',
      duration: '3.5 Hrs',
      desc: 'Complete bumper-to-bumper 40-point maintenance inspection, fluid top-ups, spark plug clean, and road testing.'
    },
    {
      title: 'Synthetic Engine Oil & Filter',
      category: 'Fluids & Engine',
      price: '₹1,299',
      duration: '1.5 Hrs',
      desc: 'Premium 5W-30 synthetic oil refill, OEM spin-on filter replacement, and engine sludge purge.'
    },
    {
      title: 'Brake System Overhaul',
      category: 'Safety & Brakes',
      price: '₹1,850',
      duration: '2.5 Hrs',
      desc: 'Ceramic brake pad replacement, rotor runout check, caliper lubrication, and DOT4 pressure bleeding.'
    },
    {
      title: 'AC Deep Sanitization & Gas',
      category: 'Climate Control',
      price: '₹2,200',
      duration: '2.0 Hrs',
      desc: 'Evaporator antibacterial foaming, cabin carbon filter change, and precision refrigerant top-up.'
    },
    {
      title: 'OBD-II ECU Diagnostic Scan',
      category: 'Diagnostics',
      price: '₹1,599',
      duration: '2.0 Hrs',
      desc: 'High-end scanner powertrain analysis, live sensor readings, misfire detection, and trouble code clear.'
    },
    {
      title: '3D Wheel Alignment & Balancing',
      category: 'Tyres & Suspension',
      price: '₹1,150',
      duration: '1.5 Hrs',
      desc: 'Laser 4-wheel computerized camber, caster, toe angle alignment, and dynamic road balancing.'
    }
  ];

  const centers = [
    { name: 'AutoCare Hub - South Delhi', city: 'New Delhi', area: 'Okhla Phase-III', phone: '+91 98110 12345' },
    { name: 'AutoCare Tech Hub - Koramangala', city: 'Bengaluru', area: '4th Block, 80ft Road', phone: '+91 98450 67890' },
    { name: 'AutoCare Express - Andheri East', city: 'Mumbai', area: 'Saki Vihar Road', phone: '+91 98200 54321' },
    { name: 'AutoCare Prime - Baner', city: 'Pune', area: 'Baner Highway Bypass', phone: '+91 98900 11223' }
  ];

  const testimonials = [
    {
      name: 'Arun Kumar',
      car: 'Maruti Suzuki Swift (DL-01-AB-1234)',
      rating: 5,
      comment: 'The live service tracking gave me full peace of mind. The mechanic explained every consumed part, and the digital invoice with GST was generated instantly.'
    },
    {
      name: 'Vikram Sharma',
      car: 'Mahindra Thar LX (KA-01-TR-4455)',
      rating: 5,
      comment: 'Top-tier diagnostic tools! They pinpointed an elusive check-engine issue within minutes after my weekend off-road trail trip. Highly recommended.'
    },
    {
      name: 'Priya Patel',
      car: 'Honda City ZX (MH-02-CD-4321)',
      rating: 5,
      comment: 'Super seamless booking process. I scheduled an AC service for Monday morning, and my car was ready ahead of schedule with zero unnecessary add-ons.'
    }
  ];

  return (
    <div>
      {/* Automotive Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '5rem 0 6rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative grid background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#60a5fa',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              marginBottom: '1.5rem'
            }}>
              <ShieldCheck size={16} /> ISO 9001 Certified Multi-Brand Workshop Platform
            </div>

            <h1 style={{
              fontSize: '3.25rem',
              fontWeight: '800',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem'
            }}>
              Precision Automotive Care <br />
              <span style={{ color: '#38bdf8' }}>Engineered for Perfection.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: '2.25rem',
              maxWidth: '650px'
            }}>
              Experience genuine dealer-quality maintenance at upfront transparent pricing. Track every stage of your service lifecycle in real-time, backed by certified master mechanics and OEM parts.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/customer/book-service" className="btn btn-primary btn-lg">
                <Calendar size={20} /> Book Service Now
              </Link>
              <Link to="/services" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: '#475569', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                Explore Services <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Banner */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
        <div className="container">
          <div className="grid grid-cols-4" style={{ textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#2563eb' }}>4+</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Metropolitan Service Hubs</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a' }}>15+</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Certified Master Technicians</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#2563eb' }}>10,000+</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Vehicles Serviced</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#059669' }}>99.4%</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Verified Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Our Expert Solutions
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', marginTop: '0.35rem' }}>
              Automotive Services Designed for Longevity
            </h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1rem' }}>
              From standard periodic maintenance to specialized engine diagnostics, every job is executed to strict manufacturer specifications.
            </p>
          </div>

          <div className="grid grid-cols-3">
            {featuredServices.map((service, index) => (
              <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-confirmed">{service.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                    <Clock size={14} /> {service.duration}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                  {service.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, flexGrow: 1, marginBottom: '1.25rem' }}>
                  {service.desc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Starting from</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb' }}>{service.price}</span>
                  </div>
                  <Link to="/customer/book-service" className="btn btn-outline btn-sm">
                    Book Now <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/services" className="btn btn-primary">
              View All 9 Specialized Services <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>
              The AutoCare Pro Advantage
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', marginTop: '0.35rem' }}>
              Why Vehicle Owners Trust Us
            </h2>
          </div>

          <div className="grid grid-cols-3">
            {[
              {
                icon: Award,
                title: 'Certified Master Mechanics',
                desc: 'Our technicians undergo extensive brand-specific powertrain, EV, and diagnostic training.'
              },
              {
                icon: ShieldCheck,
                title: '100% Genuine OEM Spares',
                desc: 'Every filter, brake pad, and fluid used is genuine OEM grade with zero counterfeit risk.'
              },
              {
                icon: Activity,
                title: 'Real-Time Telemetry Tracking',
                desc: 'Follow vehicle intake, inspection findings, parts addition, and testing stages live on your dashboard.'
              },
              {
                icon: Cpu,
                title: 'Dealer-Level Diagnostics',
                desc: 'State-of-the-art OBD-II oscilloscopes and scanners for precise sensor and electrical mapping.'
              },
              {
                icon: CheckCircle2,
                title: 'Transparent Itemized Invoices',
                desc: 'No hidden surcharges. Service charges, parts cost, and GST are calculated and documented clearly.'
              },
              {
                icon: Clock,
                title: '6-Month Service Warranty',
                desc: 'All mechanical maintenance and replaced components are guaranteed for 6 months or 10,000 km.'
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="card" style={{ padding: '1.75rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works (4-Step Workflow) */}
      <section style={{ padding: '5rem 0', backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase' }}>
              Effortless Workflow
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.35rem' }}>
              How AutoCare Pro Works
            </h2>
          </div>

          <div className="grid grid-cols-4">
            {[
              { step: '01', title: 'Select Vehicle & Service', desc: 'Choose your registered automobile and select from our curated catalog of service packages.' },
              { step: '02', title: 'Pick Hub & Time Slot', desc: 'Select your preferred nearby service center and book a convenient date and arrival slot.' },
              { step: '03', title: 'Live Service Tracking', desc: 'Monitor diagnostic intake, assigned mechanic, inspection findings, and parts added in real-time.' },
              { step: '04', title: 'Digital Invoice & Handover', desc: 'Review your itemized tax invoice, settle payment via UPI or Card, and drive away satisfied.' }
            ].map((step, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: 'rgba(56, 189, 248, 0.25)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.5rem'
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Centers Showcase */}
      <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>
                Locations
              </span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', marginTop: '0.35rem' }}>
                Authorized Regional Service Hubs
              </h2>
            </div>
            <Link to="/service-centers" className="btn btn-outline">
              View All Centers <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-4">
            {centers.map((c, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', marginBottom: '0.75rem' }}>
                  <MapPin size={20} />
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{c.city}</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                  {c.name}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  {c.area}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600' }}>
                  {c.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>
              Real Feedback
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', marginTop: '0.35rem' }}>
              Loved by Automobile Enthusiasts
            </h2>
          </div>

          <div className="grid grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.25rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} size={18} fill="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, flexGrow: 1, marginBottom: '1.25rem' }}>
                  "{t.comment}"
                </p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.car}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        color: '#ffffff',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '1rem' }}>
            Ready to Give Your Vehicle the Care It Deserves?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#dbeafe', marginBottom: '2rem' }}>
            Book your service appointment in less than 2 minutes. Transparent quotes, verified mechanics, and zero surprises.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/customer/book-service" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#0f172a' }}>
              <Calendar size={20} /> Book Service Appointment
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#bfdbfe' }}>
              Create Customer Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
