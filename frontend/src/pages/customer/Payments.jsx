import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, QrCode, Building, Banknote, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      if (res.success) setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'UPI': return <QrCode size={16} />;
      case 'CARD': return <CreditCard size={16} />;
      case 'NET_BANKING': return <Building size={16} />;
      case 'CASH': return <Banknote size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
          Payment Receipts & Transactions
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Historical record of all payments settled across UPI, Credit/Debit Cards, Net Banking, and Workshop Cash.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
          Loading payment receipts...
        </div>
      ) : payments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <CreditCard size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>No Payment Transactions</h3>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            When you settle bills for vehicle servicing, official receipts will be logged here.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date & Time</th>
                  <th>Invoice Ref</th>
                  <th>Vehicle</th>
                  <th>Method</th>
                  <th>Transaction Reference</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const inv = p.invoice || {};
                  const apt = inv.appointment || {};
                  const vehicle = apt.vehicle || {};

                  return (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0f172a' }}>
                        {p.paymentNumber}
                      </td>
                      <td>{new Date(p.paidAt).toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#2563eb' }}>
                        {inv.invoiceNumber}
                      </td>
                      <td>
                        <strong>{vehicle.make} {vehicle.model}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          {vehicle.regNumber}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-received" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {getMethodIcon(p.paymentMethod)} {p.paymentMethod}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#475569' }}>
                        {p.transactionRef || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: '#15803d' }}>
                        ₹{Number(p.amount).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge badge-completed">
                          <CheckCircle2 size={12} /> {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
