import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Wrench, Database, Cpu, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div style={{ padding: '4rem 0', backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            About AutoCare Pro
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.35rem' }}>
            Pioneering Precision Automobile Engineering & Transparency
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
            AutoCare Pro is an end-to-end full-stack automotive service and maintenance management ecosystem built to bridge the trust deficit between vehicle owners and workshop service centers.
          </p>
        </div>

        {/* Narrative Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
              Our Mission: Elimination of Unnecessary Repairs & Guesswork
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Traditional automobile service often suffers from obscure repair estimates, unverified part replacements, and delayed vehicle handovers. AutoCare Pro introduces a transparent, telemetry-driven workflow where inspection findings, technician notes, and consumed inventory parts are registered into a centralized relational database with complete accountability.
            </p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
              BTech CSE Database Management System (DBMS) Architecture
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1rem' }}>
              Designed in compliance with academic DBMS evaluation standards, the platform demonstrates:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <strong>Third Normal Form (3NF):</strong> Normalized entities ensuring zero data insertion, update, or deletion anomalies.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <strong>ACID Transactions:</strong> Atomic operations across service completion, inventory decrement, and invoice generation.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <strong>Materialized SQL Views:</strong> Pre-compiled views for customer history, appointment operations, and revenue summaries.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <strong>Check & Foreign Key Constraints:</strong> Strict database-level referential integrity and non-negative inventory thresholds.
                </span>
              </div>
            </div>
          </div>

          {/* Tech Stack Visual Summary */}
          <div className="card" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', color: '#38bdf8' }}>
              Engineering Tech Stack
            </h3>
            <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Frontend Layer</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem' }}>React 18 + Vite</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem' }}>React Router v6, Axios, Lucide Icons</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Backend Layer</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem' }}>Node + Express</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem' }}>RESTful APIs, JWT Auth, bcryptjs</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Database Layer</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem' }}>MySQL 8.0</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Prisma ORM, Views, Indexes, Transactions</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/viva-guide" className="btn btn-primary btn-lg">
            <Database size={18} /> Explore Interactive DBMS Viva Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
