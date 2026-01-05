import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch React errors.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: '1rem', color: '#e53e3e' }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            We're sorry, but something unexpected happened. Please try again.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Error Details (Dev Only)
              </summary>
              <pre
                style={{
                  padding: '1rem',
                  background: '#f7fafc',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.875rem',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

