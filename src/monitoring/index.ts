/**
 * Monitoring System Index
 * Central exports for error tracking and performance monitoring
 */

// Note: Error tracking and performance monitoring are available but not initialized by default.
// To use, import and call initializeErrorTracking() or setupWebVitalsMonitoring() directly in your app initialization.

// Performance monitoring exports (no React dependencies)
export {
  setupWebVitalsMonitoring,
  getPerformanceReport,
  exportPerformanceData,
} from "./performance-monitoring";

// Performance monitoring hooks
export {
  usePerformanceMonitoring,
  withPerformanceMonitoring,
  trackPerformance,
  performanceMonitor,
} from "./performance-monitoring";

/**
 * Initialize complete monitoring system
 * Call this during application startup (not in React components)
 */
export function initializeMonitoring(config: {
  sentry?: {
    dsn: string;
    environment: string;
    release?: string;
  };
  performance?: {
    enabled?: boolean;
  };
}) {
  // Initialize error tracking if Sentry DSN provided
  if (config.sentry && typeof window !== "undefined") {
    // Dynamic import to avoid bundling Sentry if not needed
    import("./error-tracking").then(({ initializeErrorTracking }) => {
      initializeErrorTracking({
        dsn: config.sentry.dsn,
        env: config.sentry.environment,
        release: config.sentry.release,
      });
    }).catch((error) => {
      console.warn("Failed to initialize error tracking:", error);
    });
  }

  // Initialize performance monitoring
  if (config.performance?.enabled !== false && typeof window !== "undefined") {
    // Dynamic import to avoid issues
    import("./performance-monitoring").then(({ setupWebVitalsMonitoring }) => {
      setupWebVitalsMonitoring();
    }).catch((error) => {
      console.warn("Failed to initialize performance monitoring:", error);
    });
  }

  console.log("Monitoring system initialized", {
    errorTracking: !!config.sentry,
    performanceMonitoring: config.performance?.enabled !== false,
  });
}
