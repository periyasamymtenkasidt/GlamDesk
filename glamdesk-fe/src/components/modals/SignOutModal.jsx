import { LogOut } from 'lucide-react';
import Modal from '../common/Modal';

const SignOutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Header onClose={onClose} />
      <Modal.Body className="flex flex-col items-center text-center">
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
      </Modal.Body>
      <Modal.Footer className="mt-2">
        <button
          type="button"
          onClick={onClose}
          id="cancel-signout-btn"
          className="flex-1 h-11 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm font-semibold text-glam-text hover:bg-glam-surface-alt/70 transition-all duration-200"
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
      </Modal.Footer>
    </Modal>
  );
};

export default SignOutModal;
