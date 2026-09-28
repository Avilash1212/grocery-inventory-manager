import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { formatCurrency, formatDate, formatQuantity } from '../../utils/formatters';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { updateOrderStatus, updateOrderFulfillment, settings } = useApp();

  // Partial fulfillment editing
  const [isEditingFulfillment, setIsEditingFulfillment] = useState(false);
  const [fulfillmentMap, setFulfillmentMap] = useState<Record<string, number>>({});

  // Cancel Order Modal State
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [returnInventoryOnCancel, setReturnInventoryOnCancel] = useState(true);

  if (!isOpen || !order) return null;

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const statuses: OrderStatus[] = ['confirmed', 'preparing', 'ready', 'delivered'];

  const handleStartFulfillmentEdit = () => {
    const initialMap: Record<string, number> = {};
    order.items.forEach((item) => {
      initialMap[item.productId] = item.fulfilledQuantity;
    });
    setFulfillmentMap(initialMap);
    setIsEditingFulfillment(true);
  };

  const handleSaveFulfillment = () => {
    updateOrderFulfillment(order.id, fulfillmentMap);
    setIsEditingFulfillment(false);
  };

  const handleConfirmCancel = () => {
    updateOrderStatus(order.id, 'cancelled', returnInventoryOnCancel);
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.orderNumber}`}
      subtitle={`Placed on ${formatDate(order.createdAt)}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Status Header Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="order" status={order.status} />
            {order.stockDeducted && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Inventory Deducted
              </span>
            )}
          </div>

          {order.quotationNumber && (
            <div className="text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              From Quote: {order.quotationNumber}
            </div>
          )}
        </div>

        {/* Customer Info Box */}
        <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs space-y-1">
          <span className="text-indigo-800 font-bold text-[10px] uppercase tracking-wider block">
            Customer Information
          </span>
          <div className="text-sm font-black text-slate-900">
            {order.customerBusiness || order.customerName}
          </div>
          <div className="text-slate-600 flex items-center gap-2">
            <span>Contact: {order.customerName}</span>
            <span>•</span>
            <span className="font-semibold">{order.customerPhone}</span>
          </div>
          {order.customerAddress && (
            <div className="text-slate-500 text-[11px] mt-0.5">{order.customerAddress}</div>
          )}
        </div>

        {/* Status Progression Bar */}
        {!isCancelled && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Order Progress
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {statuses.map((st) => {
                const isActive = order.status === st;
                const isPast =
                  statuses.indexOf(order.status) >= statuses.indexOf(st) &&
                  order.status !== 'cancelled';

                return (
                  <button
                    key={st}
                    onClick={() => updateOrderStatus(order.id, st)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isPast
                        ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Items & Partial Fulfillment */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-3 bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Items & Fulfillment</span>
            {!isCancelled && !isDelivered && (
              <button
                type="button"
                onClick={
                  isEditingFulfillment ? handleSaveFulfillment : handleStartFulfillmentEdit
                }
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                {isEditingFulfillment ? 'Save Fulfillment' : 'Edit Partial Delivery'}
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {order.items.map((item) => {
              const currentFulfilled = isEditingFulfillment
                ? fulfillmentMap[item.productId] ?? item.fulfilledQuantity
                : item.fulfilledQuantity;
              const pending = Math.max(0, item.quantity - currentFulfilled);

              return (
                <div key={item.productId} className="p-3 bg-white space-y-1.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {item.productName}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Ordered: {formatQuantity(item.quantity, item.unit)} @ {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-slate-900 text-sm">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>

                  {/* Partial Fulfillment Tracking Row */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 font-medium">Fulfilled:</span>
                      {isEditingFulfillment ? (
                        <input
                          type="number"
                          step={['Kg', 'Litre', 'Gram'].includes(item.unit) ? '0.01' : '1'}
                          min="0"
                          max={item.quantity}
                          value={currentFulfilled}
                          onChange={(e) =>
                            setFulfillmentMap({
                              ...fulfillmentMap,
                              [item.productId]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-center font-bold"
                        />
                      ) : (
                        <span className="font-bold text-emerald-700">
                          {formatQuantity(item.fulfilledQuantity, item.unit)}
                        </span>
                      )}
                    </div>

                    {pending > 0 && (
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        Pending / Backorder: {formatQuantity(pending, item.unit)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals Breakdown */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.taxTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span className="font-bold">{formatCurrency(order.taxTotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
              <span className="font-black text-slate-900">Total:</span>
              <span className="text-xl font-black text-slate-900">
                {formatCurrency(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Status Updates / Cancel */}
        {!isCancelled && (
          <div className="pt-2 flex gap-2">
            {order.status !== 'delivered' && (
              <button
                type="button"
                onClick={() => updateOrderStatus(order.id, 'delivered')}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Delivered
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </button>
          </div>
        )}
      </div>

      {/* Cancel Order Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel this Order?"
        message={`Are you sure you want to cancel order ${order.orderNumber}? Historical records will remain intact.`}
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order Active"
        isDanger
        extraOption={
          order.stockDeducted
            ? {
                label: 'Return cancelled items back to inventory stock',
                checked: returnInventoryOnCancel,
                onChange: setReturnInventoryOnCancel,
              }
            : undefined
        }
      />
    </Modal>
  );
};
