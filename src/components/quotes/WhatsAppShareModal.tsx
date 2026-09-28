import React, { useState } from 'react';
import { Quotation, ShopSettings } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  settings: ShopSettings;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  quotation,
  settings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !quotation) return null;

  // Build the message text
  const customerFirstName = quotation.customerName.split(' ')[0] || quotation.customerBusiness;
  const itemsSummary = quotation.items
    .map((item) => `• ${item.quantity} ${item.unit} ${item.productName} @ ${formatCurrency(item.unitPrice)}`)
    .join('\n');

  const messageText = `Hello ${customerFirstName},

Please find our quotation *${quotation.quoteNumber}* for your requirement from *${settings.shopName}*.

*Items Requested:*
${itemsSummary}

*Total Amount:* ${formatCurrency(quotation.grandTotal)}
*Quotation Valid Until:* ${formatDate(quotation.validUntil)}

${quotation.notes ? `*Notes:* ${quotation.notes}\n` : ''}
Please let us know if you would like to proceed with the order.

Thank you!
${settings.ownerName || settings.shopName}
${settings.phone}`;

  const cleanPhone = (quotation.customerPhone || '').replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(messageText);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Quotation on WhatsApp"
      subtitle={`Ready to send to ${quotation.customerBusiness || quotation.customerName}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Customer Phone Recipient */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
          <span className="text-emerald-900 font-semibold">Recipient WhatsApp:</span>
          <span className="font-bold text-emerald-950 font-mono text-sm">
            {quotation.customerPhone}
          </span>
        </div>

        {/* Message Preview Box */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Prepared Message Preview
          </label>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed max-h-56 overflow-y-auto select-all">
            {messageText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Open & Send in WhatsApp
            <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                Copy Message Text
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Tapping will launch your WhatsApp app with this customer and message pre-filled.
        </p>
      </div>
    </Modal>
  );
};
