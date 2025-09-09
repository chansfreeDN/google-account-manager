import React, { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    children, 
    variant = 'default',
    confirmText,
    cancelText
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const confirmButtonBaseClasses = "px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const destructiveClasses = "bg-red-600 hover:bg-red-700 focus:ring-red-500";
  const defaultClasses = "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
  const confirmClasses = variant === 'destructive' ? destructiveClasses : defaultClasses;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 id="confirm-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <div className="text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${confirmButtonBaseClasses} ${confirmClasses}`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
