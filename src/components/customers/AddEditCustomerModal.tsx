import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { Modal } from '../common/Modal';
import { Sparkles } from 'lucide-react';

interface AddEditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const AddEditCustomerModal: React.FC<AddEditCustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { addCustomer, updateCustomer } = useApp();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setBusinessName(customerToEdit.businessName);
      setPhone(customerToEdit.phone);
      setWhatsapp(customerToEdit.whatsapp || customerToEdit.phone);
      setSameAsPhone(customerToEdit.whatsapp === customerToEdit.phone);
      setAddress(customerToEdit.address || '');
      setGstin(customerToEdit.gstin || '');
      setNotes(customerToEdit.notes || '');
    } else {
      setName('');
      setBusinessName('');
      setPhone('');
      setWhatsapp('');
      setSameAsPhone(true);
      setAddress('');
      setGstin('');
      setNotes('');
    }
  }, [customerToEdit, isOpen]);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !businessName.trim()) return;

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name: name.trim() || businessName.trim(),
        businessName: businessName.trim() || name.trim(),
        phone: phone.trim(),
        whatsapp: sameAsPhone ? phone.trim() : whatsapp.trim(),
        address: address.trim() || undefined,
        gstin: gstin.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addCustomer({
        name: name.trim() || businessName.trim(),
        businessName: businessName.trim() || name.trim(),
        phone: phone.trim(),
        whatsapp: sameAsPhone ? phone.trim() : whatsapp.trim(),
        address: address.trim() || undefined,
        gstin: gstin.trim() || undefined,
        customerPrices: {},
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? 'Edit Customer' : 'Add Wholesale Customer'}
      subtitle="Save contact details for quick quotes and WhatsApp sharing"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Business / Shop Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Business / Shop Name *
          </label>
          <input
            type="text"
            placeholder="e.g. ABC Stores or Sri Lakshmi Mart"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
            autoFocus
          />
        </div>

        {/* Contact Person Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Contact Person Name
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Phone & WhatsApp */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sameAsPhone}
              onChange={(e) => {
                setSameAsPhone(e.target.checked);
                if (e.target.checked) setWhatsapp(phone);
              }}
              className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
            />
            <span>WhatsApp number is the same as phone</span>
          </label>

          {!sameAsPhone && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Store Address / Area
          </label>
          <input
            type="text"
            placeholder="e.g. Shop #4, Gandhi Market, Mylapore, Chennai"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        {/* GSTIN (Optional) */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Customer GSTIN (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 33AAACB1234F1Z1"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase"
          />
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
            className="flex-1 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {customerToEdit ? 'Save Changes' : 'Save Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
