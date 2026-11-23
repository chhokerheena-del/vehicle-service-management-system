import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Car, 
  Search, 
  Wrench, 
  CheckCheck, 
  XCircle, 
  CreditCard 
} from 'lucide-react';

export default function StatusBadge({ status, type = 'appointment' }) {
  if (!status) return null;

  if (type === 'payment') {
    switch (status) {
      case 'PAID':
        return (
          <span className="badge badge-paid">
            <CheckCircle2 size={12} /> PAID
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="badge badge-pending">
            <CreditCard size={12} /> PARTIAL
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge badge-cancelled">
            <XCircle size={12} /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="badge badge-pending">
            <Clock size={12} /> PENDING
          </span>
        );
    }
  }

  // Appointment Statuses
  switch (status) {
    case 'PENDING':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> Pending Review
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="badge badge-confirmed">
          <CheckCircle2 size={12} /> Confirmed
        </span>
      );
    case 'VEHICLE_RECEIVED':
      return (
        <span className="badge badge-received">
          <Car size={12} /> Vehicle Received
        </span>
      );
    case 'INSPECTION':
      return (
        <span className="badge badge-inspection">
          <Search size={12} /> Under Inspection
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="badge badge-in_progress">
          <Wrench size={12} /> In Progress
        </span>
      );
    case 'READY_FOR_PICKUP':
      return (
        <span className="badge badge-ready">
          <CheckCheck size={12} /> Ready for Pickup
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="badge badge-completed">
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="badge badge-cancelled">
          <XCircle size={12} /> Cancelled
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
}
