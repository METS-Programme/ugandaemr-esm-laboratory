/**
 * Laboratory Error Boundary
 * Catches React component errors and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorState } from "@openmrs/esm-framework";
import { Button } from "@carbon/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class LaboratoryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "Laboratory Error Boundary caught an error:",
      error,
      errorInfo
    );

    // Log error details
    console.error("Error stack:", error.stack);
    console.error("Component stack:", errorInfo.componentStack);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="laboratory-error-boundary">
          <ErrorState
            error={this.state.error}
            headerTitle="Something went wrong"
          />
          <div style={{ padding: "1rem", textAlign: "center" }}>
            <p>
              An error occurred while displaying this component. Please try
              refreshing the page.
            </p>
            <Button onClick={this.handleReset} kind="secondary">
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              kind="primary"
              style={{ marginLeft: "0.5rem" }}
            >
              Refresh Page
            </Button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={{ marginTop: "1rem", textAlign: "left" }}>
                <summary>Error Details (Development)</summary>
                <pre
                  style={{
                    backgroundColor: "#f4f4f4",
                    padding: "1rem",
                    borderRadius: "4px",
                    overflow: "auto",
                  }}
                >
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.error.stack}
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

/**
 * Higher-order component that wraps a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <LaboratoryErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </LaboratoryErrorBoundary>
    );
  };
}

/**
 * Hook-based error boundary alternative for functional components
 */
export function useErrorHandler(
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return (children: ReactNode) => (
    <LaboratoryErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </LaboratoryErrorBoundary>
  );
}
