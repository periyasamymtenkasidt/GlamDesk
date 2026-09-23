import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const ModalHeader = ({ title, icon: Icon, onClose, children }) => {
  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
            <Icon size={16} />
          </div>
        )}
        {title && (
          <h3 className="text-lg font-bold font-outfit text-glam-text">
            {title}
          </h3>
        )}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="p-1.5 rounded-xl text-glam-text-muted hover:text-glam-text hover:bg-glam-surface-alt/50 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

const ModalBody = ({ children, className = "" }) => {
  return <div className={`py-1 scrollbar-none ${className}`}>{children}</div>;
};

const ModalFooter = ({ children, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 pt-4 ${className}`}>
      {children}
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  maxWidth = "max-w-lg",
  showAccentBar = true,
  zIndex = "z-50",
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const containerWidth = maxWidthClasses[maxWidth] || maxWidth;

  const modalContent = (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity`}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${containerWidth} rounded-3xl bg-glam-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-none transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {showAccentBar && (
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-glam-accent to-glam-accent-2" />
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
