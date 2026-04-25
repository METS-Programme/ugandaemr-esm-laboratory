/**
 * Laboratory test and order related types
 */

import { UuidDisplay } from "../core/common";

/**
 * Laboratory value types (supports text, numeric, and coded values)
 */
export type LaboratoryValue = string | number | ValueReference;

/**
 * Reference value for coded laboratory results
 */
export interface ValueReference {
  uuid: string;
  display?: string;
}

/**
 * Laboratory concept with datatype and set member information
 */
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

/**
 * Laboratory order information
 */
export interface LaboratoryOrder {
  uuid: string;
  orderNumber: string;
  accessionNumber?: string;
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
  instructions?: string;
  urgency?: string;
}

/**
 * Observation (test result) information
 */
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
  comment?: string;
}

/**
 * Work list item representation
 */
export interface WorkListItem {
  uuid: string;
  orderNumber: string;
  display: string;
  accessionNumber?: string;
  instructions?: string;
  patient: {
    uuid: string;
    display: string;
    identifiers: Array<{
      identifier: string;
      identifierType: {
        display: string;
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
  action?: string;
  dateStopped?: string;
}

/**
 * Sample information for tracking
 */
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
  currentLocation?: {
    uuid: string;
    display: string;
  };
  trackingHistory?: Array<{
    status: string;
    location: string;
    timestamp: string;
    updatedBy: string;
  }>;
}

/**
 * Referred order information
 */
export interface ReferredOrder {
  uuid: string;
  referringFacility: string;
  receivingFacility: string;
  orderDate: string;
  status: string;
  syncStatus?: string;
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

/**
 * Result summary for patient chart
 */
export interface ResultSummary {
  patientUuid: string;
  encounterUuid: string;
  testResults: Array<{
    conceptUuid: string;
    conceptDisplay: string;
    value: string | number;
    notes?: string;
    referenceRange?: string;
    abnormal?: boolean;
    units?: string;
  }>;
  resultDate: string;
  orderedBy: string;
  completedBy: string;
}

/**
 * Order status enumeration
 */
export enum OrderStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DISCONTINUED = "DISCONTINUED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

/**
 * Test sample status enumeration
 */
export enum SampleStatus {
  COLLECTED = "COLLECTED",
  IN_TRANSIT = "IN_TRANSIT",
  RECEIVED = "RECEIVED",
  IN_PROCESSING = "IN_PROCESSING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  LOST = "LOST",
}
