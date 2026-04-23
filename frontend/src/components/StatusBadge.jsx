import React from 'react';
import { CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: <CheckCircle2 size={14} className="mr-1.5" />
        };
      case 'in progress':
      case 'processing':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: <PlayCircle size={14} className="mr-1.5" />
        };
      case 'failed':
      case 'error':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-700',
          border: 'border-rose-200',
          icon: <XCircle size={14} className="mr-1.5" />
        };
      case 'pending':
      case 'to do':
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: <Clock size={14} className="mr-1.5" />
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border}`}>
      {styles.icon}
      {status || 'Pending'}
    </span>
  );
};

export default StatusBadge;
