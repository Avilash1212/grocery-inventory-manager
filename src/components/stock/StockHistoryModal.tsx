import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { formatDateTime, formatQuantity } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, History, Undo2 } from 'lucide-react';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterProductId?: string;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  onClose,
  filterProductId,
}) => {
  const { stockMovements, undoStockMovement, products } = useApp();
  const [selectedReason, setSelectedReason] = useState<string>('all');

  const filtered = stockMovements.filter((m) => {
    if (filterProductId && m.productId !== filterProductId) return false;
    if (selectedReason !== 'all' && m.reason !== selectedReason) return false;
    return true;
  });

  const targetProduct = filterProductId ? products.find((p) => p.id === filterProductId) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={targetProduct ? `Stock History: ${targetProduct.name}` : 'Stock Movement History'}
      subtitle="Complete audit log of all stock received, sold, and adjusted"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'Supplier delivery', 'Order fulfillment', 'Sale', 'Damaged', 'Adjustment'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedReason(r)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedReason === r
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'All Movements' : r}
            </button>
          ))}
        </div>

        {/* History List */}
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-sm">
            <History className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            No stock movements recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((mov, idx) => {
              const isPositive = mov.quantityDelta > 0;
              return (
                <div
                  key={mov.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {mov.productName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {mov.reason}
                        </span>
                        <span>•</span>
                        <span>{formatDateTime(mov.date)}</span>
                      </div>
                      {mov.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-1 truncate">
                          "{mov.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-black ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatQuantity(mov.quantityDelta, mov.unit)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {mov.previousStock} → {mov.newStock} {mov.unit}
                    </div>

                    {/* Quick Undo button on the most recent 3 entries */}
                    {idx < 3 && (
                      <button
                        onClick={() => undoStockMovement(mov.id)}
                        className="inline-flex items-center gap-1 text-[10px] text-amber-700 hover:text-amber-900 font-bold mt-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                        title="Undo this specific movement"
                      >
                        <Undo2 className="w-3 h-3" />
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
