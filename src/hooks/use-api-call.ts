/**
 * Custom hook for API calls with automatic error handling and loading states
 * Provides consistent API call management across the application
 */

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  openmrsFetch,
  restBaseUrl,
  showNotification,
} from "@openmrs/esm-framework";
import { ApiResult } from "../types/api/responses";

export interface UseApiCallOptions {
  showNotifications?: boolean;
  successMessage?: string;
  errorContext?: string;
}

/**
 * Hook for making API calls with automatic loading state and error handling
 * @param url - The API endpoint URL
 * @param options - Configuration options
 * @returns Object with loading state, error state, and execute function
 */
export function useApiCall<T>(options: UseApiCallOptions = {}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string[] | null>(null);

  const {
    showNotifications = true,
    successMessage,
    errorContext = "operation",
  } = options;

  const execute = useCallback(
    async (
      apiCallFunction: () => Promise<{ ok: boolean; data?: T; status?: number }>
    ): Promise<ApiResult<T>> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiCallFunction();

        if (response.ok && response.data) {
          setData(response.data);
          if (showNotifications && successMessage) {
            showNotification({
              title: t("success", "Success"),
              kind: "success",
              critical: false,
              description: successMessage,
            });
          }
          return {
            data: response.data,
            isError: false,
          };
        } else {
          const errorMessage = t("apiError", "API call failed");
          const errors = [errorMessage];
          setError(errors);

          if (showNotifications) {
            showNotification({
              title: t(`${errorContext}Error`, `${errorContext} Error`),
              kind: "error",
              critical: true,
              description: errorMessage,
            });
          }

          return {
            error: errors,
            isError: true,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : t("unexpectedError", "An unexpected error occurred");
        const errors = [errorMessage];
        setError(errors);

        if (showNotifications) {
          showNotification({
            title: t(`${errorContext}Error`, `${errorContext} Error`),
            kind: "error",
            critical: true,
            description: errorMessage,
          });
        }

        return {
          error: errors,
          isError: true,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [t, showNotifications, successMessage, errorContext]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    data,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for GET requests to a specific endpoint
 */
export function useGetApi<T>(url: string, options?: UseApiCallOptions) {
  const { execute, isLoading, data, error, reset } = useApiCall<T>(options);

  const fetchData = useCallback(async () => {
    return execute(() =>
      openmrsFetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
    );
  }, [url, execute]);

  return {
    isLoading,
    data,
    error,
    fetchData,
    reset,
  };
}

/**
 * Hook for POST requests to a specific endpoint
 */
export function usePostApi<T>(url: string, options?: UseApiCallOptions) {
  const { execute, isLoading, data, error, reset } = useApiCall<T>(options);

  const postData = useCallback(
    async (payload: unknown) => {
      return execute(() =>
        openmrsFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        })
      );
    },
    [url, execute]
  );

  return {
    isLoading,
    data,
    error,
    postData,
    reset,
  };
}
