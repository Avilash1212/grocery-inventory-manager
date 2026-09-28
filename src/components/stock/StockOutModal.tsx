import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StockMovementReason } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle, ArrowUpRight, Check } from 'lucide-react';
import { formatQuantity } from '../../utils/formatters';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product;
}

export const StockOutModal: React.FC<StockOutModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
}) => {
  const { products, adjustStock } = useApp();

  const activeProducts = products.filter((p) => !p.isArchived);

  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<StockMovementReason>('Sale');
  const [notes, setNotes] = useState<string>('');
  const [showNegativeWarning, setShowNegativeWarning] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedProduct) {
      setProductId(preselectedProduct.id);
    } else if (activeProducts.length > 0 && !productId) {
      setProductId(activeProducts[0].id);
    }
  }, [preselectedProduct, activeProducts, productId]);

  const selectedProduct = products.find((p) => p.id === productId);
  const numQty = parseFloat(quantity) || 0;
  const currentStock = selectedProduct?.currentStock ?? 0;
  const resultingStock = Math.round((currentStock - numQty) * 100) / 100;

  const reasons: { id: StockMovementReason; label: string; icon: string }[] = [
    { id: 'Sale', label: 'Cash / Retail Sale', icon: '💰' },
    { id: 'Damaged', label: 'Damaged Goods', icon: '📦' },
    { id: 'Expired', label: 'Expired Product', icon: '⏳' },
    { id: 'Personal use', label: 'Personal / Home Use', icon: '🏠' },
    { id: 'Adjustment', label: 'Stock Audit / Adjustment', icon: '📝' },
    { id: 'Other', label: 'Other Reason', icon: '❓' },
  ];

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || numQty <= 0) return;

    // Negative stock check
    if (numQty > currentStock && !showNegativeWarning) {
      setShowNegativeWarning(true);
      return;
    }

    executeStockOut();
  };

  const executeStockOut = () => {
    if (!selectedProduct || numQty <= 0) return;

    adjustStock(selectedProduct.id, -numQty, reason, {
      notes: notes.trim() || undefined,
    });

    setQuantity('');
    setNotes('');
    setShowNegativeWarning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Stock (Stock Out)"
      subtitle="Deduct products from inventory"
    >
      <form onSubmit={handleValidateAndSubmit} className="space-y-4">
        {/* Product Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Product *
          </label>
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setShowNegativeWarning(false);
            }}
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition-all cursor-pointer"
            required
          >
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Current: {formatQuantity(p.currentStock, p.unit)})
              </option>
            ))}
          </select>
        </div>

        {/* Current Available Stock Indicator */}
        {selectedProduct && (
          <div className="p-3.5 bg-slate-100 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Available in Store</span>
              <span className={`text-base font-bold ${currentStock <= 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {formatQuantity(currentStock, selectedProduct.unit)}
              </span>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-600" />
            <div className="text-right">
              <span className="text-slate-500 block">Remaining After Deduction</span>
              <span
                className={`text-base font-bold ${
                  resultingStock < 0 ? 'text-rose-600 font-black' : 'text-slate-800'
                }`}
              >
                {formatQuantity(resultingStock, selectedProduct.unit)}
              </span>
            </div>
          </div>
        )}

        {/* Quantity to remove */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Quantity to Remove ({selectedProduct?.unit || 'Units'}) *
          </label>
          <input
            type="number"
            step={['Kg', 'Litre', 'Gram'].includes(selectedProduct?.unit || '') ? '0.01' : '1'}
            min="0.01"
            placeholder="e.g. 10"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setShowNegativeWarning(false);
            }}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none"
            required
            autoFocus
          />
        </div>

        {/* Negative Stock Warning Dialog Box */}
        {showNegativeWarning && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  Only {formatQuantity(currentStock, selectedProduct?.unit || '')} available!
                </h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  Removing <span className="font-bold">{numQty} {selectedProduct?.unit}</span> will cause your inventory to become negative (<span className="font-bold">{resultingStock} {selectedProduct?.unit}</span>).
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNegativeWarning(false);
                      setQuantity(String(Math.max(0, currentStock)));
                    }}
                    className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 cursor-pointer"
                  >
                    Adjust to {currentStock}
                  </button>
                  <button
                    type="button"
                    onClick={executeStockOut}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Continue with {numQty} (Negative Stock)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reason Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Removing Stock *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReason(r.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  reason === r.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{r.icon}</span>
                <span className="truncate">{r.label}</span>
                {reason === r.id && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Optional Note
          </label>
          <input
            type="text"
            placeholder="e.g. 2 bags torn during rain, written off"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={numQty <= 0}
            className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            Confirm Removal
          </button>
        </div>
      </form>
    </Modal>
  );
};
