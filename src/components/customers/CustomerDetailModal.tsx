import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Phone,
  MessageCircle,
  MapPin,
  FileText,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Sparkles,
} from 'lucide-react';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEditCustomer: (customer: Customer) => void;
  onCreateQuoteForCustomer: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  onEditCustomer,
  onCreateQuoteForCustomer,
}) => {
  const { products, setCustomerPrice, quotations, orders } = useApp();

  // Add special price state
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [isAddingPrice, setIsAddingPrice] = useState<boolean>(false);

  if (!isOpen || !customer) return null;

  const activeProducts = products.filter((p) => !p.isArchived);

  // Stats for this customer
  const customerOrders = orders.filter((o) => o.customerId === customer.id);
  const customerQuotes = quotations.filter((q) => q.customerId === customer.id);
  const totalSpend = customerOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Products with special prices
  const specialPricedProducts = Object.entries(customer.customerPrices || {})
    .map(([prodId, price]) => {
      const prod = products.find((p) => p.id === prodId);
      return prod ? { product: prod, customPrice: price } : null;
    })
    .filter(Boolean) as { product: (typeof products)[0]; customPrice: number }[];

  const handleSaveCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !customPriceInput) return;
    const priceNum = parseFloat(customPriceInput);
    if (priceNum > 0) {
      setCustomerPrice(customer.id, selectedProductId, priceNum);
      setSelectedProductId('');
      setCustomPriceInput('');
      setIsAddingPrice(false);
    }
  };

  const handleRemoveCustomPrice = (prodId: string) => {
    setCustomerPrice(customer.id, prodId, 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.businessName || customer.name}
      subtitle="Wholesale Customer Profile & Pricing"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Contact Banner & Quick Communication Buttons */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-base font-bold text-slate-900">
              {customer.name}
              {customer.businessName && customer.businessName !== customer.name && (
                <span className="text-xs text-slate-500 font-normal ml-2">
                  ({customer.businessName})
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
              <span className="font-semibold">{customer.phone}</span>
              {customer.gstin && (
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  GST: {customer.gstin}
                </span>
              )}
            </div>
            {customer.address && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{customer.address}</span>
              </div>
            )}
          </div>

          {/* Call & WhatsApp Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${customer.phone.replace(/[^0-9+]/g, '')}`}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Call Customer"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${(customer.whatsapp || customer.phone).replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
              title="Open WhatsApp Chat"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              onClick={() => onEditCustomer(customer)}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Order Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-xl font-black text-slate-900 leading-tight mt-1 block">
              {formatCurrency(totalSpend)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {customerOrders.length} completed/active orders
            </span>
          </div>

          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Quotations Sent
            </span>
            <span className="text-xl font-black text-slate-900 leading-tight mt-1 block">
              {customerQuotes.length}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Previous wholesale quotes
            </span>
          </div>
        </div>

        {/* Section: Customer-Specific Negotiated Pricing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-600" />
                Customer-Specific Pricing
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Special negotiated rates automatically applied during quotation
              </p>
            </div>
            {!isAddingPrice && (
              <button
                type="button"
                onClick={() => setIsAddingPrice(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Set Special Price
              </button>
            )}
          </div>

          {/* Form to Add Special Price */}
          {isAddingPrice && (
            <form
              onSubmit={handleSaveCustomPrice}
              className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3 animate-in fade-in"
            >
              <div className="text-xs font-bold text-indigo-950">
                Add Special Rate for this Customer
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) {
                      setCustomPriceInput(String(prod.wholesalePrice || prod.sellingPrice));
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-semibold text-slate-800 outline-none"
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Wholesale: {formatCurrency(p.wholesalePrice || p.sellingPrice)})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Custom Rate (₹)"
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-900 outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingPrice(false)}
                    className="px-2.5 py-2 bg-white text-slate-600 text-xs font-medium rounded-xl border border-indigo-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List of Special Rates */}
          {specialPricedProducts.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center">
              No custom pricing set. Standard wholesale prices will be used.
            </div>
          ) : (
            <div className="space-y-2">
              {specialPricedProducts.map(({ product, customPrice }) => {
                const stdPrice = product.wholesalePrice || product.sellingPrice;
                const savings = stdPrice - customPrice;
                return (
                  <div
                    key={product.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Standard Wholesale: {formatCurrency(stdPrice)}/{product.unit}
                        {savings > 0 && (
                          <span className="text-emerald-700 font-bold ml-1.5">
                            (₹{savings} discount)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black text-indigo-700">
                        {formatCurrency(customPrice)}
                        <span className="text-[10px] text-slate-400 font-normal">/{product.unit}</span>
                      </span>
                      <button
                        onClick={() => handleRemoveCustomPrice(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove custom price"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Primary CTA: Create Quotation */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              onCreateQuoteForCustomer(customer);
            }}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Create New Quotation for {customer.businessName || customer.name}
          </button>
        </div>
      </div>
    </Modal>
  );
};
