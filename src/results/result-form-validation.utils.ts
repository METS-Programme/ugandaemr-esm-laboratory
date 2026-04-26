/**
 * Result Validation Utilities
 * Provides reusable validation functions for laboratory test results
 */

import {
  FormValue,
  LaboratoryConcept,
  ValidationResult,
} from "../types/laboratory.types";

/**
 * Checks if a value is not empty or invalid
 * Handles text, numeric, and coded values
 */
export function hasValue(value: FormValue): boolean {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  // Check for empty objects (including coded values without selection)
  if (typeof value === "object") {
    // Check if it's an empty object or has no uuid
    if (Object.keys(value).length === 0 || !value.uuid) {
      return false;
    }
    // Check if uuid is empty string
    if (value.uuid === "") {
      return false;
    }
  }

  return true;
}

/**
 * Validates numeric value against limits
 */
function validateNumericValue(
  value: FormValue,
  concept: LaboratoryConcept,
  t?: (key: string, defaultValue?: string) => string
): string | null {
  if (!hasValue(value)) {
    return null; // Empty values are checked elsewhere
  }

  const numValue = parseFloat(String(value));
  if (isNaN(numValue)) {
    return t
      ? t("invalidNumericValue", `${concept.display} must be a valid number`)
      : `${concept.display} must be a valid number`;
  }

  // Check absolute limits if they exist
  if (concept.hiAbsolute && numValue > concept.hiAbsolute) {
    return t
      ? t(
          "valueTooHigh",
          `${concept.display} value is critically high (max: ${concept.hiAbsolute})`
        )
      : `${concept.display} value is critically high (max: ${concept.hiAbsolute})`;
  }

  if (concept.lowAbsolute && numValue < concept.lowAbsolute) {
    return t
      ? t(
          "valueTooLow",
          `${concept.display} value is critically low (min: ${concept.lowAbsolute})`
        )
      : `${concept.display} value is critically low (min: ${concept.lowAbsolute})`;
  }

  return null;
}

/**
 * Validates laboratory test results before saving
 * @param concept - The test concept (can be panel or individual test)
 * @param formValues - The form values from react-hook-form
 * @param t - Optional translation function
 * @returns ValidationResult with errors if validation fails
 */
export function validateResults(
  concept: LaboratoryConcept,
  formValues: Record<string, FormValue>,
  t?: (key: string, defaultValue?: string) => string
): ValidationResult {
  const errors: string[] = [];

  // Validate panel tests
  if (concept.set && concept.setMembers?.length > 0) {
    const filledMembers = concept.setMembers.filter((member) => {
      const value = formValues[member.uuid];
      return hasValue(value);
    });

    if (filledMembers.length === 0) {
      errors.push(
        t
          ? t("panelMustHaveResult", "Panel must have at least one result")
          : "Panel must have at least one result"
      );
    }
  } else {
    // Validate individual tests
    const value = formValues[concept.uuid];
    if (!hasValue(value)) {
      errors.push(
        t
          ? t("testMustHaveValue", "Test must have a value to save")
          : "Test must have a value to save"
      );
    }
  }

  // Validate numeric ranges
  const validateNumericRanges = (testConcept: LaboratoryConcept) => {
    if (testConcept.datatype?.display === "Numeric") {
      const value = formValues[testConcept.uuid];
      const rangeError = validateNumericValue(value, testConcept, t);
      if (rangeError) {
        errors.push(rangeError);
      }
    }
  };

  // Validate ranges for panel members or single test
  if (concept.set && concept.setMembers?.length > 0) {
    concept.setMembers.forEach(validateNumericRanges);
  } else {
    validateNumericRanges(concept);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates observation payload structure before API call
 */
export function validateObservationPayload(
  obsPayload: Record<string, unknown>
): { valid: boolean; error?: string } {
  try {
    // Basic structural validation
    if (!obsPayload?.obs || !Array.isArray(obsPayload.obs)) {
      return { valid: false, error: "Invalid observation payload structure" };
    }

    // Check that at least one observation exists
    if (obsPayload.obs.length === 0) {
      return { valid: false, error: "No observations to save" };
    }

    // Validate each observation has required fields
    for (const obs of obsPayload.obs) {
      if (!obs.concept?.uuid) {
        return { valid: false, error: "Observation missing concept UUID" };
      }
      if (!obs.status) {
        return { valid: false, error: "Observation missing status" };
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error.message}`,
    };
  }
}
