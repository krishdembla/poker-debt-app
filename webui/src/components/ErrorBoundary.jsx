import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-color, white)',
          color: 'var(--text-primary, #333)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-color, white)'
          }}>
            <h2 style={{ color: '#f44336', marginBottom: '1rem' }}>
              ⚠️ Something went wrong
            </h2>
            
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: 'var(--accent, #ff6b3d)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '1rem'
                }}
              >
                Refresh Page
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary, #333)',
                  border: '1px solid var(--border-color, #ccc)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Go Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Error Details (Development)
                </summary>
                <pre style={{ 
                  marginTop: '0.5rem', 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  fontSize: '0.75rem'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 