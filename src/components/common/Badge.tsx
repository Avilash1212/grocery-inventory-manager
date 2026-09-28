import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, XCircle, PackageCheck, Send } from 'lucide-react';
import { QuoteStatus, OrderStatus } from '../../types';

interface BadgeProps {
  variant?: 'stock' | 'quote' | 'order' | 'custom';
  status?: string;
  stockCount?: number;
  minStock?: number;
  unit?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'stock',
  status,
  stockCount = 0,
  minStock = 0,
  className = '',
  children,
}) => {
  if (variant === 'stock') {
    if (stockCount <= 0) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          Out of Stock
        </span>
      );
    }
    if (stockCount <= minStock) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          Low Stock
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        In Stock
      </span>
    );
  }

  if (variant === 'quote') {
    const quoteStatus = status as QuoteStatus;
    switch (quoteStatus) {
      case 'draft':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Draft
          </span>
        );
      case 'sent':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
            <Send className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            Sent
          </span>
        );
      case 'accepted':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Accepted
          </span>
        );
      case 'converted':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
            <PackageCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            Converted to Order
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            {quoteStatus === 'rejected' ? 'Rejected' : 'Cancelled'}
          </span>
        );
      case 'expired':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Expired
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 ${className}`}>
            {status}
          </span>
        );
    }
  }

  if (variant === 'order') {
    const orderStatus = status as OrderStatus;
    switch (orderStatus) {
      case 'draft':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
            Draft
          </span>
        );
      case 'confirmed':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
            Confirmed
          </span>
        );
      case 'preparing':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
            Preparing
          </span>
        );
      case 'ready':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
            Ready for Pickup
          </span>
        );
      case 'delivered':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
            Cancelled
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 ${className}`}>
            {status}
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      {children || status}
    </span>
  );
};
