import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Search, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import InvoiceModal from '../../components/InvoiceModal';
import PaymentModal from '../../components/PaymentModal';
import api from '../../services/api';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invoices');
      if (res.success) setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                          inv.appointment?.vehicle?.regNumber.toLowerCase().includes(search.toLowerCase()) ||
                          inv.appointment?.service?.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
            Invoices & Billing Statements
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Official GST-compliant automotive tax invoices with itemized labor and parts breakdown.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: '#ffffff',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'PENDING', 'PAID'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: statusFilter === status ? '700' : '500',
                backgroundColor: statusFilter === status ? '#2563eb' : '#f8fafc',
                color: statusFilter === status ? '#ffffff' : '#64748b',
                border: '1px solid var(--border)'
              }}
            >
              {status === 'ALL' ? 'All Invoices' : status}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by invoice number or vehicle..."
          className="form-input"
          style={{ maxWidth: '300px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
          Loading invoices...
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>No Invoices Found</h3>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Invoices are automatically generated when your service enters the ready or completion stage.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Service Package</th>
                  <th style={{ textAlign: 'right' }}>Labor (₹)</th>
                  <th style={{ textAlign: 'right' }}>Parts (₹)</th>
                  <th style={{ textAlign: 'right' }}>Tax (18%)</th>
                  <th style={{ textAlign: 'right' }}>Grand Total (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => {
                  const apt = inv.appointment || {};
                  const vehicle = apt.vehicle || {};
                  const service = apt.service || {};

                  return (
                    <tr key={inv.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#2563eb' }}>
                        {inv.invoiceNumber}
                      </td>
                      <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td>
                        <strong>{vehicle.make} {vehicle.model}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          {vehicle.regNumber}
                        </div>
                      </td>
                      <td>{service.name}</td>
                      <td style={{ textAlign: 'right' }}>{Number(inv.serviceCharges).toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(inv.partsCharges).toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>{Number(inv.taxAmount).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                        ₹{Number(inv.totalAmount).toFixed(2)}
                      </td>
                      <td>
                        <StatusBadge status={inv.paymentStatus} type="payment" />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="btn btn-outline btn-sm"
                            title="View / Print Tax Invoice"
                          >
                            <FileText size={15} />
                          </button>
                          {inv.paymentStatus !== 'PAID' && (
                            <button
                              onClick={() => setPayingInvoice(inv)}
                              className="btn btn-success btn-sm"
                            >
                              <CreditCard size={15} /> Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onOpenPayment={(inv) => {
            setSelectedInvoice(null);
            setPayingInvoice(inv);
          }}
        />
      )}

      {/* Payment Simulation Modal */}
      {payingInvoice && (
        <PaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentSuccess={() => {
            loadInvoices();
          }}
        />
      )}
    </div>
  );
}
