import React from 'react';
import { useApp } from '../../context/AppContext';
import { Undo2, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const UndoToast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700/60">
        <div className="flex items-center gap-2.5 min-w-0">
          {icons[toast.type]}
          <p className="text-sm font-medium leading-snug text-slate-100 truncate">
            {toast.message}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {toast.undoAction && (
            <button
              onClick={() => {
                toast.undoAction?.();
                hideToast();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo
            </button>
          )}

          <button
            onClick={hideToast}
            className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
