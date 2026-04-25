/**
 * Central type exports for the Laboratory ESM application
 * Organized by domain for better maintainability
 */

// Core common types
export * from "./core/common";

// Laboratory-specific types
export * from "./laboratory/tests";

// API-related types
export * from "./api/requests";
export * from "./api/responses";

// Re-export existing types during migration period
export { SearchTypes, Patient, Person, Attribute, PatientIdentifier } from "./index";
