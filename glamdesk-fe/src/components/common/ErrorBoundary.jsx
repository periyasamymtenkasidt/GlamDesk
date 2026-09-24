import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto my-12 bg-glam-surface border border-rose-500/20 rounded-3xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold font-outfit text-glam-text">
            Something went wrong
          </h2>
          <p className="text-xs text-glam-text-muted mt-2 max-w-md mx-auto">
            {this.state.error?.message || "An unexpected error occurred while loading this view."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => (window.location.href = "/appointments")}
              className="px-4 py-2 rounded-xl border border-glam-border/50 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt transition-colors"
            >
              Back to Appointments
            </button>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
            >
              <RotateCcw size={13} />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
