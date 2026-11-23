import React, { useState, useEffect } from 'react';
import { Database, Play, CheckCircle2, FileText, ArrowRight, Table, Layers, Cpu, Code2, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function VivaGuide() {
  const [queries, setQueries] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState('');
  const [customSql, setCustomSql] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dbms-queries/list')
      .then(res => {
        if (res.success && res.data) {
          setQueries(res.data);
          if (res.data.length > 0) {
            setSelectedQueryId(res.data[0].id);
            setCustomSql(res.data[0].sql);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectQuery = (qId) => {
    setSelectedQueryId(qId);
    const q = queries.find(item => item.id === qId);
    if (q) {
      setCustomSql(q.sql);
      setQueryResult(null);
      setError('');
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setError('');
    setQueryResult(null);

    try {
      const res = await api.post('/dbms-queries/execute', {
        customSql: customSql
      });

      if (res.success) {
        setQueryResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'SQL execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const selectedQuery = queries.find(q => q.id === selectedQueryId);

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: '#f8fafc', minHeight: '90vh' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Viva Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            <Database size={16} /> BTech CSE Relational Database Examination Guide
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>
            DBMS Architecture & Live SQL Query Explorer
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            Interactive evaluation laboratory demonstrating normalization, constraints, multi-table joins, views, and ACID transactions live against MySQL 8.0.
          </p>
        </div>

        {/* Core Concepts Breakdown Tabs/Cards */}
        <div className="grid grid-cols-3" style={{ gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontWeight: '800', marginBottom: '0.5rem' }}>
              <Layers size={20} /> 3NF Normalization
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              All 12 tables satisfy 1NF (atomic values), 2NF (no partial functional dependencies), and 3NF (no transitive dependencies X → Y → Z).
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: '800', marginBottom: '0.5rem' }}>
              <Cpu size={20} /> ACID Transactions
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Service completion, invoice creation, and inventory decrement execute as atomic database transactions ensuring data consistency.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', fontWeight: '800', marginBottom: '0.5rem' }}>
              <Table size={20} /> Relational Constraints
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Foreign keys with ON DELETE CASCADE / RESTRICT, unique constraints on registration numbers and invoice IDs, plus stock check constraints.
            </p>
          </div>
        </div>

        {/* Live SQL Query Runner Section */}
        <div className="card" style={{ padding: '2rem', border: '2px solid #2563eb', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                Live SQL Query Execution Lab
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Select from 15 curated viva queries or write custom SQL. Runs directly against MySQL 8.0 engine.
              </p>
            </div>
            <button
              onClick={handleExecute}
              className="btn btn-primary"
              disabled={executing}
              style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
            >
              {executing ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Executing SQL...
                </>
              ) : (
                <>
                  <Play size={18} fill="#fff" /> Run Query Live
                </>
              )}
            </button>
          </div>

          {/* Preset Selector */}
          <div className="form-group">
            <label className="form-label">Select Curated Viva Query</label>
            <select
              className="form-select"
              value={selectedQueryId}
              onChange={e => handleSelectQuery(e.target.value)}
              style={{ fontWeight: '600' }}
            >
              {queries.map(q => (
                <option key={q.id} value={q.id}>
                  [{q.category}] - {q.title}
                </option>
              ))}
            </select>
          </div>

          {/* Query Description Card */}
          {selectedQuery && (
            <div style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              borderLeft: '4px solid #2563eb'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                {selectedQuery.concepts.map((concept, idx) => (
                  <span key={idx} className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>
                    {concept}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600' }}>
                Purpose: {selectedQuery.purpose}
              </div>
            </div>
          )}

          {/* SQL Editor Box */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SQL Query (Editable)</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                Target: vehicle_service_db (MySQL 8.0)
              </span>
            </label>
            <textarea
              rows={6}
              className="form-textarea"
              value={customSql}
              onChange={e => setCustomSql(e.target.value)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                borderRadius: '8px',
                padding: '1rem'
              }}
            />
          </div>

          {/* Execution Error */}
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          {/* Results Grid */}
          {queryResult && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span className="badge badge-ready">Query Success</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Returned <strong>{queryResult.rowCount}</strong> rows in <strong>{queryResult.executionTimeMs}</strong>
                  </span>
                </div>
              </div>

              {queryResult.rows.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  Query executed successfully with 0 rows matching.
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '350px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {queryResult.columns.map((col, cIdx) => {
                            const val = row[col];
                            return (
                              <td key={cIdx} style={{ fontFamily: typeof val === 'number' ? 'var(--font-mono)' : 'inherit' }}>
                                {val === null ? (
                                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span>
                                ) : typeof val === 'object' ? (
                                  JSON.stringify(val)
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Database Entities Cardinality Quick Matrix */}
        <div className="card" style={{ marginTop: '2.5rem', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
            Entity Relationships & Cardinality Schema
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>users (1) ──── (N) vehicles</strong><br />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>ON DELETE CASCADE</span>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>users (1) ──── (N) appointments</strong><br />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>ON DELETE CASCADE</span>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>service_centers (1) ──── (N) mechanics</strong><br />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>ON DELETE RESTRICT</span>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>appointments (1) ──── (1) service_records</strong><br />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>One-to-One Strict Relationship</span>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>service_records (N) ──── (N) parts</strong><br />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Junction: service_parts (M:N)</span>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>appointments (1) ──── (1) invoices</strong><br />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Calculated: Subtotal + 18% GST</span>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>invoices (1) ──── (N) payments</strong><br />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Supports partial installments</span>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>appointments (1) ──── (1) feedback</strong><br />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Post-completion verified reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
