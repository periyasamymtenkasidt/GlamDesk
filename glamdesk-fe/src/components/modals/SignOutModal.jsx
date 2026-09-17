import { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';

const SignOutModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-glam-border bg-glam-surface p-6 shadow-2xl overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-0.75 bg-linear-to-r from-glam-accent to-glam-accent-2" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-signout-modal-btn"
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-glam-text-muted hover:text-glam-text hover:bg-glam-surface-alt transition-colors"
        >
          <X size={16} />
        </button>

        {/* Modal Body */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* Glowing LogOut Icon Badge */}
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#d4728f26] to-glam-shadow border border-glam-border flex items-center justify-center text-glam-accent-2 shadow-sm">
              <LogOut size={26} className="text-glam-accent-2" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-[#d4728f] blur-xl opacity-20 -z-10 scale-125" />
          </div>

          <h3 className="text-xl font-bold font-outfit text-glam-text tracking-tight">
            Sign out of GlamDesk?
          </h3>

          <p className="text-sm text-glam-text-muted mt-2 leading-relaxed px-2">
            Are you sure you want to sign out of your artist admin portal? You will need to sign in again to access your CRM dashboard.
          </p>

          {/* Modal Actions */}
          <div className="flex items-center gap-3 w-full mt-6">
            <button
              type="button"
              onClick={onClose}
              id="cancel-signout-btn"
              className="flex-1 h-11 rounded-xl border border-glam-border text-sm font-semibold text-glam-text hover:bg-glam-surface-alt transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              id="confirm-signout-btn"
              className="flex-1 h-11 rounded-xl bg-linear-to-r from-glam-accent-2 to-glam-accent text-sm font-semibold text-white shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;
