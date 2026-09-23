import { useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  IndianRupee,
  CreditCard,
  Banknote,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Receipt,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

/**
 * RecordPaymentModal - Collect Advance or Balance payment via UPI or Cash.
 * Incorporates dynamic live UPI QR Code and banking details managed via the Settings module.
 * Automatically advances the appointment lifecycle:
 * - Advance payment → Confirms booking ("Appointment Confirmed")
 * - Balance payment → Closes booking ("Automatically → Completed")
 */
const RecordPaymentModal = ({
  isOpen,
  onClose,
  appointment,
  type = "advance", // "advance" | "balance"
  onRecordPayment,
}) => {
  const { settings, getUpiPaymentUrl } = useSettings();

  if (!isOpen || !appointment) return null;

  const isAdvance = type === "advance";
  const totalAmount = Number(appointment.totalAmount) || 0;
  const currentPaid = Number(appointment.advancePaid) || 0;
  const currentBalance = Math.max(0, totalAmount - currentPaid);

  const defaultAdvancePercent = settings?.salon?.defaultAdvancePercent || 40;

  // Suggested default amount
  const defaultAmount = isAdvance
    ? (appointment.advanceRequired || Math.round(totalAmount * (defaultAdvancePercent / 100)) || 2000)
    : currentBalance;

  const [paymentMethod, setPaymentMethod] = useState("UPI"); // "UPI" | "Cash"
  const [amount, setAmount] = useState(defaultAmount);
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQrCard, setShowQrCard] = useState(true);

  const numAmount = Number(amount) || 0;
  const newTotalPaid = currentPaid + numAmount;
  const remainingAfterPayment = Math.max(0, totalAmount - newTotalPaid);

  const upiDetails = getUpiPaymentUrl(numAmount, appointment.code);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiDetails.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (numAmount <= 0) {
      setError("Please enter a valid payment amount greater than ₹0");
      return;
    }

    if (isAdvance) {
      const isFullyPaid = newTotalPaid >= totalAmount;
      onRecordPayment({
        advancePaid: newTotalPaid,
        balanceDue: remainingAfterPayment,
        paymentStatus: isFullyPaid ? "Fully Paid" : "Advance Paid",
        status: isFullyPaid ? "Completed" : "Confirmed",
        advancePaymentMethod: paymentMethod,
        advanceTransactionRef: transactionRef.trim(),
        advancePaidAt: new Date().toISOString(),
        paymentDate,
        notes: notes.trim()
          ? `${appointment.notes ? appointment.notes + " · " : ""}[Advance ${paymentMethod}: ₹${numAmount.toLocaleString("en-IN")}${transactionRef ? ` (${transactionRef})` : ""}]`
          : appointment.notes,
      });
    } else {
      // Balance payment: Automatically Completed!
      onRecordPayment({
        advancePaid: newTotalPaid,
        balanceDue: remainingAfterPayment,
        paymentStatus: "Fully Paid",
        status: "Completed",
        finalPaymentMethod: paymentMethod,
        finalTransactionRef: transactionRef.trim(),
        completedAt: new Date().toISOString(),
        paymentDate,
        notes: notes.trim()
          ? `${appointment.notes ? appointment.notes + " · " : ""}[Balance ${paymentMethod}: ₹${numAmount.toLocaleString("en-IN")}${transactionRef ? ` (${transactionRef})` : ""}]`
          : appointment.notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-glam-surface border border-glam-border/60 shadow-2xl p-5 sm:p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-glam-border/40 pb-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isAdvance
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
              }`}
            >
              <IndianRupee size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-outfit text-glam-text">
                  {isAdvance ? "Collect Advance Payment" : "Collect Balance Payment"}
                </h3>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-glam-surface-alt border border-glam-border/40 text-glam-text-muted">
                  #{appointment.code}
                </span>
              </div>
              <p className="text-xs text-glam-text-muted mt-0.5">
                {isAdvance
                  ? "Confirm booking by recording advance deposit"
                  : "Record final payment and mark booking completed"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-glam-surface-alt text-glam-text-muted hover:text-glam-text flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Financial Summary Snippet */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-glam-surface-alt/40 border border-glam-border/30 text-xs">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
              Total Package
            </span>
            <span className="text-sm sm:text-base font-bold font-outfit text-glam-text mt-0.5 block">
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
              Already Paid
            </span>
            <span className="text-sm sm:text-base font-bold font-outfit text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              ₹{currentPaid.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
              {isAdvance ? "Expected Advance" : "Balance Due"}
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-outfit mt-0.5 block ${
                isAdvance ? "text-glam-accent" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              ₹{defaultAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Payment Method Selection (UPI vs Cash) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === "UPI"
                    ? "bg-glam-accent/15 border-glam-accent text-glam-accent shadow-xs"
                    : "bg-glam-surface-alt/50 border-glam-border/50 text-glam-text hover:bg-glam-surface-alt"
                }`}
              >
                <CreditCard size={15} />
                <span>UPI / QR / Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Cash")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === "Cash"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "bg-glam-surface-alt/50 border-glam-border/50 text-glam-text hover:bg-glam-surface-alt"
                }`}
              >
                <Banknote size={15} />
                <span>Cash Received</span>
              </button>
            </div>
          </div>

          {/* 2. Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                Amount Received (₹)
              </label>
              {remainingAfterPayment > 0 && (
                <span className="text-[11px] text-glam-text-muted">
                  Remaining balance: ₹{remainingAfterPayment.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-glam-text-muted font-outfit">
                ₹
              </span>
              <input
                type="number"
                min="1"
                max={totalAmount}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="w-full h-11 pl-8 pr-4 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-sm font-bold font-outfit text-glam-text focus:outline-none focus:border-glam-accent transition-colors"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {/* Dynamic UPI QR Code Box (If UPI Selected) */}
          {paymentMethod === "UPI" && (
            <div className="rounded-2xl border border-glam-border/50 bg-glam-surface-alt/30 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowQrCard(!showQrCard)}
                  className="flex items-center gap-1.5 text-xs font-bold text-glam-text hover:text-glam-accent transition-colors cursor-pointer"
                >
                  <QrCode size={14} className="text-glam-accent" />
                  <span>Scan to Pay via UPI</span>
                  {showQrCard ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                <Link
                  to="/settings"
                  target="_blank"
                  className="text-[10px] text-glam-text-muted hover:text-glam-accent font-semibold transition-colors"
                >
                  Settings QR →
                </Link>
              </div>

              {showQrCard && (
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1 animate-in fade-in duration-150">
                  <div className="p-2 rounded-xl bg-white shadow-xs border border-gray-200 shrink-0">
                    <img
                      src={upiDetails.qrImageUrl}
                      alt="UPI Payment QR"
                      className="w-28 h-28 object-contain rounded-md"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs flex-1 min-w-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-glam-text-muted block">
                        UPI VPA
                      </span>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-glam-surface border border-glam-border/40 font-mono text-[11px] font-bold text-glam-text">
                        <span>{upiDetails.upiId}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="text-glam-accent hover:text-glam-accent-2 cursor-pointer p-0.5"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-glam-text-muted leading-tight">
                      <span>{settings.payment.bankName || "HDFC Bank"} · A/C: {settings.payment.accountNumber || "50200084920193"}</span>
                    </div>

                    <p className="text-[10px] text-glam-text-muted">
                      Amount: <span className="font-bold text-glam-text">₹{numAmount.toLocaleString("en-IN")}</span>. Customer can scan with GPay, PhonePe, or Paytm.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Transaction Reference (for UPI) or Bill Reference */}
          {paymentMethod === "UPI" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                UPI Reference / UTR Number <span className="text-glam-text-muted/60 lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. 4281928319 / UPI Reference ID"
                className="w-full h-10 px-3.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent transition-colors"
              />
            </div>
          )}

          {/* 4. Payment Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
              Payment Received Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent transition-colors"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-semibold">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-glam-border/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-glam-border/40 text-xs font-semibold text-glam-text-muted hover:text-glam-text transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer ${
                isAdvance
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-linear-to-r from-glam-accent to-glam-accent-2"
              }`}
            >
              <CheckCircle2 size={14} />
              <span>
                {isAdvance
                  ? "Record Advance & Confirm Booking"
                  : "Record Balance & Complete Booking"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
