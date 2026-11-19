import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    let readable = error.message || 'An unexpected application error occurred.';
    try {
      const parsed = JSON.parse(error.message) as {
        error?: string;
        operationType?: string;
        path?: string;
      };
      if (parsed.error && parsed.operationType) {
        readable = `Firestore ${parsed.operationType} error on ${parsed.path ?? 'resource'}: ${parsed.error}`;
      }
    } catch {
      // Plain error message
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5EBDD] flex items-center justify-center p-6">
          <div className="max-w-lg w-full neu-card-white rounded-[30px] p-8 sm:p-10">
            <p className="text-xs font-semibold text-[#567360] mb-2">Application Error</p>
            <h1 className="text-2xl font-bold text-[#394A43] tracking-tight mb-3">
              Something went wrong while rendering this screen
            </h1>
            <p className="text-sm text-[#5A6D65] leading-relaxed mb-7 break-words">
              {this.state.message}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, message: '' });
                  window.location.assign('/');
                }}
                className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary cursor-pointer"
              >
                Return Home
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
