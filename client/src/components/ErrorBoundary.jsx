import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log unexpected runtime error telemetry
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Atelier Error Boundary caught an exception]:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="shv-error-boundary-wrap">
          <div className="shv-error-boundary-card">
            <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(225, 29, 72, 0.08)', borderRadius: '50%', color: '#E11D48' }}>
              <AlertCircle size={32} />
            </div>
            <h2>Momentary Atelier Interruption</h2>
            <p>
              An unexpected display variance occurred while rendering fine silver pieces.
              Please refresh your session or return to our boutique gallery.
            </p>
            <div className="shv-error-boundary-actions">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontSize: '0.85rem' }}
              >
                <RotateCcw size={15} style={{ marginRight: '6px' }} />
                <span>Refresh Session</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn btn-secondary"
                style={{ padding: '10px 22px', fontSize: '0.85rem' }}
              >
                <Home size={15} style={{ marginRight: '6px' }} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
