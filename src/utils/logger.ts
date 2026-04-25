/**
 * Standardized Logging Utility
 * Provides consistent logging across the application with environment-aware behavior
 */

/**
 * Log levels for different types of messages
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  enableConsole: boolean;
  minLevel: LogLevel;
  enableTimestamps: boolean;
}

/**
 * Production-ready logger utility
 * - Only logs important messages in production
 * - Enables debug logs in development
 * - Provides consistent formatting
 * - Prepares for future integration with monitoring services
 */
export const logger = {
  /**
   * Debug level logging - only enabled in development
   * Use for detailed information during development and troubleshooting
   */
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Info level logging - general informational messages
   * Use for normal application flow events
   */
  info: (message: string, ...args: unknown[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },

  /**
   * Warning level logging - potential issues
   * Use for unexpected but recoverable situations
   */
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Error level logging - error conditions
   * Use for application errors and exceptions
   */
  error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, error, ...args);
  },

  /**
   * Structured logging with context
   * Provides consistent log format for monitoring and analysis
   */
  logWithContext: (level: LogLevel, message: string, context?: string, data?: unknown) => {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    };

    switch (level) {
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === "development") {
          console.log(JSON.stringify(logEntry, null, 2));
        }
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(logEntry, null, 2));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(logEntry, null, 2));
        break;
      case LogLevel.ERROR:
        console.error(JSON.stringify(logEntry, null, 2));
        break;
    }
  },
};

/**
 * Performance logging utility
 * Tracks execution time for operations
 */
export class PerformanceLogger {
  private startTime: number;
  private operationName: string;

  constructor(operationName: string) {
    this.operationName = operationName;
    this.startTime = performance.now();
  }

  /**
   * Ends the performance measurement and logs the result
   */
  end(thresholdMs?: number): void {
    const duration = performance.now() - this.startTime;

    if (thresholdMs && duration > thresholdMs) {
      logger.warn(
        `Slow operation detected: ${this.operationName} took ${duration.toFixed(2)}ms (threshold: ${thresholdMs}ms)`
      );
    } else {
      logger.debug(`${this.operationName} completed in ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Gets the current duration without ending the measurement
   */
  getCurrentDuration(): number {
    return performance.now() - this.startTime;
  }
}

/**
 * Creates a performance logger for tracking operation duration
 * @param operationName - Name of the operation being tracked
 * @returns PerformanceLogger instance
 */
export function trackPerformance(operationName: string): PerformanceLogger {
  return new PerformanceLogger(operationName);
}

/**
 * React Hook for logging component lifecycle events
 * @param componentName - Name of the component
 */
export function useComponentLogging(componentName: string) {
  logger.debug(`${componentName} mounted`);

  // Note: This would be used in React components with useEffect
  // For now, it's a utility function that can be called manually
}

/**
 * Error tracking for production (placeholder for future integration)
 * This would integrate with services like Sentry, LogRocket, etc.
 */
export function trackError(error: Error, context?: string, additionalInfo?: Record<string, unknown>) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    ...additionalInfo,
  };

  logger.error(`Error tracked: ${context || "unknown context"}`, errorInfo);

  // TODO: Send to error tracking service in production
  if (process.env.NODE_ENV === "production") {
    // Integration point for Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { extra: additionalInfo });
  }
}

/**
 * API call logging wrapper
 * Logs API request/response with timing information
 */
export async function logApiCall<T>(
  apiCall: () => Promise<T>,
  context: string
): Promise<T> {
  const perf = new PerformanceLogger(context);

  try {
    logger.debug(`API call started: ${context}`);
    const result = await apiCall();
    perf.end(3000); // Warn if API call takes longer than 3 seconds
    logger.debug(`API call completed: ${context}`);
    return result;
  } catch (error) {
    perf.end();
    logger.error(`API call failed: ${context}`, error);
    throw error;
  }
}
