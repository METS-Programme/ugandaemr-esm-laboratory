/**
 * Component Error Management
 * Examples and patterns for using error handling utilities
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { handleApiCall, handleSuccess, handleError } from "./error-handling";
import {
  withErrorBoundary,
  LaboratoryErrorBoundary,
} from "../components/error-boundary.component";
import { Button, TextInput } from "@carbon/react";

/**
 * Example 1: Using handleApiCall for API operations
 */
export function ExampleApiOperations() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const performOperation = async () => {
    setIsLoading(true);

    try {
      const result = await handleApiCall(
        () =>
          fetch("/api/some-endpoint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: "value" }),
          }),
        {
          context: "saveData",
          showNotification: true,
          critical: false,
        },
        t
      );

      if (result.isError) {
        // Handle error case silently
      } else {
        handleSuccess("Data saved successfully", t);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={performOperation} disabled={isLoading}>
      {isLoading ? t("loading") : "Save Data"}
    </Button>
  );
}

/**
 * Example 2: Using error boundary for component error handling
 */
function RiskyComponent({ data }: { data: string }) {
  // This component might throw errors
  if (!data) {
    throw new Error("Data is required");
  }

  return <div>{data}</div>;
}

export function SafeComponentWrapper() {
  // Using HOC pattern
  const SafeRiskyComponent = withErrorBoundary(RiskyComponent);

  return (
    <LaboratoryErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Component error:", error);
        // Send to error tracking service
      }}
    >
      <RiskyComponent data="Some data" />
    </LaboratoryErrorBoundary>
  );
}

/**
 * Example 3: Form validation with error handling
 */
export function ExampleFormWithValidation() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email format";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors([emailError]);
      handleError(emailError, "formValidation", t);
      return;
    }

    setErrors([]);

    try {
      // Perform API call
      const result = await handleApiCall(
        () =>
          fetch("/api/submit", {
            method: "POST",
            body: JSON.stringify({ email }),
          }),
        { context: "formSubmit" },
        t
      );

      if (!result.isError) {
        handleSuccess("Form submitted successfully", t);
      }
    } catch (error) {
      handleError(error, "formSubmit", t);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        labelText="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        invalid={errors.length > 0}
        invalidText={errors.join(", ")}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

/**
 * Example 4: Custom error boundary fallback
 */
function CustomFallback({ error }: { error?: Error }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Oops! Something went wrong</h2>
      <p>We're sorry for the inconvenience. Please try again later.</p>
      {error && (
        <details style={{ marginTop: "1rem" }}>
          <summary>Technical Details</summary>
          <pre style={{ textAlign: "left", marginTop: "1rem" }}>
            {error.message}
          </pre>
        </details>
      )}
      <Button
        onClick={() => window.location.reload()}
        style={{ marginTop: "1rem" }}
      >
        Reload Page
      </Button>
    </div>
  );
}

export function ExampleWithCustomFallback() {
  return (
    <LaboratoryErrorBoundary fallback={<CustomFallback />}>
      <RiskyComponent data="Test data" />
    </LaboratoryErrorBoundary>
  );
}
