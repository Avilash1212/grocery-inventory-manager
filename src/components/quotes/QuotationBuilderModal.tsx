import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, Product, QuoteItem, Quotation } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import {
  Trash2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Tag,
  Check,
} from 'lucide-react';

interface QuotationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomer?: Customer | null;
  onQuotationCreated?: (quote: Quotation) => void;
}

export const QuotationBuilderModal: React.FC<QuotationBuilderModalProps> = ({
  isOpen,
  onClose,
  preselectedCustomer,
  onQuotationCreated,
}) => {
  const { customers, products, createQuotation, settings } = useApp();

  const activeCustomers = customers.filter((c) => !c.isArchived);
  const activeProducts = products.filter((p) => !p.isArchived);

  // Wizard Step: 1: Customer, 2: Products & Quantities, 3: Pricing & Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected Customer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Quote Line Items
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  // Extra charges & notes
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [shippingCharge, setShippingCharge] = useState<string>('0');
  const [applyTax, setApplyTax] = useState<boolean>(settings.enableTax);
  const [taxRate, setTaxRate] = useState<string>(String(settings.defaultTaxRate || 5));
  const [notes, setNotes] = useState<string>(settings.defaultNotes || '');
  const [validityDays, setValidityDays] = useState<number>(settings.defaultQuoteValidityDays || 7);

  // Stock Warning State during adding
  const [stockWarning, setStockWarning] = useState<{
    productId: string;
    productName: string;
    availableStock: number;
    requestedQty: number;
    unit: string;
  } | null>(null);

  // Product search in step 2
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
      setStep(2);
    } else if (activeCustomers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(activeCustomers[0]);
    }
  }, [preselectedCustomer, activeCustomers, selectedCustomer, isOpen]);

  // Handle adding an item to quote
  const handleAddProduct = (product: Product) => {
    // Check if already in quote
    const existing = quoteItems.find((i) => i.productId === product.id);
    if (existing) {
      handleUpdateQuantity(product.id, existing.quantity + 1);
      return;
    }

    // Determine price: check customer-specific price first, then wholesale price, then selling price
    const customRate = selectedCustomer?.customerPrices?.[product.id];
    const stdPrice = product.wholesalePrice || product.sellingPrice;
    const finalUnitPrice = customRate !== undefined ? customRate : stdPrice;

    const newItem: QuoteItem = {
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      quantity: 1,
      unitPrice: finalUnitPrice,
      standardPrice: stdPrice,
      isPriceOverridden: false,
      discount: 0,
      total: finalUnitPrice,
    };

    setQuoteItems((prev) => [...prev, newItem]);
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod && newQty > prod.currentStock) {
      setStockWarning({
        productId,
        productName: prod.name,
        availableStock: prod.currentStock,
        requestedQty: newQty,
        unit: prod.unit,
      });
    }

    setQuoteItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        return {
          ...item,
          quantity: newQty,
          total: Math.round(newQty * item.unitPrice * 100) / 100,
        };
      })
    );
  };

  const handleUpdateUnitPrice = (productId: string, newPrice: number) => {
    setQuoteItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        return {
          ...item,
          unitPrice: newPrice,
          isPriceOverridden: true,
          total: Math.round(item.quantity * newPrice * 100) / 100,
        };
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setQuoteItems((prev) => prev.filter((i) => i.productId !== productId));
    if (stockWarning?.productId === productId) setStockWarning(null);
  };

  // Calculation summaries
  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);

  const numDiscountVal = parseFloat(discountValue) || 0;
  const discountTotal =
    discountType === 'percent'
      ? Math.round(((subtotal * numDiscountVal) / 100) * 100) / 100
      : numDiscountVal;

  const afterDiscount = Math.max(0, subtotal - discountTotal);
  const numShipping = parseFloat(shippingCharge) || 0;

  const numTaxRate = parseFloat(taxRate) || 0;
  const taxTotal = applyTax ? Math.round(((afterDiscount * numTaxRate) / 100) * 100) / 100 : 0;

  const grandTotal = Math.round((afterDiscount + numShipping + taxTotal) * 100) / 100;

  // Final Submit
  const handleCreateQuote = () => {
    if (!selectedCustomer || quoteItems.length === 0) return;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + (validityDays || 7));

    const newQuote = createQuotation({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerBusiness: selectedCustomer.businessName,
      customerPhone: selectedCustomer.phone,
      customerAddress: selectedCustomer.address,
      customerGstin: selectedCustomer.gstin,
      items: quoteItems,
      subtotal,
      discountTotal,
      taxTotal,
      shippingCharge: numShipping,
      grandTotal,
      notes: notes.trim() || undefined,
      validUntil: validUntilDate.toISOString().slice(0, 10),
      status: 'sent',
    });

    onClose();
    if (onQuotationCreated) {
      onQuotationCreated(newQuote);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Wholesale Quotation"
      subtitle={`Step ${step} of 3 • Fast & effortless for kirana owners`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 1
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Customer
          </button>
          <button
            onClick={() => selectedCustomer && setStep(2)}
            disabled={!selectedCustomer}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 2
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 disabled:opacity-40'
            }`}
          >
            2. Products & Qty
          </button>
          <button
            onClick={() => quoteItems.length > 0 && setStep(3)}
            disabled={quoteItems.length === 0}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 3
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 disabled:opacity-40'
            }`}
          >
            3. Review & Pricing
          </button>
        </div>

        {/* STEP 1: Select Customer */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900">
              Who is this quotation for?
            </h3>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {activeCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const specialRatesCount = Object.keys(cust.customerPrices || {}).length;

                return (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setStep(2);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {cust.businessName ? cust.businessName.charAt(0) : cust.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {cust.businessName || cust.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {cust.name} • {cust.phone}
                        </p>
                        {specialRatesCount > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-semibold mt-1">
                            <Tag className="w-3 h-3" />
                            {specialRatesCount} custom negotiated rate{specialRatesCount > 1 ? 's' : ''} set
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2 text-slate-400 group-hover:text-blue-600 shrink-0">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCustomer && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed to Add Products for {selectedCustomer.businessName || selectedCustomer.name}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Add Products & Enter Quantities */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            {/* Customer mini banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-blue-700 block text-[10px] uppercase font-bold">
                  Quotation For:
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedCustomer?.businessName || selectedCustomer?.name}
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Stock Validation Warning Notice */}
            {stockWarning && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs space-y-2 animate-in zoom-in-95">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">
                      Only {formatQuantity(stockWarning.availableStock, stockWarning.unit)} currently in stock!
                    </span>
                    <p className="text-amber-800 mt-0.5">
                      You entered {stockWarning.requestedQty} {stockWarning.unit}s for {stockWarning.productName}.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateQuantity(stockWarning.productId, stockWarning.availableStock);
                      setStockWarning(null);
                    }}
                    className="px-3 py-1 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg hover:bg-amber-100 cursor-pointer"
                  >
                    Reduce to {stockWarning.availableStock}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockWarning(null)}
                    className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 cursor-pointer"
                  >
                    Create Backorder for Remaining
                  </button>
                </div>
              </div>
            )}

            {/* Selected Items List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Selected Items ({quoteItems.length})
                </label>
                {quoteItems.length > 0 && (
                  <span className="text-xs font-bold text-emerald-700">
                    Subtotal: {formatCurrency(subtotal)}
                  </span>
                )}
              </div>

              {quoteItems.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  No items selected yet. Tap products from below to add to this quotation.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {quoteItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const isCustomPrice =
                      selectedCustomer?.customerPrices?.[item.productId] !== undefined &&
                      !item.isPriceOverridden;

                    return (
                      <div
                        key={item.productId}
                        className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {item.productName}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span>
                                Available: {prod ? formatQuantity(prod.currentStock, prod.unit) : '—'}
                              </span>
                              {isCustomPrice && (
                                <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                  Special Rate
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity and Price Row */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 font-medium">Qty:</span>
                            <input
                              type="number"
                              step={['Kg', 'Litre', 'Gram'].includes(item.unit) ? '0.01' : '1'}
                              min="0.01"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.productId,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 text-center outline-none"
                            />
                            <span className="text-xs text-slate-600">{item.unit}</span>
                          </div>

                          {/* Unit Price with optional manual override */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 font-medium">@ ₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateUnitPrice(
                                  item.productId,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 text-right outline-none"
                            />
                          </div>

                          {/* Line Total */}
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-slate-900">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Catalog Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Tap to Add Products:
              </label>
              <input
                type="text"
                placeholder="Search products to add..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {activeProducts
                  .filter((p) =>
                    productSearch ? p.name.toLowerCase().includes(productSearch.toLowerCase()) : true
                  )
                  .map((prod) => {
                    const customRate = selectedCustomer?.customerPrices?.[prod.id];
                    const activePrice = customRate !== undefined ? customRate : (prod.wholesalePrice || prod.sellingPrice);
                    const isAdded = quoteItems.some((i) => i.productId === prod.id);

                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleAddProduct(prod)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isAdded
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Available: {formatQuantity(prod.currentStock, prod.unit)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-slate-800">
                            {formatCurrency(activePrice)}
                          </div>
                          {customRate !== undefined && (
                            <span className="text-[10px] text-indigo-700 font-bold">Special</span>
                          )}
                          {isAdded && (
                            <div className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold mt-0.5">
                              <Check className="w-3 h-3" /> Added
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={quoteItems.length === 0}
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Review Pricing & Discounts ({quoteItems.length} items)
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review Pricing, Discounts, Tax & Notes */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            {/* Calculation Summary Breakdown Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Items Subtotal:</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount Row */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Discount:</span>
                  <button
                    type="button"
                    onClick={() => setDiscountType(discountType === 'flat' ? 'percent' : 'flat')}
                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-bold cursor-pointer"
                  >
                    {discountType === 'flat' ? '₹ Flat' : '% Off'}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-right outline-none"
                  />
                  {discountTotal > 0 && (
                    <span className="text-rose-600 font-bold ml-1">
                      - {formatCurrency(discountTotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery / Shipping Charge */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-700">Delivery / Shipping Charge:</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    value={shippingCharge}
                    onChange={(e) => setShippingCharge(e.target.value)}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-right outline-none"
                  />
                </div>
              </div>

              {/* Tax Toggle */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700">Include Tax (GST):</span>
                </label>
                {applyTax && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-right outline-none"
                    />
                    <span className="text-slate-500">% = {formatCurrency(taxTotal)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total Highlight */}
              <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">GRAND TOTAL:</span>
                <span className="text-2xl font-black text-emerald-700">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Validity & Notes */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Validity (Days)
                  </label>
                  <select
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days (Recommended)</option>
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Terms & Note for Customer
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Prices valid for 7 days. Delivery within Chennai included."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Navigation & Final Create Action */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Items
              </button>
              <button
                type="button"
                onClick={handleCreateQuote}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Quotation ({formatCurrency(grandTotal)})
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
