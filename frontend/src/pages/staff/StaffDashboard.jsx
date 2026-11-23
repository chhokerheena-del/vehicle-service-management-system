import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Clock, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Users, 
  ArrowRight,
  Loader2 
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffOverview();
  }, []);

  const loadStaffOverview = async () => {
    setLoading(true);
    try {
      const [aptRes, mecRes, prtRes] = await Promise.all([
        api.get('/appointments?limit=15'),
        api.get('/mechanics'),
        api.get('/parts?lowStockOnly=true')
      ]);

      if (aptRes.success) setAppointments(aptRes.data);
      if (mecRes.success) setMechanics(mecRes.data);
      if (prtRes.success) setParts(prtRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingBookings = appointments.filter(a => a.status === 'PENDING').length;
  const inProgressJobs = appointments.filter(a => ['INSPECTION', 'IN_PROGRESS', 'VEHICLE_RECEIVED'].includes(a.status)).length;
  const readyForPickup = appointments.filter(a => a.status === 'READY_FOR_PICKUP').length;
  const availableMechanics = mechanics.filter(m => m.status === 'AVAILABLE').length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
        Loading workshop operations dashboard...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Workshop Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.75rem 2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <span className="badge badge-received" style={{ marginBottom: '0.4rem' }}>
            WORKSHOP OPERATIONS DESK
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
            Service Floor Overview
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Intake incoming vehicles, assign master mechanics, record diagnostic findings, and consume parts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/staff/appointments" className="btn btn-primary">
            <Clock size={18} /> Manage Service Queue
          </Link>
          <Link to="/staff/inventory" className="btn btn-outline">
            <Package size={18} /> Parts Inventory
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-4">
        <StatCard
          title="Pending Booking Review"
          value={pendingBookings}
          icon={Clock}
          color="warning"
          change={pendingBookings > 0 ? 'Requires action' : 'Queue cleared'}
        />
        <StatCard
          title="Active Workshop Jobs"
          value={inProgressJobs}
          icon={Wrench}
          color="primary"
          change="Bays operational"
        />
        <StatCard
          title="Ready For Handover"
          value={readyForPickup}
          icon={CheckCircle2}
          color="success"
          change="Customer pickup pending"
        />
        <StatCard
          title="Available Technicians"
          value={`${availableMechanics}/${mechanics.length}`}
          icon={Users}
          color="secondary"
          change="Mechanic bay capacity"
        />
      </div>

      {/* Low Stock Warning Banner if any */}
      {parts.length > 0 && (
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#fff7ed',
          borderRadius: '12px',
          border: '1px solid #ffedd5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#fed7aa',
              color: '#c2410c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#9a3412', fontSize: '0.95rem' }}>
                Inventory Alert: {parts.length} Spare Part(s) Low or Out of Stock
              </div>
              <div style={{ fontSize: '0.85rem', color: '#c2410c' }}>
                Items like brake pads or filters need immediate replenishment to avoid repair delays.
              </div>
            </div>
          </div>
          <Link to="/staff/inventory" className="btn btn-sm btn-outline" style={{ borderColor: '#fdba74', color: '#9a3412' }}>
            Review Inventory
          </Link>
        </div>
      )}

      {/* Main Operations Queue */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Active Service Bay Queue</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Select an appointment to perform diagnostics, assign mechanics, and log consumed parts.
            </p>
          </div>
          <Link to="/staff/appointments" className="btn btn-outline btn-sm">
            View All ({appointments.length})
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No appointments found in the system.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appointment #</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Assigned Mechanic</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 8).map(a => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#2563eb' }}>
                      {a.appointmentNumber}
                    </td>
                    <td>
                      <strong>{a.user?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.user?.phone}</div>
                    </td>
                    <td>
                      <strong>{a.vehicle?.make} {a.vehicle?.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {a.vehicle?.regNumber}
                      </div>
                    </td>
                    <td>{a.service?.name}</td>
                    <td>
                      {a.serviceRecord?.mechanic ? (
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>
                          {a.serviceRecord.mechanic.name}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {new Date(a.preferredDate).toLocaleDateString()}
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.preferredTimeSlot}</div>
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link
                        to={`/staff/process/${a.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Process Service <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
