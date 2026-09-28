import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductUnit } from '../../types';
import { Modal } from '../common/Modal';
import { ChevronDown, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const UNITS: ProductUnit[] = [
  'Bag',
  'Kg',
  'Packet',
  'Bottle',
  'Box',
  'Piece',
  'Litre',
  'Gram',
  'Dozen',
];

const CATEGORIES = [
  'Grains & Rice',
  'Edible Oils',
  'Flour & Atta',
  'Spices & Essentials',
  'Dals & Pulses',
  'Sugar & Jaggery',
  'Beverages',
  'Packaged Snacks',
  'Cleaning & Household',
  'Dairy & Bakery',
  'Other Provisions',
];

const EMOJI_PRESETS = ['🌾', '🌻', '🧂', '☕', '🧊', '🥣', '🍜', '🍪', '🧼', '🥛', '🥫', '📦'];

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, checkDuplicateProduct } = useApp();

  // 4 Required Fields
  const [name, setName] = useState<string>('');
  const [unit, setUnit] = useState<ProductUnit>('Bag');
  const [currentStock, setCurrentStock] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');

  // Optional Fields
  const [wholesalePrice, setWholesalePrice] = useState<string>('');
  const [buyingPrice, setBuyingPrice] = useState<string>('');
  const [minStock, setMinStock] = useState<string>('10');
  const [category, setCategory] = useState<string>('Grains & Rice');
  const [barcode, setBarcode] = useState<string>('');
  const [image, setImage] = useState<string>('🌾');
  const [showOptional, setShowOptional] = useState<boolean>(false);

  // Duplicate warning state
  const [duplicateMatch, setDuplicateMatch] = useState<Product | null>(null);
  const [ignoreDuplicateWarning, setIgnoreDuplicateWarning] = useState<boolean>(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setUnit(productToEdit.unit);
      setCurrentStock(String(productToEdit.currentStock));
      setSellingPrice(String(productToEdit.sellingPrice));
      setWholesalePrice(productToEdit.wholesalePrice ? String(productToEdit.wholesalePrice) : '');
      setBuyingPrice(productToEdit.buyingPrice ? String(productToEdit.buyingPrice) : '');
      setMinStock(String(productToEdit.minStock));
      setCategory(productToEdit.category || 'Grains & Rice');
      setBarcode(productToEdit.barcode || '');
      setImage(productToEdit.image || '🌾');
      setShowOptional(true);
      setDuplicateMatch(null);
    } else {
      setName('');
      setUnit('Bag');
      setCurrentStock('');
      setSellingPrice('');
      setWholesalePrice('');
      setBuyingPrice('');
      setMinStock('10');
      setCategory('Grains & Rice');
      setBarcode('');
      setImage('🌾');
      setShowOptional(false);
      setDuplicateMatch(null);
      setIgnoreDuplicateWarning(false);
    }
  }, [productToEdit, isOpen]);

  // Handle live duplicate checking
  const handleNameChange = (val: string) => {
    setName(val);
    setIgnoreDuplicateWarning(false);
    if (!productToEdit && val.trim().length >= 3) {
      const match = checkDuplicateProduct(val);
      setDuplicateMatch(match || null);
    } else {
      setDuplicateMatch(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sellingPrice) return;

    if (duplicateMatch && !ignoreDuplicateWarning && !productToEdit) {
      // User must acknowledge duplicate warning
      return;
    }

    const parsedStock = parseFloat(currentStock) || 0;
    const parsedSellingPrice = parseFloat(sellingPrice) || 0;
    const parsedWholesalePrice = wholesalePrice ? parseFloat(wholesalePrice) : parsedSellingPrice;
    const parsedBuyingPrice = buyingPrice ? parseFloat(buyingPrice) : undefined;
    const parsedMinStock = parseFloat(minStock) || 5;

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name: name.trim(),
        unit,
        currentStock: parsedStock,
        sellingPrice: parsedSellingPrice,
        wholesalePrice: parsedWholesalePrice,
        buyingPrice: parsedBuyingPrice,
        minStock: parsedMinStock,
        category,
        barcode: barcode.trim() || undefined,
        image,
      });
    } else {
      addProduct({
        name: name.trim(),
        unit,
        currentStock: parsedStock,
        sellingPrice: parsedSellingPrice,
        wholesalePrice: parsedWholesalePrice,
        buyingPrice: parsedBuyingPrice,
        minStock: parsedMinStock,
        category,
        barcode: barcode.trim() || undefined,
        image,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product' : 'Add New Product'}
      subtitle={productToEdit ? 'Update product details' : 'Fill just 4 quick details to start tracking'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Duplicate Product Warning Banner */}
        {duplicateMatch && !ignoreDuplicateWarning && !productToEdit && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  A similar product already exists!
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  We found <span className="font-bold">{duplicateMatch.name}</span> in your inventory ({duplicateMatch.currentStock} {duplicateMatch.unit}s in stock at {formatCurrency(duplicateMatch.sellingPrice)}).
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100 cursor-pointer"
                  >
                    Use Existing Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setIgnoreDuplicateWarning(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Create Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. Product Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Product Name *
          </label>
          <input
            type="text"
            placeholder="e.g. India Gate Basmati Rice 5kg"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
            autoFocus
          />
        </div>

        {/* 2. Unit Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Unit of Measurement *
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  unit === u
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Current Stock & 4. Selling Price Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Stock ({unit}) *
            </label>
            <input
              type="number"
              step={['Kg', 'Litre', 'Gram'].includes(unit) ? '0.01' : '1'}
              min="0"
              placeholder="e.g. 20"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Retail Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 250"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Optional Expandable Fields */}
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center justify-between w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <span>+ Optional Wholesale, Category & Min Stock Details</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-180' : ''}`}
            />
          </button>

          {showOptional && (
            <div className="space-y-3.5 pt-3 animate-in fade-in">
              {/* Wholesale Price & Min Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Wholesale Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 220"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Default rate for wholesale quotes
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Low Stock Alert Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Warn when stock drops to or below
                  </span>
                </div>
              </div>

              {/* Buying Price & Barcode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Purchase / Buying Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 195"
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Barcode / Item Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8901234001"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Icon / Emoji Preset */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Select Product Icon
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setImage(emoji)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        image === emoji
                          ? 'border-emerald-600 bg-emerald-50 scale-110 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !sellingPrice || (Boolean(duplicateMatch) && !ignoreDuplicateWarning && !productToEdit)}
            className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {productToEdit ? 'Save Changes' : 'Save Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
