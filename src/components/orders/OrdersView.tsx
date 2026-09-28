import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { formatCurrency, formatDate, normalizeSearch } from '../../utils/formatters';
import {
  Search,
  ShoppingBag,
  Calendar,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';

interface OrdersViewProps {
  onOpenOrderDetail: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOpenOrderDetail }) => {
  const { orders, updateOrderStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');

  const filteredOrders = useMemo(() => {
    const norm = normalizeSearch(searchQuery);

    return orders
      .filter((o) => {
        // Status filter
        if (
          statusFilter === 'active' &&
          !(o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready' || o.status === 'draft')
        )
          return false;
        if (statusFilter === 'delivered' && o.status !== 'delivered') return false;
        if (statusFilter === 'cancelled' && o.status !== 'cancelled') return false;

        // Search
        if (norm) {
          const numNorm = normalizeSearch(o.orderNumber);
          const nameNorm = normalizeSearch(o.customerName);
          const bizNorm = normalizeSearch(o.customerBusiness);
          const quoteNorm = normalizeSearch(o.quotationNumber || '');

          const matches =
            numNorm.includes(norm) ||
            nameNorm.includes(norm) ||
            bizNorm.includes(norm) ||
            quoteNorm.includes(norm);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'amount_high') return b.grandTotal - a.grandTotal;
        if (sortBy === 'amount_low') return a.grandTotal - b.grandTotal;
        return 0;
      });
  }, [orders, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-4 pb-28">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Wholesale Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by order number (ORD-...) or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder-slate-400 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-lg cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status Filter & Sort Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'active' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            Active / Pending
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'delivered' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'cancelled' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-1.5 px-2.5 rounded-xl outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Highest Value</option>
            <option value="amount_low">Lowest Value</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No orders found"
          description={
            searchQuery
              ? `No orders match "${searchQuery}".`
              : 'Orders will appear here once quotations are accepted and converted.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col gap-3"
            >
              {/* Card Header (Clickable) */}
              <div
                onClick={() => onOpenOrderDetail(order)}
                className="flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {order.orderNumber}
                    </span>
                    <Badge variant="order" status={order.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-1.5 truncate">
                    {order.customerBusiness || order.customerName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>Contact: {order.customerName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Total
                  </span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    {formatCurrency(order.grandTotal)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Items Preview Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-600 py-1 border-t border-slate-100">
                {order.items.map((item, i) => (
                  <span
                    key={i}
                    className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md whitespace-nowrap truncate max-w-[140px]"
                  >
                    {item.fulfilledQuantity}/{item.quantity} {item.unit} {item.productName}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Mark Delivered
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium capitalize">
                    Order {order.status}
                  </span>
                )}

                <button
                  onClick={() => onOpenOrderDetail(order)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer ml-auto"
                >
                  Manage Order
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
