/**
 * Error Tracking Integration
 * Provides Sentry integration for production error monitoring
 */

import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/react";
import React, { Component, ReactNode } from "react";
import { trackError as loggerTrackError } from "../utils/logger";

/**
 * Sentry configuration interface
 */
export interface SentryConfig {
  dsn: string;
  env: string;
  release?: string;
  tracesSampleRate?: number;
  beforeSend?: (
    event: Sentry.Event,
    hint: Sentry.EventHint
  ) => Sentry.Event | null | PromiseLike<Sentry.Event | null>;
}

/**
 * User context information
 */
export interface UserContext {
  id: string;
  username?: string;
  email?: string;
  role?: string;
  location?: string;
}

/**
 * Initialize Sentry for error tracking
 * Call this during application startup
 */
export function initializeErrorTracking(config: SentryConfig): void {
  if (!config.dsn || config.env === "development") {
    loggerTrackError(
      new Error("Sentry not initialized - DSN missing or development mode"),
      "initialization"
    );
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.env || "production",
    release: config.release || "laboratory-esm@1.0.0",
    integrations: [browserTracingIntegration()],
    tracesSampleRate: config.tracesSampleRate || 0.1, // 10% of transactions sampled

    // Filter sensitive data
    beforeSend: ((event: Sentry.Event, hint: Sentry.EventHint) => {
      // Filter out sensitive information
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }

      // Filter out specific error types
      if (event.exception) {
        const errorValue = event.exception.values?.[0]?.value;
        if (
          errorValue?.includes("ChunkLoadError") ||
          errorValue?.includes("Loading CSS")
        ) {
          // Don't send resource loading errors to Sentry
          return null;
        }
      }

      // Call custom filter if provided
      if (config.beforeSend) {
        return config.beforeSend(event, hint) as Sentry.Event | null;
      }

      return event;
    }) as any,

    // Custom context
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out sensitive breadcrumbs
      if (breadcrumb.category === "xhr" || breadcrumb.category === "fetch") {
        if (breadcrumb.data?.url) {
          // Remove query parameters and sensitive paths
          breadcrumb.data.url = breadcrumb.data.url.replace(
            /[?&]([^=]+)=([^&]*)/g,
            (match, key, value) => {
              // Keep non-sensitive parameters
              const safeKeys = ["page", "limit", "sort"];
              if (safeKeys.includes(key)) {
                return match;
              }
              return `${key}=REDACTED`;
            }
          );
        }
      }

      return breadcrumb;
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: UserContext): void {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    email: user.email,
    // Custom data
    role: user.role,
    location: user.location,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Track an error with additional context
 * Enhanced version that sends to Sentry and logs locally
 */
export function trackError(
  error: Error | string,
  context: string = "operation",
  additionalInfo?: Record<string, any>
): void {
  const errorObj = typeof error === "string" ? new Error(error) : error;

  // Send to Sentry
  Sentry.captureException(errorObj, {
    tags: { context },
    extra: additionalInfo,
  });

  // Also log locally for development
  loggerTrackError(errorObj, context, additionalInfo);
}

/**
 * Track a custom message or event
 */
export function trackMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: string
): void {
  Sentry.captureMessage(message, {
    level,
    tags: { context },
  });
}

/**
 * Track user actions for better error context
 */
export function trackUserAction(
  action: string,
  details?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    category: "user",
    message: action,
    level: "info",
    data: details,
  });
}

/**
 * Track performance issues
 */
export function trackPerformanceIssue(
  operation: string,
  duration: number,
  threshold?: number
): void {
  if (threshold && duration > threshold) {
    trackMessage(
      `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
      "warning",
      "performance"
    );
  }
}

/**
 * Create a performance tracking wrapper
 * Automatically tracks operation duration
 */
export function createPerformanceTracker(
  operationName: string,
  thresholdMs?: number
) {
  const startTime = performance.now();

  return {
    end: (success: boolean = true) => {
      const duration = performance.now() - startTime;

      // Track transaction with Sentry
      Sentry.startSpan({ name: operationName, op: operationName }, (span) => {
        // Transaction completed
        span?.end();
      });

      // Check if operation exceeded threshold
      if (thresholdMs && duration > thresholdMs) {
        trackPerformanceIssue(operationName, duration, thresholdMs);
      }

      return duration;
    },
  };
}

/**
 * React Error Boundary component with Sentry integration
 */

interface SentryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface SentryErrorBoundaryState {
  hasError: boolean;
}

export class SentryErrorBoundary extends Component<
  SentryErrorBoundaryProps,
  SentryErrorBoundaryState
> {
  constructor(props: SentryErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): SentryErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error with Sentry
    trackError(error, "react-component", {
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-fallback">
            <h2>Something went wrong.</h2>
            <p>The error has been logged and we'll look into it.</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error tracking
 */
export function withErrorTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string = WrappedComponent.name
) {
  return (props: P) => {
    return (
      <SentryErrorBoundary
        onError={(error) => {
          trackError(error, "react-component", { componentName });
        }}
      >
        <WrappedComponent {...props} />
      </SentryErrorBoundary>
    );
  };
}

/**
 * Health check for error tracking system
 */
export function checkErrorTrackingHealth(): {
  isHealthy: boolean;
  sentryEnabled: boolean;
  environment: string;
} {
  const client = Sentry.getClient();
  return {
    isHealthy: !!client,
    sentryEnabled: !!client,
    environment: client?.getOptions().environment || "unknown",
  };
}
