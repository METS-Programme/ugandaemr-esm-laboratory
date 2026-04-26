/**
 * Standardized Error Handling Utilities
 * Provides consistent error handling patterns across the application
 */

import { extractErrorMessagesFromResponse } from "./functions";
import { showNotification, showSnackbar } from "@openmrs/esm-framework";
import { logger } from "./logger";

/**
 * Standard API result type for error handling
 */
export interface ApiResult<T> {
  data?: T;
  error?: string[];
  isError: boolean;
}

/**
 * Validation function type
 */
export type ValidatorFunction = (value: unknown) => string | undefined;

/**
 * Configuration for error display behavior
 */
export interface ErrorDisplayConfig {
  showNotification?: boolean;
  critical?: boolean;
  context?: string;
  fallbackMessage?: string;
}

/**
 * Handles API calls with standardized error handling
 * @param apiCall - The API call function to execute
 * @param config - Error display configuration
 * @param t - Translation function
 * @returns Promise with standardized result structure
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<{
    ok: boolean;
    data?: T;
    status?: number;
    responseBody?: any;
  }>,
  config: ErrorDisplayConfig = {},
  t?: (key: string, defaultValue?: string) => string
): Promise<ApiResult<T>> {
  const {
    showNotification: showError = true,
    critical = true,
    context = "operation",
    fallbackMessage,
  } = config;

  try {
    const response = await apiCall();

    if (response.ok) {
      return {
        data: response.data,
        isError: false,
      };
    } else {
      const errorMessages = extractErrorMessagesFromResponse(response);

      if (showError && t) {
        showNotification({
          title: t(`${context}Error`),
          kind: "error",
          critical: critical,
          description:
            errorMessages.join(", ") || fallbackMessage || t("unexpectedError"),
        });
      }

      return {
        error: errorMessages,
        isError: true,
      };
    }
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);

    if (showError && t) {
      showNotification({
        title: t(`${context}Error`),
        kind: "error",
        critical: critical,
        description:
          errorMessages.join(", ") || fallbackMessage || t("unexpectedError"),
      });
    }

    return {
      error: errorMessages,
      isError: true,
    };
  }
}

/**
 * Displays success message using snackbar
 * @param message - The success message to display
 * @param t - Translation function
 */
export function handleSuccess(
  message: string,
  t?: (key: string, defaultValue?: string) => string
): void {
  if (t) {
    showSnackbar({
      title: t("success"),
      kind: "success",
      subtitle: message,
    });
  }
}

/**
 * Displays error notification with optional context
 * @param error - Error object or message
 * @param context - Operation context for error message
 * @param t - Translation function
 */
export function handleError(
  error: Error | string | string[] | any,
  context: string = "operation",
  t?: (key: string, defaultValue?: string) => string
): void {
  let errorMessage: string;

  if (typeof error === "string") {
    errorMessage = error;
  } else if (Array.isArray(error)) {
    errorMessage = error.join(", ");
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = String(error);
  }

  if (t) {
    showNotification({
      title: t(`${context}Error`),
      kind: "error",
      critical: true,
      description: errorMessage || t("unexpectedError"),
    });
  } else {
    logger.error(`${context} error:`, errorMessage);
  }
}

/**
 * Wraps an async function with error handling and loading state management
 * @param asyncFn - The async function to execute
 * @param setLoading - Function to set loading state
 * @param config - Error handling configuration
 * @param t - Translation function
 * @returns Promise with standardized result
 */
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  setLoading?: (loading: boolean) => void,
  config: ErrorDisplayConfig = {},
  t?: (key: string, defaultValue?: string) => string
): Promise<ApiResult<T>> {
  if (setLoading) {
    setLoading(true);
  }

  try {
    const result = await asyncFn();
    return {
      data: result,
      isError: false,
    };
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);

    if (config.showNotification !== false && t) {
      showNotification({
        title: t(`${config.context || "operation"}Error`),
        kind: "error",
        critical: config.critical !== false,
        description:
          errorMessages.join(", ") ||
          config.fallbackMessage ||
          t("unexpectedError"),
      });
    }

    return {
      error: errorMessages,
      isError: true,
    };
  } finally {
    if (setLoading) {
      setLoading(false);
    }
  }
}

/**
 * Validates form data and returns error messages if validation fails
 * @param data - The data to validate
 * @param rules - Validation rules object
 * @param t - Translation function
 * @returns Array of error messages (empty if validation passes)
 */
export function validateFormData(
  data: Record<string, unknown>,
  rules: Record<string, ValidatorFunction>,
  t?: (key: string, defaultValue?: string) => string
): string[] {
  const errors: string[] = [];

  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(data[field]);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}

/**
 * Creates a standardized error for API responses
 * @param message - Error message
 * @param status - HTTP status code
 * @param details - Additional error details
 */
export class ApiError extends Error {
  public status?: number;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    status?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Logs errors to console with consistent formatting
 * @param error - Error to log
 * @param context - Operation context
 * @param additionalInfo - Additional information to log
 */
export function logError(
  error: Error | string | unknown,
  context: string = "operation",
  additionalInfo?: Record<string, unknown>
): void {
  const errorMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : String(error);

  const errorInfo = {
    context,
    timestamp: new Date().toISOString(),
    message: errorMessage,
    ...additionalInfo,
  };

  logger.error(`[${context}] Error:`, errorInfo);

  // In production, this could send errors to a monitoring service
  if (process.env.NODE_ENV === "production") {
    // Integration point for error tracking service
    // Example: Sentry.captureException(error, { extra: additionalInfo });
    logger.warn("Production error tracking not configured");
  }
}
