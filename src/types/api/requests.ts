/**
 * API request payload types
 */

import { Observation, LaboratoryValue } from "../laboratory/tests";

/**
 * Observation payload for saving test results
 */
export interface ObservationPayload {
  concept: { uuid: string };
  value?: LaboratoryValue;
  status: "FINAL" | "PRELIMINARY";
  order: { uuid: string };
  groupMembers?: ObservationPayload[];
}

/**
 * List of observations for batch saving
 */
export interface ObservationListPayload {
  obs: ObservationPayload[];
}

/**
 * Order discontinuation payload
 */
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

/**
 * Order rejection payload
 */
export interface OrderRejectionPayload {
  fulfillerStatus: string;
  fulfillerComment?: string;
}

/**
 * Order update payload
 */
export interface OrderUpdatePayload {
  fulfillerStatus?: string;
  fulfillerComment?: string;
  accessionNumber?: string;
}

/**
 * Order approval payload
 */
export interface OrderApprovalPayload {
  orderIds: string[];
  comments?: string;
  approvedBy: string;
}

/**
 * Sample collection payload
 */
export interface SampleCollectionPayload {
  patientUuid: string;
  sampleType: string;
  collectionDate: string;
  collectedBy: string;
  locationUuid: string;
  notes?: string;
}

/**
 * Email sending payload
 */
export interface EmailPayload {
  patientUuid: string;
  recipientEmail: string;
  subject: string;
  message: string;
  attachmentUrls?: Array<string>;
}

/**
 * Queue entry payload
 */
export interface QueueEntryPayload {
  visit: { uuid: string };
  queueEntry: {
    status: { uuid: string };
    priority: { uuid: string };
    queue: { uuid: string };
    patient: { uuid: string };
    startedAt: Date;
    sortWeight: number;
  };
}

/**
 * Referred order sync payload
 */
export interface ReferredOrderSyncPayload {
  orderUuids: Array<string>;
  targetFacility: string;
  syncComments?: string;
}

/**
 * Visit-related payloads
 */
export interface NewVisitPayload {
  patient: string;
  visitType: string;
  location: string;
  startDatetime: string;
  stopDatetime?: string;
  attributes?: Array<{
    attributeType: string;
    value: string;
  }>;
}

export interface EndVisitPayload {
  stopDatetime: string;
}

/**
 * Appointment-related payloads
 */
export interface AppointmentPayload {
  patientUuid: string;
  appointmentServiceUuid: string;
  startDateTime: string;
  endDateTime: string;
  appointmentKind: string;
  status: string;
  comments?: string;
}
