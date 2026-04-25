/**
 * Laboratory-specific type definitions
 * Proper typed interfaces for laboratory operations
 */

import { OpenmrsResource } from "@openmrs/esm-framework";

// Laboratory value types
export type LaboratoryValue = string | number | ValueReference;

export interface ValueReference {
  uuid: string;
  display?: string;
}

// Concept and test types
export interface LaboratoryConcept {
  uuid: string;
  display: string;
  datatype: {
    display: string;
    uuid?: string;
  };
  conceptClass?: {
    uuid: string;
    display: string;
  };
  set: boolean;
  setMembers?: LaboratoryConcept[];
  answers?: ValueReference[];
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
}

// Order types
export interface LaboratoryOrder {
  uuid: string;
  orderNumber: string;
  patient: {
    uuid: string;
    display: string;
  };
  concept: LaboratoryConcept;
  encounter: {
    uuid: string;
    encounterDatetime: string;
  };
  orderer: {
    uuid: string;
    display: string;
  };
  careSetting: {
    uuid: string;
    display: string;
  };
  action: string;
  fulfillerStatus?: string;
  fulfillerComment?: string;
  dateActivated: string;
  dateStopped?: string;
  status: string;
  accessionNumber?: string;
  instructions?: string;
}

// Observation types
export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
  };
  value?: LaboratoryValue;
  status: "FINAL" | "PRELIMINARY" | "CANCELLED";
  order?: {
    uuid: string;
  };
  obsDatetime?: string;
  groupMembers?: Observation[];
}

export interface ObservationPayload {
  concept: { uuid: string };
  value?: LaboratoryValue;
  status: "FINAL" | "PRELIMINARY";
  order: { uuid: string };
  groupMembers?: ObservationPayload[];
}

export interface ObservationListPayload {
  obs: ObservationPayload[];
}

// Order update types
export interface OrderDiscontinuationPayload {
  previousOrder: string;
  type: string;
  action: "DISCONTINUE";
  careSetting: string;
  encounter: string;
  patient: string;
  concept: string;
  orderer: string;
}

// Form value types
export type FormValue = string | number | ValueReference | undefined | null;

export interface FormValues {
  [key: string]: FormValue;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// API response types
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  status?: number;
  responseBody?: {
    error?: {
      message?: string;
      fieldErrors?: Record<string, Array<{ message: string }>>;
    };
  };
}

// Transaction result types
export interface TransactionResult {
  success: boolean;
  error?: string;
  orderUpdated?: boolean;
  observationSaved?: boolean;
}

// Work list item types
export interface WorkListItem {
  uuid: string;
  orderNumber: string;
  patient: {
    uuid: string;
    display: string;
    identifiers: Array<{
      identifier: string;
      identifierType: {
        display: string;
        uuid?: string;
      };
    }>;
  };
  concept: {
    uuid: string;
    display: string;
  };
  encounter: {
    uuid: string;
  };
  orderer: {
    display: string;
  };
  careSetting: {
    display: string;
  };
  fulfillerStatus?: string;
  dateActivated: string;
  accessionNumber?: string;
  instructions?: string;
  order?: {
    uuid: string;
    dateActivated?: string;
    patient?: {
      uuid: string;
      display: string;
      identifiers: Array<{
        identifier: string;
        identifierType: {
          display: string;
          uuid?: string;
        };
      }>;
    };
    orderNumber?: string;
    accessionNumber?: string;
    concept?: {
      display: string;
    };
    action?: string;
    fulfillerStatus?: string;
    orderer?: {
      display: string;
    };
    orderType?: {
      display: string;
    };
  };
  syncTask?: {
    status?: string;
  };
}

// Sample and collection types
export interface Sample {
  uuid: string;
  sampleId: string;
  patient: {
    uuid: string;
    display: string;
  };
  sampleType: {
    uuid: string;
    display: string;
  };
  collectionDate: string;
  collectedBy: {
    uuid: string;
    display: string;
  };
  status: string;
}

// Result summary types
export interface ResultSummary {
  patientUuid: string;
  encounterUuid: string;
  testResults: Array<{
    conceptUuid: string;
    conceptDisplay: string;
    value: string | number;
    notes?: string;
  }>;
  resultDate: string;
  orderedBy: string;
  completedBy: string;
}

// Referred order types
export interface ReferredOrder {
  uuid: string;
  referringFacility: string;
  receivingFacility: string;
  orderDate: string;
  status: string;
  patient: {
    uuid: string;
    display: string;
  };
  tests: Array<{
    uuid: string;
    display: string;
  }>;
  notes?: string;
}

// Queue entry types
export interface QueueEntry {
  uuid: string;
  patient: {
    uuid: string;
    display: string;
  };
  status: {
    uuid: string;
    display: string;
  };
  priority: {
    uuid: string;
    display: string;
  };
  queue: {
    uuid: string;
    display: string;
  };
  startedAt?: Date;
  sortWeight?: number;
}
