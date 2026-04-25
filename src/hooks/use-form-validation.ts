/**
 * Custom hook for form validation
 * Provides reusable form validation logic with error handling
 */

import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
  min?: number;
  max?: number;
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export interface UseFormValidationOptions {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

/**
 * Hook for managing form validation
 * @param validationRules - Rules for each field
 * @param options - Validation behavior options
 * @returns Validation state and methods
 */
export function useFormValidation<T extends Record<string, any>>(
  validationRules: ValidationRules<T>,
  options: UseFormValidationOptions = {}
) {
  const { t } = useTranslation();
  const { validateOnBlur = true, validateOnChange = false } = options;

  const [errors, setErrors] = useState<ValidationErrors<T>>({} as ValidationErrors<T>);
  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());

  /**
   * Validate a single field against its rules
   */
  const validateField = useCallback(
    (fieldName: keyof T, value: any): string | undefined => {
      const rules = validationRules[fieldName as keyof typeof validationRules];
      if (!rules) return undefined;

      // Required validation
      if (rules.required && (!value || value === "")) {
        return t("fieldRequired", `${String(fieldName)} is required`);
      }

      // Skip other validations if field is empty and not required
      if (!value || value === "") {
        return undefined;
      }

      // Min length validation
      if (rules.minLength && typeof value === "string" && value.length < rules.minLength) {
        return t("minLength", `${String(fieldName)} must be at least ${rules.minLength} characters`);
      }

      // Max length validation
      if (rules.maxLength && typeof value === "string" && value.length > rules.maxLength) {
        return t("maxLength", `${String(fieldName)} must be no more than ${rules.maxLength} characters`);
      }

      // Pattern validation
      if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
        return t("invalidFormat", `${String(fieldName)} format is invalid`);
      }

      // Min/max validation for numbers
      if (rules.min !== undefined && typeof value === "number" && value < rules.min) {
        return t("minValue", `${String(fieldName)} must be at least ${rules.min}`);
      }

      if (rules.max !== undefined && typeof value === "number" && value > rules.max) {
        return t("maxValue", `${String(fieldName)} must be no more than ${rules.max}`);
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value);
      }

      return undefined;
    },
    [validationRules, t]
  );

  /**
   * Validate all form fields
   */
  const validateAll = useCallback(
    (formData: T): { isValid: boolean; errors: ValidationErrors<T> } => {
      const newErrors: Partial<ValidationErrors<T>> = {};

      (Object.keys(validationRules) as Array<keyof T>).forEach((fieldName) => {
        const error = validateField(fieldName as keyof T, formData[fieldName as keyof T]);
        if (error) {
          (newErrors as any)[fieldName] = error;
        }
      });

      setErrors(newErrors as ValidationErrors<T>);
      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors as ValidationErrors<T>,
      };
    },
    [validationRules, validateField]
  );

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({} as ValidationErrors<T>);
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: undefined,
    }));
  }, []);

  /**
   * Mark field as touched and validate if needed
   */
  const handleFieldBlur = useCallback(
    (fieldName: keyof T, value: any) => {
      setTouchedFields((prev) => new Set(prev).add(fieldName));

      if (validateOnBlur) {
        const error = validateField(fieldName, value);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error,
        }));
      }
    },
    [validateOnBlur, validateField]
  );

  /**
   * Handle field value change with optional validation
   */
  const handleFieldChange = useCallback(
    (fieldName: keyof T, value: any) => {
      if (validateOnChange) {
        const error = validateField(fieldName, value);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error,
        }));
      } else if (touchedFields.has(fieldName)) {
        // Clear error when user changes a field that has been touched
        clearFieldError(fieldName);
      }
    },
    [validateOnChange, validateField, touchedFields, clearFieldError]
  );

  // Computed properties
  const hasErrors = useMemo(() => Object.values(errors).some((error) => !!error), [errors]);
  const isValid = useMemo(() => !hasErrors, [hasErrors]);
  const touchedFieldsCount = touchedFields.size;

  return {
    errors,
    hasErrors,
    isValid,
    touchedFields: Array.from(touchedFields),
    touchedFieldsCount,
    validateField,
    validateAll,
    clearErrors,
    clearFieldError,
    handleFieldBlur,
    handleFieldChange,
  };
}

/**
 * Hook for validating laboratory results
 * Specialized validation for lab test values
 */
export function useLaboratoryValidation() {
  const { t } = useTranslation();

  const validateNumericResult = useCallback((value: string, concept: any): string | undefined => {
    if (!value) return undefined;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return t("invalidNumeric", "Value must be a valid number");
    }

    if (concept?.hiAbsolute && numValue > concept.hiAbsolute) {
      return t("valueTooHigh", `Value is critically high (max: ${concept.hiAbsolute})`);
    }

    if (concept?.lowAbsolute && numValue < concept.lowAbsolute) {
      return t("valueTooLow", `Value is critically low (min: ${concept.lowAbsolute})`);
    }

    return undefined;
  }, [t]);

  const validateCodedResult = useCallback((value: any): string | undefined => {
    if (!value) return undefined;

    if (typeof value === "object") {
      if (!value.uuid || value.uuid === "") {
        return t("selectOption", "Please select an option");
      }
    }

    return undefined;
  }, [t]);

  const validatePanelResults = useCallback((members: Array<any>, formValues: Record<string, any>): string | undefined => {
    const filledMembers = members.filter((member) => {
      const value = formValues[member.uuid];
      return value !== null && value !== undefined && value !== "";
    });

    if (filledMembers.length === 0) {
      return t("panelRequired", "At least one panel member must have a value");
    }

    return undefined;
  }, [t]);

  return {
    validateNumericResult,
    validateCodedResult,
    validatePanelResults,
  };
}
