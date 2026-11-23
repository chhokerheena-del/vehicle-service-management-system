import React from 'react';
import { X, Printer, Wrench, CheckCircle2, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function InvoiceModal({ invoice, onClose, onOpenPayment }) {
  if (!invoice) return null;

  const apt = invoice.appointment || {};
  const customer = apt.user || {};
  const vehicle = apt.vehicle || {};
  const center = apt.serviceCenter || {};
  const service = apt.service || {};
  const record = apt.serviceRecord || {};
  const parts = record.serviceParts || [];
  const payments = invoice.payments || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Tax Invoice</h3>
            <StatusBadge status={invoice.paymentStatus} type="payment" />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm" onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} style={{ color: '#64748b' }}><X size={20} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '2rem' }}>
          {/* Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb' }}>
                <Wrench size={26} />
                <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
                  AutoCare <span style={{ color: '#2563eb' }}>Pro</span>
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                <strong>{center.name || 'AutoCare Central Hub'}</strong>
                <div>{center.address}, {center.city} - {center.pincode}</div>
                <div>Ph: {center.phone} | GSTIN: 07AAACA1234F1Z8</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>TAX INVOICE</div>
              <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#2563eb' }}>
                {invoice.invoiceNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                Date: {new Date(invoice.createdAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Appointment: {apt.appointmentNumber}
              </div>
            </div>
          </div>

          {/* Billed To / Vehicle Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Billed To (Customer)
              </div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>{customer.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>Ph: {customer.phone || 'N/A'}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>Email: {customer.email}</div>
              {customer.address && <div style={{ fontSize: '0.85rem', color: '#475569' }}>{customer.address}, {customer.city}</div>}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Vehicle Details
              </div>
              <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>
                {vehicle.regNumber}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                {vehicle.make} {vehicle.model} ({vehicle.variant || ''})
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Fuel: {vehicle.fuelType} | Year: {vehicle.year} | Odo: {record.currentMileage || vehicle.mileage} km
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description / Item</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {/* Primary Service Charge */}
                <tr>
                  <td>1</td>
                  <td>
                    <strong>{service.name || 'Automotive Service'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Labor, diagnostics, and multi-point servicing</div>
                  </td>
                  <td><span className="badge badge-confirmed">Labor / Service</span></td>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td style={{ textAlign: 'right' }}>{Number(invoice.serviceCharges).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>{Number(invoice.serviceCharges).toFixed(2)}</td>
                </tr>

                {/* Spare Parts Consumed */}
                {parts.map((sp, idx) => (
                  <tr key={sp.id || idx}>
                    <td>{idx + 2}</td>
                    <td>
                      <strong>{sp.part?.name || 'Spare Part'}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        PN: {sp.part?.partNumber}
                      </div>
                    </td>
                    <td><span className="badge badge-received">{sp.part?.category || 'Parts'}</span></td>
                    <td style={{ textAlign: 'center' }}>{sp.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{Number(sp.unitPrice).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{Number(sp.totalCost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Labor / Service Charges:</span>
                <span style={{ fontWeight: '600' }}>₹{Number(invoice.serviceCharges).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Parts & Materials:</span>
                <span style={{ fontWeight: '600' }}>₹{Number(invoice.partsCharges).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: '700', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                <span>Subtotal:</span>
                <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>GST (18% Integrated Tax):</span>
                <span>₹{Number(invoice.taxAmount).toFixed(2)}</span>
              </div>
              {Number(invoice.discountAmount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '600' }}>
                  <span>Promotional Discount:</span>
                  <span>-₹{Number(invoice.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#0f172a',
                fontSize: '1.25rem',
                fontWeight: '800',
                borderTop: '2px solid #0f172a',
                paddingTop: '0.5rem',
                marginTop: '0.25rem'
              }}>
                <span>Total Amount:</span>
                <span style={{ color: '#2563eb' }}>₹{Number(invoice.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Receipts History */}
          {payments.length > 0 && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                Recorded Payments:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {payments.map(p => (
                  <div key={p.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    backgroundColor: '#f1f5f9',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px'
                  }}>
                    <span>
                      <strong style={{ color: '#15803d' }}>{p.paymentMethod}</strong> ({p.transactionRef || p.paymentNumber})
                    </span>
                    <span>
                      <strong>₹{Number(p.amount).toFixed(2)}</strong> on {new Date(p.paidAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem' }}>
            Thank you for choosing AutoCare Pro! All parts backed by 6 months / 10,000 km warranty.
            Computer generated tax invoice.
          </div>
        </div>

        <div className="modal-footer no-print">
          {invoice.paymentStatus !== 'PAID' && onOpenPayment && (
            <button className="btn btn-success" onClick={() => onOpenPayment(invoice)}>
              Pay Now (₹{Number(invoice.totalAmount).toFixed(2)})
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
