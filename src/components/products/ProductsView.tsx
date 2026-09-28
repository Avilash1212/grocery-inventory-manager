import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { formatCurrency, formatQuantity, normalizeSearch } from '../../utils/formatters';
import {
  Search,
  Plus,
  PlusCircle,
  MinusCircle,
  History,
  Edit2,
  Archive,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface ProductsViewProps {
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onOpenStockIn: (product: Product) => void;
  onOpenStockOut: (product: Product) => void;
  onOpenHistory: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenAddProduct,
  onOpenEditProduct,
  onOpenStockIn,
  onOpenStockOut,
  onOpenHistory,
}) => {
  const { products, archiveProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'price_asc' | 'price_desc'>('name');

  // Archive modal confirmation
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter & Search & Sort
  const filteredProducts = useMemo(() => {
    const norm = normalizeSearch(searchQuery);

    return products
      .filter((p) => !p.isArchived)
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

        // Stock status filter
        if (stockFilter === 'out_of_stock' && p.currentStock > 0) return false;
        if (stockFilter === 'low_stock' && (p.currentStock <= 0 || p.currentStock > p.minStock)) return false;
        if (stockFilter === 'in_stock' && p.currentStock <= p.minStock) return false;

        // Forgiving search across name, category, barcode
        if (norm) {
          const nameNorm = normalizeSearch(p.name);
          const catNorm = normalizeSearch(p.category || '');
          const barcodeNorm = (p.barcode || '').toLowerCase();
          const words = norm.split(' ').filter(Boolean);

          const matchesAllWords = words.every(
            (w) => nameNorm.includes(w) || catNorm.includes(w) || barcodeNorm.includes(w)
          );
          if (!matchesAllWords) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'stock_asc') return a.currentStock - b.currentStock;
        if (sortBy === 'stock_desc') return b.currentStock - a.currentStock;
        if (sortBy === 'price_asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price_desc') return b.sellingPrice - a.sellingPrice;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  return (
    <div className="space-y-4 pb-28">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Products & Stock</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
        <button
          onClick={onOpenAddProduct}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products by name (e.g. rice, fortune oil, atta)..."
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

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filter & Sort Controls */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        {/* Stock Status Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              stockFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStockFilter('low_stock')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              stockFilter === 'low_stock' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setStockFilter('out_of_stock')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              stockFilter === 'out_of_stock' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600'
            }`}
          >
            Out of Stock
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-1.5 px-2.5 rounded-xl outline-none cursor-pointer"
          >
            <option value="name">Name (A-Z)</option>
            <option value="stock_asc">Stock (Lowest First)</option>
            <option value="stock_desc">Stock (Highest First)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Filter className="w-8 h-8" />}
          title="No products found"
          description={
            searchQuery
              ? `No products match "${searchQuery}". Try a different word or clear filters.`
              : 'Add your first product to start tracking stock and sending quotations.'
          }
          actionLabel="Add Product"
          onAction={onOpenAddProduct}
        />
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3.5"
            >
              {/* Product Info Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    {product.image || '📦'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="font-medium">{product.category}</span>
                      {product.barcode && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            #{product.barcode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Badge */}
                <div className="shrink-0 text-right">
                  <Badge
                    variant="stock"
                    stockCount={product.currentStock}
                    minStock={product.minStock}
                  />
                  <div className="text-xs font-black text-slate-900 mt-1">
                    {formatQuantity(product.currentStock, product.unit)}
                  </div>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 bg-slate-50/80 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    Retail Price
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                  <span className="text-[10px] text-slate-400">/{product.unit}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                    Wholesale Price
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    {formatCurrency(product.wholesalePrice || product.sellingPrice)}
                  </span>
                  <span className="text-[10px] text-slate-400">/{product.unit}</span>
                </div>

                {product.buyingPrice && (
                  <div className="hidden sm:block">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                      Buying Cost
                    </span>
                    <span className="text-sm font-semibold text-slate-600">
                      {formatCurrency(product.buyingPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-1.5 flex-wrap">
                {/* Stock In & Stock Out Quick Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenStockIn(product)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Add Stock
                  </button>
                  <button
                    onClick={() => onOpenStockOut(product)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <MinusCircle className="w-3.5 h-3.5 text-slate-600" />
                    Remove
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => onOpenHistory(product.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Stock Movement History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenEditProduct(product)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Edit Product Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProductToArchive(product)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Archive / Deactivate Product"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Archiving Product */}
      {productToArchive && (
        <ConfirmationModal
          isOpen={Boolean(productToArchive)}
          onClose={() => setProductToArchive(null)}
          onConfirm={() => {
            if (productToArchive) {
              archiveProduct(productToArchive.id);
              setProductToArchive(null);
            }
          }}
          title="Deactivate Product?"
          message={`Are you sure you want to deactivate "${productToArchive.name}"? It will no longer be available for new quotations, but all historical quotations and orders will remain intact.`}
          confirmLabel="Deactivate"
          cancelLabel="Keep Product"
          isDanger
        />
      )}
    </div>
  );
};
