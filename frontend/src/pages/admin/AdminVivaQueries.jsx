import React, { useState, useEffect } from 'react';
import { Database, Play, Clock, Rows, ChevronRight, Loader2, AlertTriangle, Code, BookOpen } from 'lucide-react';
import api from '../../services/api';

export default function AdminVivaQueries() {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [customSql, setCustomSql] = useState('');
  const [results, setResults] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('curated'); // 'curated' | 'custom'

  useEffect(() => {
    api.get('/dbms-queries')
      .then(res => { if (res.success) setQueries(res.data); })
      .catch(err => console.error('Failed to load queries:', err.message));
  }, []);

  const executeQuery = async (queryId = null, sql = null) => {
    setExecuting(true);
    setError('');
    setResults(null);
    try {
      const payload = queryId ? { queryId } : { customSql: sql };
      const res = await api.post('/dbms-queries/execute', payload);
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      setError('SQL Error: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleQuerySelect = (q) => {
    setSelectedQuery(q);
    setCustomSql(q.sql);
    setResults(null);
    setError('');
  };

  const handleRunCustom = () => {
    if (!customSql.trim()) {
      setError('Please enter a SQL query.');
      return;
    }
    executeQuery(null, customSql);
  };

  const categoryColors = {
    'SELECT, WHERE, ORDER BY': '#eff6ff',
    'INNER JOIN (3 Tables)': '#f0fdf4',
    'Multi-Table Join (Many-to-Many Junction)': '#fdf4ff',
    'LEFT OUTER JOIN & Aggregates': '#fff7ed',
    'Aggregates (COUNT, SUM, AVG, MIN, MAX)': '#fef2f2',
    'GROUP BY with Aggregates': '#fffbeb',
    'GROUP BY with HAVING Clause': '#ecfdf5',
    'Subquery with IN Operator': '#f0f9ff',
    'Correlated Subquery with EXISTS': '#fdf2f8',
    'Scalar Subquery Comparison': '#f5f3ff',
    'Database View Query': '#eff6ff',
    'Conditional CASE Expression': '#fff7ed',
    'Database View & Revenue Analysis': '#f0fdf4',
    'View Exploration & Aggregate Ratings': '#ecfdf5',
    'Aggregates & Grouping by Enum': '#fdf4ff'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>SQL Query Explorer</h1>
            <p style={{ color: '#64748b', marginTop: '0.1rem' }}>15 curated DBMS viva queries + live custom SQL execution on the MySQL database.</p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', borderRadius: '12px', padding: '0.5rem', width: 'fit-content' }}>
        <button onClick={() => setMode('curated')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: mode === 'curated' ? '#fff' : 'transparent', color: mode === 'curated' ? '#2563eb' : '#64748b', boxShadow: mode === 'curated' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}>
          <BookOpen size={16} /> Curated Queries (15)
        </button>
        <button onClick={() => setMode('custom')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: mode === 'custom' ? '#fff' : 'transparent', color: mode === 'custom' ? '#2563eb' : '#64748b', boxShadow: mode === 'custom' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}>
          <Code size={16} /> Custom SQL Editor
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mode === 'curated' ? '320px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Sidebar: Curated Queries List */}
        {mode === 'curated' && (
          <div className="card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">DBMS Concepts</h3>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8' }}>{queries.length} queries</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {queries.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleQuerySelect(q)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem',
                    padding: '0.9rem 1rem', margin: '0 0.5rem',
                    borderRadius: '8px', border: '1px solid',
                    borderColor: selectedQuery?.id === q.id ? '#bfdbfe' : 'transparent',
                    backgroundColor: selectedQuery?.id === q.id ? '#eff6ff' : (categoryColors[q.category] || '#f8fafc'),
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.72rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</span>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.88rem', flex: 1 }}>{q.title}</span>
                    {selectedQuery?.id === q.id && <ChevronRight size={16} style={{ color: '#2563eb', flexShrink: 0 }} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', paddingLeft: '1.75rem' }}>{q.category}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Query Detail / Editor */}
          {mode === 'curated' && selectedQuery ? (
            <div className="card">
              <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#eff6ff', color: '#2563eb', marginBottom: '0.4rem' }}>
                    {selectedQuery.category}
                  </span>
                  <h2 style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{selectedQuery.title}</h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.2rem' }}>{selectedQuery.purpose}</p>
                </div>
                <button
                  onClick={() => executeQuery(selectedQuery.id)}
                  disabled={executing}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start', flexShrink: 0 }}
                >
                  {executing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} />}
                  {executing ? 'Executing...' : 'Run Query'}
                </button>
              </div>

              <div style={{ margin: '0 1rem 1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  {selectedQuery.concepts?.map(c => (
                    <span key={c} style={{ padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f1f5f9', color: '#475569' }}>{c}</span>
                  ))}
                </div>
                <pre style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: '10px', padding: '1.25rem', overflowX: 'auto', fontSize: '0.85rem', lineHeight: '1.7', fontFamily: 'var(--font-mono)' }}>
                  <code>{selectedQuery.sql}</code>
                </pre>
              </div>
            </div>
          ) : mode === 'curated' ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Database size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
              <p style={{ color: '#94a3b8', fontWeight: '600' }}>Select a query from the left panel to view and execute it.</p>
            </div>
          ) : null}

          {/* Custom SQL Editor */}
          {mode === 'custom' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Custom SQL Editor</h3>
                <button onClick={handleRunCustom} disabled={executing} className="btn btn-primary">
                  {executing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} />}
                  {executing ? 'Executing...' : 'Run SQL'}
                </button>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                <div style={{ padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.82rem', color: '#b45309', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span>Only SELECT queries allowed. DROP DATABASE and TRUNCATE are disabled for safety.</span>
                </div>
                <textarea
                  value={customSql}
                  onChange={e => setCustomSql(e.target.value)}
                  placeholder="SELECT * FROM appointments LIMIT 10;"
                  style={{ width: '100%', minHeight: '220px', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', lineHeight: '1.7', backgroundColor: '#0f172a', color: '#e2e8f0', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Query Results</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {results.rowCount} row{results.rowCount !== 1 ? 's' : ''} returned
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
                    <Clock size={15} /> {results.executionTimeMs}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
                    <Rows size={15} /> {results.rowCount} rows
                  </div>
                </div>
              </div>
              {results.rows && results.rows.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>{results.columns.map(col => <th key={col}>{col}</th>)}</tr>
                    </thead>
                    <tbody>
                      {results.rows.map((row, i) => (
                        <tr key={i}>
                          {results.columns.map(col => (
                            <td key={col} style={{ fontFamily: typeof row[col] === 'number' ? 'var(--font-mono)' : 'inherit', fontSize: '0.88rem' }}>
                              {row[col] === null ? <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span>
                                : typeof row[col] === 'object' ? JSON.stringify(row[col])
                                  : String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <p>Query executed successfully but returned 0 rows.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
