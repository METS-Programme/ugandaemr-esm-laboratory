/**
 * Core common types used across the application
 */

import { OpenmrsResource } from "@openmrs/esm-framework";

/**
 * UUID and display reference pattern
 */
export interface UuidDisplay {
  uuid: string;
  display: string;
}

/**
 * Link references for REST APIs
 */
export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

/**
 * Patient identifier with proper typing
 */
export interface PatientIdentifier {
  identifier: string;
  display: string;
  uuid: string;
  identifierType: {
    uuid: string;
    display: string;
  };
  location?: {
    uuid: string;
    display: string;
  };
  preferred: boolean;
  voided: boolean;
}

/**
 * Basic patient information
 */
export interface Patient {
  uuid: string;
  display: string;
  identifiers: Array<PatientIdentifier>;
  person: Person;
}

/**
 * Person demographic information
 */
export interface Person {
  age: number;
  attributes: Array<Attribute>;
  birthDate: string;
  gender: string;
  display: string;
  preferredAddress: OpenmrsResource;
  uuid: string;
}

/**
 * Person attributes
 */
export interface Attribute {
  attributeType: OpenmrsResource;
  display: string;
  uuid: string;
  value: string | number;
}

/**
 * Provider information
 */
export interface Provider {
  uuid: string;
  display: string;
  person: UuidDisplay;
  identifier?: string;
  attributes?: Array<unknown>;
  retired: boolean;
}

/**
 * Location information
 */
export interface Location {
  uuid: string;
  display: string;
  name: string;
  description?: string;
  address1?: string;
  address2?: string;
  cityVillage?: string;
  stateProvince?: string;
  country: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  countyDistrict?: string;
  tags?: Array<UuidDisplay>;
  parentLocation?: UuidDisplay;
  childLocations?: Array<Location>;
  retired: boolean;
}

/**
 * Search types enum
 */
export enum SearchTypes {
  BASIC = "basic",
  ADVANCED = "advanced",
  SEARCH_RESULTS = "search_results",
  SCHEDULED_VISITS = "scheduled-visits",
  VISIT_FORM = "visit_form",
  QUEUE_SERVICE_FORM = "queue_service_form",
  QUEUE_ROOM_FORM = "queue_room_form",
}
