import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Smartphone, Monitor, RotateCcw } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, resetToDemoData, deviceViewMode, setDeviceViewMode } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Shop Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
              {settings.shopName || 'KiranaFlow'}
            </h1>
            <p className="text-[11px] text-slate-500 truncate leading-none mt-0.5">
              {settings.ownerName ? `Owner: ${settings.ownerName}` : 'Grocery & Wholesale'}
            </p>
          </div>
        </div>

        {/* Action Controls: Mobile/Desktop Preview + Demo Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Device toggle (desktop screens only) */}
          <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setDeviceViewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                deviceViewMode === 'mobile'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Preview on mobile smartphone frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile View
            </button>
            <button
              onClick={() => setDeviceViewMode('responsive')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                deviceViewMode === 'responsive'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Responsive full screen view"
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop View
            </button>
          </div>

          {/* Quick Demo Reset */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data to default Indian grocery samples?')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Reset to realistic Indian grocery demo data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
