/**
 * Domain Type Definitions
 * Shared domain models and business entities used throughout the application
 */

// Address types
export interface Address {
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  address4?: string | null;
  address5?: string | null;
  address6?: string | null;
  cityVillage?: string | null;
  countyDistrict?: string | null;
  stateProvince?: string | null;
  country?: string | null;
  postalCode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  preferred?: boolean;
}

// Person attributes
export interface PersonAttribute {
  display: string;
  uuid: string;
  value: string | number;
  attributeType: {
    uuid: string;
    display: string;
    format?: string;
  };
}

// Patient identifier
export interface PatientIdentifier {
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
}

// Laboratory-specific types
export interface LabTestOrder {
  uuid: string;
  orderNumber: string;
  patient: {
    uuid: string;
    display: string;
    identifiers: Array<PatientIdentifier>;
  };
  concept: {
    uuid: string;
    display: string;
    isSet?: boolean;
    setMembers?: Array<LabTestConcept>;
  };
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
  fulfillerStatus?: string;
  fulfillerComment?: string;
  dateActivated: string;
  status: string;
  action?: string;
}

export interface LabTestConcept {
  uuid: string;
  display: string;
  datatype: {
    display: string;
  };
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
  answers?: Array<{ uuid: string; display: string }>;
}

export interface LabTestResult {
  conceptUuid: string;
  conceptDisplay: string;
  value: string | number;
  notes?: string;
  referenceRange?: string;
  abnormal?: boolean;
  units?: string;
}

export interface LabResultPanel {
  panelUuid: string;
  panelDisplay: string;
  results: Array<LabTestResult>;
}

// Work list items
export interface WorkListItem {
  uuid: string;
  priority: number;
  status: string;
  patient: {
    uuid: string;
    display: string;
    age?: number;
    gender?: string;
    identifiers: Array<PatientIdentifier>;
  };
  order: {
    uuid: string;
    orderNumber: string;
    concept: {
      uuid: string;
      display: string;
    };
    dateActivated: string;
  };
  waitingTime?: {
    hours: number;
    minutes: number;
  };
}

// Queue management
export interface QueueItem {
  uuid: string;
  display: string;
  patient: {
    uuid: string;
    display: string;
  };
  queue: {
    uuid: string;
    display: string;
  };
  status: string;
  priority: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// Referred orders
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
  syncStatus?: string;
}

// Sample tracking
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
  location: {
    uuid: string;
    display: string;
  };
  status: string;
  currentLocation: {
    uuid: string;
    display: string;
  };
  trackingHistory: Array<{
    status: string;
    location: string;
    timestamp: string;
    updatedBy: string;
  }>;
}

// Result summary
export interface ResultSummary {
  patientUuid: string;
  encounterUuid: string;
  testResults: Array<LabResultPanel | LabTestResult>;
  resultDate: string;
  orderedBy: string;
  completedBy: string;
  notes?: string;
}

// Status types
export type OrderStatus =
  | "NEW"
  | "RECEIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type SampleStatus =
  | "COLLECTED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "IN_PROCESSING"
  | "COMPLETED"
  | "REJECTED"
  | "LOST";

export type ReferralStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SYNCED"
  | "COMPLETED";

// Utility types
export type Uuid = string;
export type DateTime = string;
export type DateOnly = string;

// Pagination info
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
