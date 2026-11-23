import React, { useState } from 'react';
import { X, CreditCard, QrCode, Building, Banknote, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function PaymentModal({ invoice, onClose, onPaymentSuccess }) {
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8891 0023 9988');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [bank, setBank] = useState('HDFC Bank');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!invoice) return null;

  const totalAmount = Number(invoice.totalAmount);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/payments', {
        invoiceId: invoice.id,
        amount: totalAmount,
        paymentMethod: method,
        notes: notes || `Simulated payment via ${method}`
      });

      if (res.success) {
        setSuccessData(res.data);
        if (onPaymentSuccess) {
          onPaymentSuccess(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
              Complete Payment Simulation
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Invoice: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{invoice.invoiceNumber}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {successData ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#15803d' }}>
                Payment Successful!
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Amount Paid: <strong style={{ color: '#0f172a' }}>₹{totalAmount.toFixed(2)}</strong>
              </p>
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                color: '#475569'
              }}>
                Txn Ref: {successData.payment?.transactionRef || 'SUCCESS-TXN'}
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', width: '100%' }}
                onClick={onClose}
              >
                Close & Refresh
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay}>
              {/* Amount Banner */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#eff6ff',
                borderRadius: '10px',
                border: '1px solid #bfdbfe',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: '600', textTransform: 'uppercase' }}>
                    Total Payable
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e3a8a' }}>
                    ₹{totalAmount.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803d', fontSize: '0.8rem', fontWeight: '600' }}>
                  <ShieldCheck size={18} /> Safe & Simulated
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Select Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'UPI', label: 'UPI', icon: QrCode },
                    { id: 'CARD', label: 'Card', icon: CreditCard },
                    { id: 'NET_BANKING', label: 'Net Bank', icon: Building },
                    { id: 'CASH', label: 'Cash', icon: Banknote }
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = method === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setMethod(item.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.75rem 0.5rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          color: isSelected ? '#2563eb' : '#64748b',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '0.8rem'
                        }}
                      >
                        <Icon size={20} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Method Details */}
              {method === 'UPI' && (
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0f172a'
                    }}>
                      <QrCode size={40} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Scan QR code with Google Pay, PhonePe, or Paytm, or enter your VPA below.
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">UPI ID / VPA</label>
                    <input
                      type="text"
                      className="form-input"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or name@okaxis"
                      required
                    />
                  </div>
                </div>
              )}

              {method === 'CARD' && (
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        className="form-input"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'NET_BANKING' && (
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                  <label className="form-label">Select Bank</label>
                  <select
                    className="form-select"
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                  >
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Punjab National Bank</option>
                  </select>
                </div>
              )}

              {method === 'CASH' && (
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                  Record counter payment collected in cash by workshop service advisor.
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Remarks / Note (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Paid in full"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing Payment...
                  </>
                ) : (
                  `Pay ₹${totalAmount.toFixed(2)} (Simulate)`
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
