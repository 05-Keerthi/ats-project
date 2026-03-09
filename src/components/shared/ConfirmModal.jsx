import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDestructive = false 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className={`p-6 border-b border-slate-800 flex items-start gap-4 ${isDestructive ? 'bg-red-500/10' : 'bg-slate-800/50'}`}>
              <div className={`p-2 rounded-full shrink-0 ${isDestructive ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                <AlertCircle size={24} />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
              </div>
              <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors shrink-0">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 flex justify-end gap-3 bg-slate-900/50">
              <button 
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-lg font-medium text-white transition-all shadow-lg focus:ring-2 focus:outline-none ${
                  isDestructive 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20 focus:ring-red-500/50' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 focus:ring-indigo-500/50'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
