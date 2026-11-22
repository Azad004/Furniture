import React from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('Application render error:', error);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.hash = '#/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{
            backgroundColor: 'var(--color-bg-canvas)',
            color: 'var(--color-text-primary)',
          }}
        >
          <div
            className="max-w-md w-full rounded-xl border p-8 text-center space-y-5"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <ShieldAlert className="w-10 h-10 mx-auto opacity-65" strokeWidth={1.5} />
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-medium">Something Went Wrong</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                An unexpected error interrupted this view. Your browsing session remains protected.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="vespera-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to Storefront</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
