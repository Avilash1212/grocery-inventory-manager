import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { formatCurrency, normalizeSearch } from '../../utils/formatters';
import {
  Search,
  Plus,
  Users,
  Phone,
  FileText,
  Tag,
  ChevronRight,
  Archive,
} from 'lucide-react';

interface CustomersViewProps {
  onOpenAddCustomer: () => void;
  onOpenCustomerDetail: (customer: Customer) => void;
  onCreateQuoteForCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onOpenAddCustomer,
  onOpenCustomerDetail,
  onCreateQuoteForCustomer,
}) => {
  const { customers, archiveCustomer, orders, quotations } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(null);

  const activeCustomers = useMemo(() => {
    return customers.filter((c) => !c.isArchived);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const norm = normalizeSearch(searchQuery);
    if (!norm) return activeCustomers;

    return activeCustomers.filter((c) => {
      const nameNorm = normalizeSearch(c.name);
      const bizNorm = normalizeSearch(c.businessName);
      const phoneNorm = (c.phone || '').replace(/[^0-9]/g, '');
      const rawQuery = searchQuery.replace(/[^0-9]/g, '');

      return (
        nameNorm.includes(norm) ||
        bizNorm.includes(norm) ||
        (rawQuery && phoneNorm.includes(rawQuery))
      );
    });
  }, [activeCustomers, searchQuery]);

  return (
    <div className="space-y-4 pb-28">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Wholesale Customers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredCustomers.length} registered {filteredCustomers.length === 1 ? 'buyer' : 'buyers'}
          </p>
        </div>
        <button
          onClick={onOpenAddCustomer}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search customer by name, business or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder-slate-400 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No wholesale customers yet"
          description={
            searchQuery
              ? `No customers match "${searchQuery}".`
              : 'Add your first wholesale customer to start creating quotations and special pricing.'
          }
          actionLabel="Add Customer"
          onAction={onOpenAddCustomer}
        />
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => {
            const customerOrders = orders.filter((o) => o.customerId === customer.id && o.status !== 'cancelled');
            const totalSpent = customerOrders.reduce((sum, o) => sum + o.grandTotal, 0);
            const specialPriceCount = Object.keys(customer.customerPrices || {}).length;

            return (
              <div
                key={customer.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col gap-3"
              >
                {/* Main Card Header (Click to open details) */}
                <div
                  onClick={() => onOpenCustomerDetail(customer)}
                  className="flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-base shrink-0">
                      {customer.businessName ? customer.businessName.charAt(0) : customer.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {customer.businessName || customer.name}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                        Contact: {customer.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Orders Total */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Total Orders
                    </span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      {formatCurrency(totalSpent)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {customerOrders.length} orders
                    </span>
                  </div>
                </div>

                {/* Badges & Special Pricing Info */}
                {specialPriceCount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{specialPriceCount} special negotiated product rate{specialPriceCount > 1 ? 's' : ''} set</span>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                  <button
                    onClick={() => onCreateQuoteForCustomer(customer)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Create Quote
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenCustomerDetail(customer)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setCustomerToArchive(customer)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Archive Customer"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Archiving Customer */}
      {customerToArchive && (
        <ConfirmationModal
          isOpen={Boolean(customerToArchive)}
          onClose={() => setCustomerToArchive(null)}
          onConfirm={() => {
            if (customerToArchive) {
              archiveCustomer(customerToArchive.id);
              setCustomerToArchive(null);
            }
          }}
          title="Archive Customer?"
          message={`Are you sure you want to archive "${customerToArchive.businessName || customerToArchive.name}"? Historical quotations and orders will remain intact, but new quotations cannot be created.`}
          confirmLabel="Archive"
          cancelLabel="Keep Customer"
          isDanger
        />
      )}
    </div>
  );
};
