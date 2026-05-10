import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: 600,
          margin: "80px auto",
          padding: 24,
          textAlign: "center",
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            marginBottom: 12,
            color: "var(--red)"
          }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--text2)", marginBottom: 28 }}>
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 16px",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer"
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              style={{
                padding: "8px 16px",
                background: "var(--bg3)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: 20, textAlign: "left" }}>
              <summary style={{ cursor: "pointer", color: "var(--text2)" }}>
                Error Details (Development)
              </summary>
              <pre style={{
                background: "var(--bg3)",
                padding: 12,
                borderRadius: "var(--radius)",
                fontSize: 12,
                overflow: "auto",
                marginTop: 8
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;