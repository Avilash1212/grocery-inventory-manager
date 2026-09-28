import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryDeductTrigger } from '../../types';
import {
  Store,
  Boxes,
  FileText,
  Download,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, clearAllData, exportDataJson } = useApp();

  // Business Profile Form State
  const [shopName, setShopName] = useState(settings.shopName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [gstin, setGstin] = useState(settings.gstin || '');

  // Inventory Rule
  const [inventoryDeductTrigger, setInventoryDeductTrigger] = useState<InventoryDeductTrigger>(
    settings.inventoryDeductTrigger
  );
  const [allowNegativeStock, setAllowNegativeStock] = useState(settings.allowNegativeStock);

  // Quotation Defaults
  const [defaultValidity, setDefaultValidity] = useState(settings.defaultQuoteValidityDays);
  const [defaultNotes, setDefaultNotes] = useState(settings.defaultNotes);
  const [enableTax, setEnableTax] = useState(settings.enableTax);
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings.defaultTaxRate);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gstin: gstin.trim() || undefined,
    });
  };

  const handleSaveInventoryRules = (trigger: InventoryDeductTrigger, allowNeg: boolean) => {
    setInventoryDeductTrigger(trigger);
    setAllowNegativeStock(allowNeg);
    updateSettings({
      inventoryDeductTrigger: trigger,
      allowNegativeStock: allowNeg,
    });
  };

  const handleSaveQuoteDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultQuoteValidityDays: defaultValidity,
      defaultNotes: defaultNotes.trim(),
      enableTax,
      defaultTaxRate,
    });
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiranaflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Shop Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Simple configuration for your store profile, stock rules, and quotes
        </p>
      </div>

      {/* 1. Business Profile */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Business Profile</h3>
            <p className="text-[11px] text-slate-500">
              Appears on all quotations, invoices, and WhatsApp messages
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shop Name *
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Owner / Manager Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Store Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shop GSTIN (Optional)
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 33AAAAA0000A1Z5"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Store Profile
          </button>
        </form>
      </div>

      {/* 2. Inventory Rules (Section 20 requirement) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inventory Deduction Setting</h3>
            <p className="text-[11px] text-slate-500">
              Control exactly when products leave stock during order processing
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Deduct inventory when:
          </label>

          <div className="space-y-2">
            {[
              {
                id: 'on_confirm' as InventoryDeductTrigger,
                label: 'Order is Confirmed (Recommended)',
                desc: 'Stock is deducted as soon as an accepted quote is converted or customer confirms order.',
              },
              {
                id: 'on_create' as InventoryDeductTrigger,
                label: 'Order is Created',
                desc: 'Stock is reserved immediately upon saving any order draft.',
              },
              {
                id: 'on_deliver' as InventoryDeductTrigger,
                label: 'Order is Delivered',
                desc: 'Stock is only deducted when you mark order as physically delivered/picked up.',
              },
            ].map((option) => (
              <label
                key={option.id}
                onClick={() => handleSaveInventoryRules(option.id, allowNegativeStock)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  inventoryDeductTrigger === option.id
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="inventoryTrigger"
                  checked={inventoryDeductTrigger === option.id}
                  onChange={() => {}}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">{option.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowNegativeStock}
                onChange={(e) => handleSaveInventoryRules(inventoryDeductTrigger, e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                Allow negative stock overrides
              </span>
            </label>
            <p className="text-[11px] text-slate-500 ml-6 mt-0.5">
              Always warns before deducting if stock is insufficient, but allows you to proceed.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Quotation Defaults */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Quotation Defaults</h3>
            <p className="text-[11px] text-slate-500">
              Default validity period and terms pre-filled into new quotations
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveQuoteDefaults} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Default Validity
              </label>
              <select
                value={defaultValidity}
                onChange={(e) => setDefaultValidity(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days</option>
                <option value={15}>15 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tax (GST) Enabled
              </label>
              <div className="flex gap-2">
                <select
                  value={enableTax ? 'yes' : 'no'}
                  onChange={(e) => setEnableTax(e.target.value === 'yes')}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="no">Disabled</option>
                  <option value="yes">Enabled</option>
                </select>
                {enableTax && (
                  <input
                    type="number"
                    min="0"
                    placeholder="Rate %"
                    value={defaultTaxRate}
                    onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Default Terms & Notes
            </label>
            <textarea
              rows={2}
              value={defaultNotes}
              onChange={(e) => setDefaultNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Quotation Defaults
          </button>
        </form>
      </div>

      {/* 4. Demo Data & Backup Management */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Data Backup & Demo Management</h3>
            <p className="text-[11px] text-slate-500">
              Download your data or reset demo samples for testing
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Export Button */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Export All Data</div>
              <div className="text-[11px] text-slate-500">
                Download a JSON backup of all products, customers, quotes, orders & stock movements
              </div>
            </div>
            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Export JSON
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="flex items-center justify-between p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
            <div>
              <div className="text-xs font-bold text-purple-950">Reset Demo Data</div>
              <div className="text-[11px] text-purple-800">
                Restore the 10 Indian grocery products, 5 wholesale customers, sample quotes & orders
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all data to default Indian grocery samples?')) {
                  resetToDemoData();
                }
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Reset Demo
            </button>
          </div>

          {/* Clear All Data */}
          <div className="flex items-center justify-between p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
            <div>
              <div className="text-xs font-bold text-rose-950">Clear All Data</div>
              <div className="text-[11px] text-rose-800">
                Start from a completely clean slate with zero products or customers
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  clearAllData();
                }
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
