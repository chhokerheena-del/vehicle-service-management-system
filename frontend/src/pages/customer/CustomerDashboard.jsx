import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CustomerDashboard() {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [vehiclesResponse, appointmentsResponse, invoicesResponse] =
        await Promise.all([
          api.get('/vehicles'),
          api.get('/appointments?limit=10'),
          api.get('/invoices')
        ]);

      if (vehiclesResponse?.success) {
        setVehicles(vehiclesResponse.data || []);
      }

      if (appointmentsResponse?.success) {
        setAppointments(appointmentsResponse.data || []);
      }

      if (invoicesResponse?.success) {
        setInvoices(invoicesResponse.data || []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const activeAppointment = appointments.find(
    (appointment) =>
      !['COMPLETED', 'CANCELLED'].includes(appointment.status)
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === 'COMPLETED'
  );

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === 'PENDING'
  );

  const pendingAmount = pendingInvoices.reduce(
    (total, invoice) => total + Number(invoice.totalAmount || 0),
    0
  );

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getStatusStyle = (status) => {
    const styles = {
      COMPLETED: {
        background: '#dcfce7',
        color: '#166534'
      },
      READY_FOR_PICKUP: {
        background: '#dbeafe',
        color: '#1d4ed8'
      },
      IN_PROGRESS: {
        background: '#fef3c7',
        color: '#92400e'
      },
      CONFIRMED: {
        background: '#e0e7ff',
        color: '#3730a3'
      },
      PENDING: {
        background: '#fef3c7',
        color: '#92400e'
      },
      CANCELLED: {
        background: '#fee2e2',
        color: '#991b1b'
      }
    };

    return styles[status] || {
      background: '#f3f4f6',
      color: '#374151'
    };
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '50px',
          textAlign: 'center',
          fontSize: '18px'
        }}
      >
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '10px'
      }}
    >
      {/* Welcome */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827'
          }}
        >
          Welcome back, {user?.name || 'Customer'}!
        </h1>

        <p
          style={{
            marginTop: '8px',
            marginBottom: 0,
            color: '#6b7280'
          }}
        >
          Manage your vehicles, appointments and service history.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '16px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '12px',
            border: '1px solid #fecaca'
          }}
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={cardStyle}>
          <div style={iconStyle}>🚗</div>

          <div>
            <p style={labelStyle}>My Vehicles</p>
            <h2 style={numberStyle}>{vehicles.length}</h2>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>📅</div>

          <div>
            <p style={labelStyle}>Appointments</p>
            <h2 style={numberStyle}>{appointments.length}</h2>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>✓</div>

          <div>
            <p style={labelStyle}>Completed Services</p>
            <h2 style={numberStyle}>
              {completedAppointments.length}
            </h2>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>₹</div>

          <div>
            <p style={labelStyle}>Pending Amount</p>
            <h2 style={numberStyle}>
              {formatCurrency(pendingAmount)}
            </h2>
          </div>
        </div>
      </div>

      {/* Active Appointment */}
      {activeAppointment && (
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Active Appointment</h2>

              <p style={mutedStyle}>
                {activeAppointment.appointmentNumber}
              </p>
            </div>

            <span
              style={{
                ...statusStyle,
                ...getStatusStyle(activeAppointment.status)
              }}
            >
              {activeAppointment.status?.replaceAll('_', ' ')}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}
          >
            <InfoItem
              label="Service"
              value={
                activeAppointment.service?.name || 'Service unavailable'
              }
            />

            <InfoItem
              label="Vehicle"
              value={
                activeAppointment.vehicle
                  ? `${activeAppointment.vehicle.make} ${activeAppointment.vehicle.model}`
                  : 'Vehicle unavailable'
              }
            />

            <InfoItem
              label="Registration"
              value={
                activeAppointment.vehicle?.regNumber || 'N/A'
              }
            />

            <InfoItem
              label="Service Center"
              value={
                activeAppointment.serviceCenter?.name || 'N/A'
              }
            />

            <InfoItem
              label="Date"
              value={
                activeAppointment.preferredDate
                  ? new Date(
                      activeAppointment.preferredDate
                    ).toLocaleDateString('en-IN')
                  : 'N/A'
              }
            />

            <InfoItem
              label="Time Slot"
              value={
                activeAppointment.preferredTimeSlot || 'N/A'
              }
            />
          </div>
        </div>
      )}

      {/* Vehicles */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>My Vehicles</h2>

            <p style={mutedStyle}>
              Your registered vehicles
            </p>
          </div>

          <Link
            to="/customer/vehicles"
            style={linkStyle}
          >
            View All →
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <p style={emptyStyle}>
            No vehicles registered yet.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '20px'
            }}
          >
            {vehicles.slice(0, 3).map((vehicle) => (
              <div
                key={vehicle.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '18px',
                  background: '#fafafa'
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: '#111827'
                  }}
                >
                  {vehicle.make} {vehicle.model}
                </h3>

                <p style={mutedStyle}>
                  {vehicle.variant || ''}
                </p>

                <div style={{ marginTop: '12px' }}>
                  <p style={smallTextStyle}>
                    <strong>Registration:</strong>{' '}
                    {vehicle.regNumber}
                  </p>

                  <p style={smallTextStyle}>
                    <strong>Year:</strong>{' '}
                    {vehicle.year}
                  </p>

                  <p style={smallTextStyle}>
                    <strong>Mileage:</strong>{' '}
                    {Number(vehicle.mileage || 0).toLocaleString(
                      'en-IN'
                    )}{' '}
                    km
                  </p>

                  <p style={smallTextStyle}>
                    <strong>Fuel:</strong>{' '}
                    {vehicle.fuelType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>
              Recent Appointments
            </h2>

            <p style={mutedStyle}>
              Your latest service appointments
            </p>
          </div>

          <Link
            to="/customer/appointments"
            style={linkStyle}
          >
            View All →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p style={emptyStyle}>
            No appointments found.
          </p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {appointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px',
                  flexWrap: 'wrap',
                  padding: '18px 0',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: '#111827',
                      fontSize: '16px'
                    }}
                  >
                    {appointment.service?.name ||
                      'Service Appointment'}
                  </h3>

                  <p style={smallTextStyle}>
                    {appointment.vehicle?.make}{' '}
                    {appointment.vehicle?.model}{' '}
                    ({appointment.vehicle?.regNumber})
                  </p>

                  <p style={smallTextStyle}>
                    {appointment.preferredDate
                      ? new Date(
                          appointment.preferredDate
                        ).toLocaleDateString('en-IN')
                      : 'Date unavailable'}
                    {' • '}
                    {appointment.preferredTimeSlot || ''}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <span
                    style={{
                      ...statusStyle,
                      ...getStatusStyle(
                        appointment.status
                      )
                    }}
                  >
                    {appointment.status?.replaceAll('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>
              Recent Invoices
            </h2>

            <p style={mutedStyle}>
              Your service billing history
            </p>
          </div>

          <Link
            to="/customer/invoices"
            style={linkStyle}
          >
            View All →
          </Link>
        </div>

        {invoices.length === 0 ? (
          <p style={emptyStyle}>
            No invoices found.
          </p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {invoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px',
                  flexWrap: 'wrap',
                  padding: '18px 0',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: '#111827',
                      fontSize: '16px'
                    }}
                  >
                    {invoice.invoiceNumber}
                  </h3>

                  <p style={smallTextStyle}>
                    {invoice.appointment?.service?.name ||
                      'Service'}
                  </p>

                  <p style={smallTextStyle}>
                    {invoice.createdAt
                      ? new Date(
                          invoice.createdAt
                        ).toLocaleDateString('en-IN')
                      : ''}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <strong
                    style={{
                      color: '#111827'
                    }}
                  >
                    {formatCurrency(invoice.totalAmount)}
                  </strong>

                  <span
                    style={{
                      ...statusStyle,
                      ...getStatusStyle(
                        invoice.paymentStatus
                      )
                    }}
                  >
                    {invoice.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
};

const iconStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  flexShrink: 0
};

const labelStyle = {
  margin: 0,
  color: '#6b7280',
  fontSize: '13px'
};

const numberStyle = {
  margin: '5px 0 0',
  color: '#111827',
  fontSize: '24px'
};

const sectionStyle = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '15px',
  flexWrap: 'wrap'
};

const sectionTitleStyle = {
  margin: 0,
  color: '#111827',
  fontSize: '20px'
};

const mutedStyle = {
  margin: '6px 0 0',
  color: '#6b7280',
  fontSize: '14px'
};

const smallTextStyle = {
  margin: '7px 0 0',
  color: '#6b7280',
  fontSize: '13px'
};

const linkStyle = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '14px'
};

const emptyStyle = {
  marginTop: '20px',
  color: '#6b7280',
  textAlign: 'center',
  padding: '30px'
};

const statusStyle = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: '700',
  whiteSpace: 'nowrap'
};

function InfoItem({ label, value }) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          fontSize: '12px',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: '6px 0 0',
          color: '#111827',
          fontWeight: '600'
        }}
      >
        {value}
      </p>
    </div>
  );
}
