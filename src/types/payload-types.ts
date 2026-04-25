/**
 * Request Payload Type Definitions
 * Defines standard request payload structures for OpenMRS API calls
 */

// Order update payloads
export interface OrderUpdatePayload {
  fulfillerStatus?: string;
  fulfillerComment?: string;
}

export interface AccessionOrderPayload {
  sampleId: string;
  specimenSourceId?: string;
  unProcessedOrders?: string;
  patientQueueId?: string;
  referenceLab?: string;
}

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

// Observation payloads
export interface ObservationValue {
  uuid?: string;
  display?: string;
}

export interface ObservationPayload {
  concept: { uuid: string };
  value?: string | number | ObservationValue;
  status: "FINAL" | "PRELIMINARY";
  order: { uuid: string };
  groupMembers?: Array<ObservationPayload>;
}

export interface ObservationListPayload {
  obs: Array<ObservationPayload>;
}

// Email-related payloads
export interface EmailPayload {
  patientUuid: string;
  recipientEmail: string;
  subject: string;
  message: string;
  attachmentUrls?: Array<string>;
}

// Queue-related payloads
export interface QueueEntryPayload {
  patientUuid: string;
  status: string;
  priority: number;
  locationUuid: string;
  comments?: string;
}

// Referred orders payloads
export interface ReferredOrderSyncPayload {
  orderUuids: Array<string>;
  targetFacility: string;
  syncComments?: string;
}

// Test results payloads
export interface TestResultSubmissionPayload {
  encounterUuid: string;
  testOrderUuid: string;
  results: Array<{
    conceptUuid: string;
    value: string | number;
    notes?: string;
  }>;
}

// Sample tracking payloads
export interface SampleCollectionPayload {
  patientUuid: string;
  sampleType: string;
  collectionDate: string;
  collectedBy: string;
  locationUuid: string;
  notes?: string;
}

export interface SampleTrackingPayload {
  sampleUuid: string;
  status: string;
  currentLocation: string;
  comments?: string;
}

// Visit-related payloads
export interface NewVisitPayload {
  patient: string;
  visitType: string;
  location: string;
  startDatetime: string;
  stopDatetime?: string;
}

export interface EndVisitPayload {
  stopDatetime: string;
}

// Appointment-related payloads
export interface AppointmentPayload {
  patientUuid: string;
  appointmentServiceUuid: string;
  startDateTime: string;
  endDateTime: string;
  appointmentKind: string;
  status: string;
  comments?: string;
}

// General API request wrapper
export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

// Filter criteria for API requests
export interface ResourceFilterCriteria {
  v?: string | null;
  q?: string | null;
  totalCount?: boolean | null;
  includeAll?: boolean;
  startIndex?: number;
  limit?: number;
}

// Query parameter builder result
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}
