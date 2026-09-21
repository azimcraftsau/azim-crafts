import React from 'react';
import { AlertCircle, RefreshCw, ShoppingBag, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 font-menu text-[#131313]">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-lg p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 font-heading">
                {this.props.title || 'Checkout Encountered an Issue'}
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {this.props.description || 'A temporary script or network issue prevented the page from rendering properly. Your cart items are completely safe.'}
              </p>
              {this.state.error?.message && (
                <div className="p-2.5 bg-neutral-50 rounded text-[11px] text-neutral-600 font-mono text-left overflow-x-auto max-h-24 border border-neutral-200">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-[#1b1a1a] hover:bg-[#333333] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={() => {
                  window.location.hash = '#cart';
                  window.location.reload();
                }}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Return to Cart</span>
              </button>

              <button
                onClick={() => {
                  window.location.hash = '';
                  window.location.href = '/';
                }}
                className="text-xs text-[#0066cc] hover:underline pt-1 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to Storefront Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
