/**
 * Performance Monitoring System
 * Provides comprehensive performance tracking and analysis
 */

import React from "react";
import { trackPerformance as loggerTrackPerformance } from "../utils/logger";
import * as Sentry from "@sentry/react";

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  operationName: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

/**
 * Performance thresholds configuration
 */
export interface PerformanceThresholds {
  apiCalls: number; // ms
  renderTime: number; // ms
  userInteraction: number; // ms
  dataProcessing: number; // ms
}

/**
 * Default thresholds for different operation types
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  apiCalls: 3000, // 3 seconds
  renderTime: 100, // 100ms
  userInteraction: 500, // 500ms
  dataProcessing: 1000, // 1 second
};

/**
 * Performance monitoring class
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]>;
  private thresholds: PerformanceThresholds;
  private enabled: boolean;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.metrics = new Map();
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.enabled = process.env.NODE_ENV === "production";
  }

  /**
   * Start monitoring an operation
   */
  startOperation(
    operationName: string,
    metadata?: Record<string, any>
  ): () => PerformanceMetrics {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metrics: PerformanceMetrics = {
        operationName,
        duration,
        startTime,
        endTime,
        metadata,
        success: true,
      };

      this.recordMetrics(metrics);
      this.checkThresholds(metrics);

      return metrics;
    };
  }

  /**
   * Record performance metrics
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    const existingMetrics = this.metrics.get(metrics.operationName) || [];
    existingMetrics.push(metrics);
    this.metrics.set(metrics.operationName, existingMetrics);

    // Log slow operations
    if (this.enabled) {
      this.logToMonitoringService(metrics);
    }
  }

  /**
   * Check if operation exceeds thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    const threshold = this.getThresholdForOperation(metrics.operationName);

    if (threshold && metrics.duration > threshold) {
      loggerTrackPerformance(metrics.operationName);
      // eslint-disable-next-line no-console
      console.warn(
        `Slow operation detected: ${
          metrics.operationName
        } took ${metrics.duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );

      // Send to Sentry
      Sentry.captureMessage(`Slow operation: ${metrics.operationName}`, {
        level: "warning",
        extra: {
          duration: metrics.duration,
          threshold,
          metadata: metrics.metadata,
        },
      });
    }
  }

  /**
   * Get threshold for specific operation type
   */
  private getThresholdForOperation(operationName: string): number | undefined {
    if (operationName.includes("api") || operationName.includes("fetch")) {
      return this.thresholds.apiCalls;
    }
    if (operationName.includes("render")) {
      return this.thresholds.renderTime;
    }
    if (
      operationName.includes("interaction") ||
      operationName.includes("click")
    ) {
      return this.thresholds.userInteraction;
    }
    if (
      operationName.includes("process") ||
      operationName.includes("transform")
    ) {
      return this.thresholds.dataProcessing;
    }
    return undefined;
  }

  /**
   * Log metrics to monitoring service
   */
  private logToMonitoringService(metrics: PerformanceMetrics): void {
    // Send to monitoring service (Sentry, DataDog, etc.)
    Sentry.startSpan(
      {
        name: metrics.operationName,
        op: metrics.operationName,
      },
      (span) => {
        // Set span data
        span?.setAttribute("duration", metrics.duration);
        span?.setAttribute("success", metrics.success);
        if (metrics.metadata) {
          Object.entries(metrics.metadata).forEach(([key, value]) => {
            span?.setAttribute(key, value as any);
          });
        }
        span?.end();
      }
    );
  }

  /**
   * Get metrics for specific operation
   */
  getMetrics(operationName: string): PerformanceMetrics[] {
    return this.metrics.get(operationName) || [];
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): Record<string, PerformanceMetrics[]> {
    const result: Record<string, PerformanceMetrics[]> = {};
    this.metrics.forEach((metrics, operationName) => {
      result[operationName] = metrics;
    });
    return result;
  }

  /**
   * Get performance statistics for an operation
   */
  getStatistics(operationName: string) {
    const metrics = this.getMetrics(operationName);

    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration);
    const avgDuration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const successRate =
      metrics.filter((m) => m.success).length / metrics.length;

    return {
      operationName,
      count: metrics.length,
      avgDuration,
      minDuration,
      maxDuration,
      successRate,
      p95Duration: this.calculatePercentile(durations, 95),
      p99Duration: this.calculatePercentile(durations, 99),
    };
  }

  /**
   * Calculate percentile value
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Clear metrics for specific operation
   */
  clearOperationMetrics(operationName: string): void {
    this.metrics.delete(operationName);
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance tracking hooks for common operations
 */
export const trackPerformance = {
  /**
   * Track API call performance
   */
  trackApiCall: (apiUrl: string) => {
    return performanceMonitor.startOperation(`api-${apiUrl}`, {
      type: "api",
      url: apiUrl,
    });
  },

  /**
   * Track component render performance
   */
  trackComponentRender: (componentName: string) => {
    return performanceMonitor.startOperation(`render-${componentName}`, {
      type: "render",
      component: componentName,
    });
  },

  /**
   * Track user interaction performance
   */
  trackUserInteraction: (interactionType: string, element?: string) => {
    return performanceMonitor.startOperation(`interaction-${interactionType}`, {
      type: "interaction",
      element,
    });
  },

  /**
   * Track data processing performance
   */
  trackDataProcessing: (operationType: string) => {
    return performanceMonitor.startOperation(`process-${operationType}`, {
      type: "processing",
      operation: operationType,
    });
  },
};

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    const endTracking = trackPerformance.trackComponentRender(componentName);
    return () => {
      endTracking();
    };
  }, [componentName]);
}

