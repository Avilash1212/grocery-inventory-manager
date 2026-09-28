import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { ArrowDownLeft, Sparkles, ChevronDown } from 'lucide-react';
import { formatQuantity } from '../../utils/formatters';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
}) => {
  const { products, adjustStock } = useApp();

  const activeProducts = products.filter((p) => !p.isArchived);

  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showOptional, setShowOptional] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedProduct) {
      setProductId(preselectedProduct.id);
    } else if (activeProducts.length > 0 && !productId) {
      setProductId(activeProducts[0].id);
    }
  }, [preselectedProduct, activeProducts, productId]);

  const selectedProduct = products.find((p) => p.id === productId);
  const numQty = parseFloat(quantity) || 0;
  const previousStock = selectedProduct?.currentStock ?? 0;
  const newStock = Math.round((previousStock + numQty) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || numQty <= 0) return;

    adjustStock(selectedProduct.id, numQty, supplier ? 'Supplier delivery' : 'Manual stock in', {
      supplier: supplier.trim() || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setQuantity('');
    setSupplier('');
    setPurchasePrice('');
    setReferenceNumber('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Stock (Stock In)"
      subtitle="Record received products into inventory"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Product *
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
            required
          >
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Current: {formatQuantity(p.currentStock, p.unit)})
              </option>
            ))}
          </select>
        </div>

        {/* Current & Calculated Stock Visualizer */}
        {selectedProduct && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Current Stock</span>
              <span className="text-base font-bold text-slate-800">
                {formatQuantity(previousProductStock(previousStock), selectedProduct.unit)}
              </span>
            </div>
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            <div className="text-right">
              <span className="text-slate-500 block">New Stock After Adding</span>
              <span className="text-base font-black text-emerald-700">
                {formatQuantity(newStock, selectedProduct.unit)}
              </span>
            </div>
          </div>
        )}

        {/* Quantity Received */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Quantity Received ({selectedProduct?.unit || 'Units'}) *
          </label>
          <input
            type="number"
            step={['Kg', 'Litre', 'Gram'].includes(selectedProduct?.unit || '') ? '0.01' : '1'}
            min="0.01"
            placeholder="e.g. 50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
            autoFocus
          />
        </div>

        {/* Optional Accordion */}
        <div className="border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <span>+ Add Supplier & Purchase Details (Optional)</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-180' : ''}`}
            />
          </button>

          {showOptional && (
            <div className="space-y-3 pt-2 animate-in fade-in">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Supplier / Mill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Balaji Grain Wholesalers"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Purchase Rate (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1050"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Invoice / Challan #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-892"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. New fresh crop delivery"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          )}
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
            className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Save Stock In
          </button>
        </div>
      </form>
    </Modal>
  );
};

function previousProductStock(val: number): number {
  return val;
}
