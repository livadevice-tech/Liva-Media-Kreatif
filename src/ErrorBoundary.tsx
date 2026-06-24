import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#fee2e2", color: "#991b1b", fontFamily: "monospace", borderRadius: "8px", margin: "20px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>Aplikasi Mengalami Crash</h1>
          <p style={{ marginBottom: "10px" }}>Pesan Error: {this.state.error?.toString()}</p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", background: "#f87171", padding: "10px", color: "white", borderRadius: "4px" }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: "15px", padding: "8px 16px", background: "#991b1b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