/**
 * Performance monitoring for React components
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName =
    componentName || WrappedComponent.name || "AnonymousComponent";

  return (props: P) => {
    usePerformanceMonitoring(displayName);
    return <WrappedComponent {...props} />;
  };
}

/**
 * Web Vitals monitoring
 * Track Core Web Vitals for performance analysis
 */
export function setupWebVitalsMonitoring() {
  if (typeof window === "undefined" || !window.performance) {
    return;
  }

  // Track Largest Contentful Paint (LCP)
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      // eslint-disable-next-line no-console
      console.log("LCP:", lcp.startTime);

      // Send to monitoring
      Sentry.captureMessage("Web Vitals: LCP", {
        level: lcp.startTime > 2500 ? "warning" : "info",
        extra: {
          lcp: lcp.startTime,
          rating:
            lcp.startTime > 2500
              ? "poor"
              : lcp.startTime > 1500
              ? "needs-improvement"
              : "good",
        },
      });
    }).observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("LCP monitoring not supported");
  }

  // Track First Input Delay (FID)
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        // eslint-disable-next-line no-console
        console.log("FID:", entry.processingStart - entry.startTime);

        // Send to monitoring
        if (entry.processingStart - entry.startTime > 100) {
          Sentry.captureMessage("Web Vitals: FID", {
            level: "warning",
            extra: {
              fid: entry.processingStart - entry.startTime,
              rating: "poor",
            },
          });
        }
      });
    }).observe({ entryTypes: ["first-input"] });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("FID monitoring not supported");
  }

  // Track Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          // eslint-disable-next-line no-console
          console.log("CLS:", clsValue);

          // Send to monitoring if CLS is poor
          if (clsValue > 0.25) {
            Sentry.captureMessage("Web Vitals: CLS", {
              level: "warning",
              extra: {
                cls: clsValue,
                rating: "poor",
              },
            });
          }
        }
      });
    }).observe({ entryTypes: ["layout-shift"] });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("CLS monitoring not supported");
  }
}

/**
 * Get performance report
 */
export function getPerformanceReport() {
  const allMetrics = performanceMonitor.getAllMetrics();
  const report: Record<string, any> = {};

  Object.keys(allMetrics).forEach((operationName) => {
    const stats = performanceMonitor.getStatistics(operationName);
    if (stats) {
      report[operationName] = stats;
    }
  });

  return {
    report,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };
}

/**
 * Export performance data for analysis
 */
export function exportPerformanceData() {
  const report = getPerformanceReport();

  // Convert to JSON for export
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `performance-report-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}
