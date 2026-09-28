import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quotation, QuoteStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateQuotationPdf } from '../../utils/pdfGenerator';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  MessageCircle,
  Download,
  PackageCheck,
  Calendar,
  Phone,
  Printer,
} from 'lucide-react';

interface QuotationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onOpenWhatsAppShare: (quotation: Quotation) => void;
}

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onOpenWhatsAppShare,
}) => {
  const { updateQuotationStatus, convertQuoteToOrder, settings, setActiveTab } = useApp();

  const [showConvertConfirm, setShowConvertConfirm] = useState(false);

  if (!isOpen || !quotation) return null;

  const isConverted = quotation.status === 'converted' || Boolean(quotation.convertedOrderId);

  const handleDownloadPdf = () => {
    generateQuotationPdf(quotation, settings);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConvert = () => {
    const result = convertQuoteToOrder(quotation.id);
    if (result.success) {
      setShowConvertConfirm(false);
      onClose();
      setActiveTab('orders');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quotation ${quotation.quoteNumber}`}
      subtitle={`Created on ${formatDate(quotation.createdAt)}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Status & Validity Header Banner */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="quote" status={quotation.status} />
            {isConverted && (
              <span className="text-xs text-purple-700 font-bold bg-purple-100 px-2.5 py-0.5 rounded-full">
                Order Created
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Valid until: <strong>{formatDate(quotation.validUntil)}</strong></span>
            </div>

            {/* Manual Status Selector */}
            {!isConverted && (
              <select
                value={quotation.status}
                onChange={(e) => updateQuotationStatus(quotation.id, e.target.value as QuoteStatus)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
          </div>
        </div>

        {/* Customer Details Box */}
        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs space-y-1">
          <span className="text-blue-700 font-bold text-[10px] uppercase tracking-wider block">
            Customer Information
          </span>
          <div className="text-sm font-black text-slate-900">
            {quotation.customerBusiness || quotation.customerName}
          </div>
          <div className="text-slate-600 flex items-center gap-3 mt-0.5">
            <span>Contact: {quotation.customerName}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold">
              <Phone className="w-3 h-3 text-slate-400" />
              {quotation.customerPhone}
            </span>
            {quotation.customerGstin && (
              <>
                <span>•</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">
                  GST: {quotation.customerGstin}
                </span>
              </>
            )}
          </div>
          {quotation.customerAddress && (
            <div className="text-slate-500 text-[11px] pt-1">{quotation.customerAddress}</div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-3 bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Items Quotation</span>
            <span>{quotation.items.length} items</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {quotation.items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{item.productName}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                    {item.isPriceOverridden && (
                      <span className="text-amber-700 font-medium ml-1.5">(Custom Rate)</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-slate-900 text-sm">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">{formatCurrency(quotation.subtotal)}</span>
            </div>

            {quotation.discountTotal > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Discount:</span>
                <span>- {formatCurrency(quotation.discountTotal)}</span>
              </div>
            )}

            {quotation.shippingCharge > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-bold">{formatCurrency(quotation.shippingCharge)}</span>
              </div>
            )}

            {quotation.taxTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax (GST):</span>
                <span className="font-bold">{formatCurrency(quotation.taxTotal)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
              <span className="font-black text-slate-900">GRAND TOTAL:</span>
              <span className="text-xl font-black text-emerald-700">
                {formatCurrency(quotation.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">Terms / Notes:</span>
            <p className="italic">{quotation.notes}</p>
          </div>
        )}

        {/* PRIMARY ACTIONS: WhatsApp, PDF, Convert to Order */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-3 gap-2">
            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={() => onOpenWhatsAppShare(quotation)}
              className="py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="py-3 px-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Convert to Order Action */}
          {!isConverted ? (
            <button
              type="button"
              onClick={() => setShowConvertConfirm(true)}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-5 h-5" />
              Convert to Order
            </button>
          ) : (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center text-xs font-bold text-purple-900 flex items-center justify-center gap-2">
              <PackageCheck className="w-4 h-4 text-purple-700" />
              This quotation has been converted into an Order.
            </div>
          )}
        </div>
      </div>

      {/* Convert to Order Confirmation Dialog */}
      <ConfirmationModal
        isOpen={showConvertConfirm}
        onClose={() => setShowConvertConfirm(false)}
        onConfirm={handleConvert}
        title="Convert to Order?"
        message={`Convert quotation ${quotation.quoteNumber} (${formatCurrency(quotation.grandTotal)}) into an active order? Inventory will be automatically deducted according to your settings.`}
        confirmLabel="Convert & Create Order"
        cancelLabel="Keep as Quote"
      />
    </Modal>
  );
};
