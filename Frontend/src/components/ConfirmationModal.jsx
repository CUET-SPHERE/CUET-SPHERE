import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, loading = false }) => {
  const { colors, buttonClasses } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className={`${colors?.surface || 'bg-surface'} rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 ${colors?.border || 'border-border-color'} border`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${colors?.textPrimary || 'text-text-primary'} flex items-center gap-3`}>
            <AlertTriangle className={`${colors?.warning || 'text-warning'}`} />
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`${colors?.textSecondary || 'text-text-secondary'} hover:${colors?.textPrimary || 'hover:text-text-primary'} transition-colors`}
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
        <p className={`${colors?.textSecondary || 'text-text-secondary'} mb-8`}>{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className={`${buttonClasses?.secondary || 'px-6 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white'} font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${buttonClasses?.danger || 'px-6 py-2 rounded-lg bg-error hover:bg-red-600 text-white'} font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Deleting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
