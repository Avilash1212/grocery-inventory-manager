import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  AlertTriangle,
  XCircle,
  FileText,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  UserPlus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Quotation, Product } from '../../types';

interface HomeDashboardProps {
  onOpenStockIn: (prefillProduct?: Product) => void;
  onOpenStockOut: (prefillProduct?: Product) => void;
  onOpenCreateQuote: () => void;
  onOpenAddCustomer: () => void;
  onViewQuotation: (quote: Quotation) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenStockIn,
  onOpenStockOut,
  onOpenCreateQuote,
  onOpenAddCustomer,
  onViewQuotation,
}) => {
  const { products, quotations, orders, settings, setActiveTab } = useApp();

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Metrics
  const lowStockProducts = products.filter(
    (p) => !p.isArchived && p.currentStock > 0 && p.currentStock <= p.minStock
  );
  const outOfStockProducts = products.filter(
    (p) => !p.isArchived && p.currentStock <= 0
  );
  const pendingQuotes = quotations.filter(
    (q) => q.status === 'draft' || q.status === 'sent'
  );

  // Today's Sales calculation from orders
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(
    (o) => o.createdAt.startsWith(todayDateStr) && o.status !== 'cancelled'
  );
  const todaySales = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  // All time sales (fallback demonstration if today's orders are 0)
  const totalCompletedSales = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const displaySales = todaySales > 0 ? todaySales : totalCompletedSales;
  const displaySalesLabel = todaySales > 0 ? "Today's Sales" : "Recent Sales";

  return (
    <div className="space-y-6 pb-24">
      {/* Friendly Greeting Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Simple Kirana Manager
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {greeting}, {settings.ownerName ? settings.ownerName.split(' ')[0] : 'Partner'} 👋
          </h2>
          <p className="text-emerald-100 text-sm mt-1 font-medium">
            Here's what needs your attention today.
          </p>
        </div>
      </div>

      {/* Four Simple Attention Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Low Stock Card */}
        <button
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-400 transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-amber-800 uppercase">
              Low Stock
            </span>
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">products</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-2 flex items-center gap-1">
            Tap to view <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Out of Stock Card */}
        <button
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs hover:border-rose-400 transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-rose-800 uppercase">
              Out of Stock
            </span>
            <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {outOfStockProducts.length}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">products</span>
          </div>
          <div className="text-[11px] text-rose-700 font-semibold mt-2 flex items-center gap-1">
            Needs restock <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Pending Quotes Card */}
        <button
          onClick={() => setActiveTab('quotes')}
          className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs hover:border-blue-400 transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-blue-800 uppercase">
              Pending Quotes
            </span>
            <div className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {pendingQuotes.length}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">waiting</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-2 flex items-center gap-1">
            Follow up <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Today's Sales Card */}
        <button
          onClick={() => setActiveTab('orders')}
          className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs hover:border-emerald-400 transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
              {displaySalesLabel}
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-2xl font-black text-slate-900 leading-none truncate block">
              {formatCurrency(displaySales)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              {todayOrders.length > 0 ? `${todayOrders.length} orders today` : `${orders.length} total orders`}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            View orders <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Quick Actions (Large Buttons) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Add Stock */}
          <button
            onClick={() => onOpenStockIn()}
            className="flex items-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold leading-tight">Add Stock</div>
              <div className="text-[11px] text-emerald-100 mt-0.5 leading-none">Stock In / Received</div>
            </div>
          </button>

          {/* Remove Stock */}
          <button
            onClick={() => onOpenStockOut()}
            className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white rounded-2xl shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
              <MinusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold leading-tight">Remove Stock</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-none">Damaged, Sale, Loss</div>
            </div>
          </button>

          {/* Create Quote */}
          <button
            onClick={onOpenCreateQuote}
            className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold leading-tight">Create Quote</div>
              <div className="text-[11px] text-blue-100 mt-0.5 leading-none">For Wholesale Customer</div>
            </div>
          </button>

          {/* Add Customer */}
          <button
            onClick={onOpenAddCustomer}
            className="flex items-center gap-3 p-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-2xl shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold leading-tight">Add Customer</div>
              <div className="text-[11px] text-indigo-100 mt-0.5 leading-none">New Wholesale Buyer</div>
            </div>
          </button>
        </div>
      </div>

      {/* Needs Attention Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Needs Attention
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Actionable items</span>
        </div>

        <div className="space-y-2.5">
          {/* Low Stock Items Alert */}
          {lowStockProducts.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-2xl p-2 bg-amber-100 rounded-xl shrink-0">
                  {product.image || '🌾'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {product.name} is running low
                  </h4>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">
                    Only <span className="font-bold">{product.currentStock} {product.unit}s</span> remaining (Min: {product.minStock})
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenStockIn(product)}
                className="shrink-0 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Restock
              </button>
            </div>
          ))}

          {/* Out of Stock Alert */}
          {outOfStockProducts.slice(0, 2).map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-2xl p-2 bg-rose-100 rounded-xl shrink-0">
                  {product.image || '🧊'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {product.name} is Out of Stock
                  </h4>
                  <p className="text-xs text-rose-700 font-medium mt-0.5">
                    Cannot fulfill new customer orders!
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenStockIn(product)}
                className="shrink-0 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Add Stock
              </button>
            </div>
          ))}

          {/* Pending Quotations Alert */}
          {pendingQuotes.slice(0, 2).map((quote) => (
            <div
              key={quote.id}
              className="flex items-center justify-between gap-3 p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    Quotation {quote.quoteNumber} awaiting response
                  </h4>
                  <p className="text-xs text-blue-800 font-medium mt-0.5 truncate">
                    {quote.customerBusiness || quote.customerName} • {formatCurrency(quote.grandTotal)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onViewQuotation(quote)}
                className="shrink-0 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                View Quote
              </button>
            </div>
          ))}

          {lowStockProducts.length === 0 &&
            outOfStockProducts.length === 0 &&
            pendingQuotes.length === 0 && (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <p className="text-emerald-800 font-semibold text-sm">
                  ✨ All caught up! Stock levels are healthy and all quotations are handled.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
