import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Quotation } from '../../types';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { formatCurrency, formatDate, normalizeSearch } from '../../utils/formatters';
import { generateQuotationPdf } from '../../utils/pdfGenerator';
import {
  Search,
  Plus,
  FileText,
  MessageCircle,
  Download,
  Calendar,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';

interface QuotesViewProps {
  onOpenCreateQuote: () => void;
  onOpenQuoteDetail: (quote: Quotation) => void;
  onOpenWhatsAppShare: (quote: Quotation) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  onOpenCreateQuote,
  onOpenQuoteDetail,
  onOpenWhatsAppShare,
}) => {
  const { quotations, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'converted' | 'accepted' | 'other'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');

  const filteredQuotes = useMemo(() => {
    const norm = normalizeSearch(searchQuery);

    return quotations
      .filter((q) => {
        // Status filter
        if (statusFilter === 'pending' && !(q.status === 'draft' || q.status === 'sent' || q.status === 'viewed')) return false;
        if (statusFilter === 'converted' && q.status !== 'converted') return false;
        if (statusFilter === 'accepted' && q.status !== 'accepted') return false;
        if (statusFilter === 'other' && (q.status === 'draft' || q.status === 'sent' || q.status === 'converted' || q.status === 'accepted')) return false;

        // Search query across quoteNumber, customerName, customerBusiness
        if (norm) {
          const numNorm = normalizeSearch(q.quoteNumber);
          const nameNorm = normalizeSearch(q.customerName);
          const bizNorm = normalizeSearch(q.customerBusiness);
          const phoneNorm = (q.customerPhone || '').replace(/[^0-9]/g, '');
          const raw = searchQuery.replace(/[^0-9]/g, '');

          const matches =
            numNorm.includes(norm) ||
            nameNorm.includes(norm) ||
            bizNorm.includes(norm) ||
            (raw && phoneNorm.includes(raw));
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
  }, [quotations, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-4 pb-28">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Quotations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'} listed
          </p>
        </div>
        <button
          onClick={onOpenCreateQuote}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Quote
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by quote number (QT-...) or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder-slate-400 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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

      {/* Filter Tabs & Sort Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            All Quotes
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'pending' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('converted')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'converted' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-600'
            }`}
          >
            Converted
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'accepted' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600'
            }`}
          >
            Accepted
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-1.5 px-2.5 rounded-xl outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Highest Amount</option>
            <option value="amount_low">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Quotation List */}
      {filteredQuotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No quotations found"
          description={
            searchQuery
              ? `No quotes match "${searchQuery}".`
              : 'Create a quotation when a customer asks for a price.'
          }
          actionLabel="Create Quote"
          onAction={onOpenCreateQuote}
        />
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col gap-3"
            >
              {/* Header Row (Clickable to view details) */}
              <div
                onClick={() => onOpenQuoteDetail(quote)}
                className="flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {quote.quoteNumber}
                    </span>
                    <Badge variant="quote" status={quote.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-1.5 truncate">
                    {quote.customerBusiness || quote.customerName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>Contact: {quote.customerName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(quote.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Total
                  </span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">
                    {formatCurrency(quote.grandTotal)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {quote.items.length} {quote.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Items Preview Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-600 py-1 border-t border-slate-100">
                {quote.items.slice(0, 3).map((item, i) => (
                  <span
                    key={i}
                    className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md whitespace-nowrap truncate max-w-[140px]"
                  >
                    {item.quantity} {item.unit} {item.productName}
                  </span>
                ))}
                {quote.items.length > 3 && (
                  <span className="text-slate-400 font-medium whitespace-nowrap">
                    +{quote.items.length - 3} more
                  </span>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                <button
                  onClick={() => onOpenWhatsAppShare(quote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => generateQuotationPdf(quote, settings)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenQuoteDetail(quote)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    View
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
