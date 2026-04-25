/**
 * API Response Type Definitions
 * Defines standard response structures for OpenMRS API calls
 */

import { OpenmrsResource } from "@openmrs/esm-framework";

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

// Paginated response structure
export interface PaginatedResponse<T> {
  results: Array<T>;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Order-related responses
export interface OrderResponse {
  uuid: string;
  orderNumber: string;
  action: string;
  careSetting: {
    uuid: string;
    display: string;
  };
  concept: {
    uuid: string;
    display: string;
  };
  encounter: {
    uuid: string;
  };
  patient: {
    uuid: string;
    display: string;
  };
  orderer: {
    uuid: string;
    display: string;
  };
  fulfillerStatus: string;
  fulfillerComment?: string;
  dateActivated: string;
  autoExpireDate?: string;
  stoppedDate?: string;
}

export interface LaboratoryResponse {
  results: Array<OrderResponse>;
}

// Encounter-related responses
export interface EncounterResponse {
  uuid: string;
  encounterDatetime: string;
  encounterType: {
    uuid: string;
    display: string;
  };
  patient: {
    uuid: string;
    display: string;
  };
  location: {
    uuid: string;
    display: string;
  };
  obs: Array<ObservationResponse>;
}

export interface ObservationResponse {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
  };
  value?: string | number | { uuid: string; display: string };
  obsDatetime: string;
  status: "FINAL" | "PRELIMINARY";
  order?: {
    uuid: string;
    orderNumber: string;
  };
}

// Concept-related responses
export interface ConceptResponse {
  uuid: string;
  display: string;
  name: {
    display: string;
    uuid: string;
    name: string;
    locale: string;
    localePreferred: boolean;
    conceptNameType: string;
  };
  datatype: {
    uuid: string;
    display: string;
  };
  conceptClass: {
    uuid: string;
    display: string;
  };
  set: boolean;
  version: string;
  retired: boolean;
  names: Array<{
    display: string;
    uuid: string;
    name: string;
    locale: string;
    localePreferred: boolean;
    conceptNameType: string;
  }>;
  descriptions: Array<{
    display: string;
    uuid: string;
    locale: string;
  }>;
  mappings: Array<{
    display: string;
    uuid: string;
    code: string;
  }>;
  answers: Array<ConceptReference>;
  setMembers: Array<ConceptReference>;
  attributes: Array<{
    display: string;
    uuid: string;
    value: string;
  }>;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
  resourceVersion: string;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
}

export interface ConceptReference {
  uuid: string;
  display: string;
  name?: {
    display: string;
  };
  datatype?: {
    display: string;
  };
  conceptClass?: {
    display: string;
  };
  set?: boolean;
  setMembers?: Array<ConceptReference>;
  answers?: Array<ConceptReference>;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
}

// Patient-related responses
export interface PatientResponse {
  uuid: string;
  display: string;
  identifiers: Array<{
    identifier: string;
    identifierType: {
      uuid: string;
      display: string;
    };
    location: {
      uuid: string;
      display: string;
    };
    preferred: boolean;
  }>;
  person: {
    uuid: string;
    display: string;
    age: number;
    birthDate: string;
    gender: string;
    preferredAddress: {
      display: string;
    };
    attributes: Array<{
      display: string;
      uuid: string;
      value: string | number;
      attributeType: {
        uuid: string;
        display: string;
      };
    }>;
  };
}

// Queue-related responses
export interface QueueEntryResponse {
  uuid: string;
  display: string;
  patient: {
    uuid: string;
    display: string;
  };
  status: string;
  priority: number;
  queueEntryDate: string;
}

// Error response structure
export interface ErrorResponse {
  error: {
    message: string;
    fieldErrors?: Record<string, Array<{ message: string }>>;
  };
  responseStatus: number;
}
