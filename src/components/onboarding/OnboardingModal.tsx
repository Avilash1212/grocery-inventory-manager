import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Sparkles, Package, Users, FileText, ArrowRight, Store } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'product' | 'customer' | 'quote') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const { settings, updateSettings } = useApp();

  const [step, setStep] = useState<1 | 2>(1);

  // 5 simple questions
  const [shopName, setShopName] = useState(settings.shopName || '');
  const [ownerName, setOwnerName] = useState(settings.ownerName || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [currency] = useState('₹');
  const [sellsWholesale, setSellsWholesale] = useState(true);

  if (!isOpen) return null;

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;

    updateSettings({
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      currency,
      isOnboarded: true,
    });

    setStep(2);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'Welcome to KiranaFlow 👋' : "You're Ready to Go! 🎉"}
      subtitle={
        step === 1
          ? 'Just 1 minute to setup your grocery shop'
          : 'Choose where you want to start managing your shop'
      }
      maxWidth="md"
      showClose={step === 2}
    >
      {step === 1 ? (
        <form onSubmit={handleCompleteSetup} className="space-y-4 animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Shop / Kirana Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Sri Murugan Provisions & Wholesale"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Owner Name
            </label>
            <input
              type="text"
              placeholder="e.g. R. Murugan"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. WhatsApp / Phone Number *
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 98400 11223"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Currency
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-bold">
                ₹ (Indian Rupee)
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                5. Wholesale Sales?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSellsWholesale(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sellsWholesale
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setSellsWholesale(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !sellsWholesale
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            Start Using KiranaFlow
          </button>
        </form>
      ) : (
        <div className="space-y-3.5 py-2 animate-in fade-in">
          <p className="text-sm font-semibold text-slate-700 text-center mb-4">
            What would you like to do first?
          </p>

          <button
            onClick={() => {
              onClose();
              onSelectAction('product');
            }}
            className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Add your first product</div>
                <div className="text-xs text-slate-500 mt-0.5">Start tracking stock & prices</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectAction('customer');
            }}
            className="w-full p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Add a wholesale customer</div>
                <div className="text-xs text-slate-500 mt-0.5">Save customer contacts & special rates</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-700 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectAction('quote');
            }}
            className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Create your first quotation</div>
                <div className="text-xs text-slate-500 mt-0.5">Send a quick quote on WhatsApp</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </Modal>
  );
};
