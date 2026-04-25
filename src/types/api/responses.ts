/**
 * API response types
 */

import { Observation, WorkListItem } from "../laboratory/tests";

/**
 * Standard API response wrapper
 */
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

/**
 * API result with error handling
 */
export interface ApiResult<T> {
  data?: T;
  error?: string[];
  isError: boolean;
}

/**
 * Transaction result for order/observation operations
 */
export interface TransactionResult {
  success: boolean;
  error?: string;
  orderUpdated?: boolean;
  observationSaved?: boolean;
}

/**
 * Email sending response
 */
export interface SendEmailResponse {
  success: boolean;
  message: string;
}

/**
 * Work list response
 */
export interface WorkListResponse {
  results: Array<WorkListItem>;
  totalCount?: number;
  hasMore?: boolean;
}

/**
 * Concept response for laboratory tests
 */
export interface ConceptResponse {
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
  setMembers?: Array<ConceptResponse>;
  answers?: Array<{ uuid: string; display: string }>;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
  name?: {
    name: string;
    uuid: string;
  };
  versions?: string[];
  retired?: boolean;
}

/**
 * Observation response from API
 */
export interface ObservationResponse {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass?: {
      uuid: string;
      display: string;
    };
  };
  display?: string;
  groupMembers?: Array<ObservationResponse>;
  value?: Observation;
  obsDatetime: string;
  status: string;
  order?: {
    uuid: string;
    display?: string;
  };
  comment?: string;
}

/**
 * Order response from API
 */
export interface OrderResponse {
  uuid: string;
  orderNumber: string;
  display: string;
  accessionNumber?: string;
  instructions?: string;
  careSetting: {
    uuid: string;
    display: string;
  };
  encounter: {
    uuid: string;
    encounterDatetime: string;
    obs?: Array<ObservationResponse>;
  };
  fulfillerComment?: string;
  orderType?: {
    display: string;
  };
  concept: {
    uuid: string;
    display: string;
  };
  action: string;
  dateStopped?: string;
  fulfillerStatus?: string;
  dateActivated: string;
  orderer: {
    uuid: string;
    display?: string;
  };
  urgency?: string;
  patient: {
    uuid: string;
    display?: string;
    identifiers?: Array<{
      identifier: string;
      identifierType?: {
        display: string;
      };
    }>;
  };
}

/**
 * Patient information response
 */
export interface PatientResponse {
  uuid: string;
  display: string;
  identifiers: Array<{
    identifier: string;
    display: string;
    uuid: string;
    identifierType: {
      uuid: string;
      display: string;
    };
    preferred: boolean;
  }>;
  person: {
    uuid: string;
    display: string;
    gender: string;
    age: number;
    birthdate: string;
    preferredName?: {
      display: string;
    };
  };
}

/**
 * Encounter response
 */
export interface EncounterResponse {
  uuid: string;
  display: string;
  encounterDatetime: string;
  encounterType: {
    uuid: string;
    display: string;
  };
  patient: {
    uuid: string;
    display: string;
  };
  location?: {
    uuid: string;
    display: string;
  };
  form?: {
    uuid: string;
    display: string;
  };
  obs: Array<ObservationResponse>;
  orders: Array<OrderResponse>;
}

/**
 * Location response
 */
export interface LocationResponse {
  uuid: string;
  display: string;
  name: string;
  description?: string;
  address1?: string;
  address2?: string;
  cityVillage?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  parentLocation?: {
    uuid: string;
    display: string;
  };
  childLocations?: Array<LocationResponse>;
  tags?: Array<{
    uuid: string;
    display: string;
  }>;
}

/**
 * Provider response
 */
export interface ProviderResponse {
  uuid: string;
  display: string;
  person?: {
    uuid: string;
    display: string;
  };
  identifier?: string;
  attributes?: Array<{
    display: string;
    uuid: string;
    value: string | number;
    attributeType: {
      uuid: string;
      display: string;
    };
  }>;
  retired?: boolean;
}
