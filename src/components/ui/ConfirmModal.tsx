import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false
}) => {
  const icons = {
    danger: AlertTriangle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    danger: {
      icon: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      button: 'bg-rose-500 hover:bg-rose-600',
      text: 'text-rose-500'
    },
    warning: {
      icon: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      button: 'bg-amber-500 hover:bg-amber-600',
      text: 'text-amber-500'
    },
    info: {
      icon: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      button: 'bg-blue-500 hover:bg-blue-600',
      text: 'text-blue-500'
    }
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-md glass-modal p-6 shadow-2xl border",
              colorScheme.border
            )}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-xl", colorScheme.bg)}>
                <Icon size={24} className={colorScheme.icon} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex-1 h-12 rounded-xl font-bold text-white transition-all disabled:opacity-50",
                  colorScheme.button
                )}
              >
                {isLoading ? 'Aguarde...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
