import useSWR from "swr";
import {
  type OpenmrsResource,
  openmrsFetch,
  restBaseUrl,
  type FetchResponse,
  type Visit,
} from "@openmrs/esm-framework";
import { type Order } from "@openmrs/esm-patient-common-lib";

const labEncounterRepresentation =
  "custom:(uuid,encounterDatetime,encounterType,location:(uuid,name)," +
  "patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name))," +
  "orders," +
  "obs:(uuid,obsDatetime,voided,groupMembers,formFieldNamespace,formFieldPath,order:(uuid,display),concept:(uuid,name:(uuid,name))," +
  "value:(uuid,display,name:(uuid,name),names:(uuid,conceptNameType,name))))";
const labConceptRepresentation =
  "custom:(uuid,display,name,datatype,set,answers,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units," +
  "setMembers:(uuid,display,answers,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))";
const conceptObsRepresentation =
  "custom:(uuid,display,concept:(uuid,display),groupMembers,value)";

const labOrderRepresentation =
  "uuid,orderNumber,patient:(uuid,display),concept:(uuid,display),dateActivated,dateStopped,urgency,instructions,display";

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
  encounterProviders: Array<{
    uuid: string;
    display: string;
    encounterRole: {
      uuid: string;
      display: string;
    };
    provider: {
      uuid: string;
      person: {
        uuid: string;
        display: string;
      };
    };
  }>;
  encounterType: {
    uuid: string;
    display: string;
  };
  visit?: Visit;
  obs: Array<Observation>;
  orders: Array<Order>;
  diagnoses: Array<Diagnosis>;
  patient: OpenmrsResource;
  location: OpenmrsResource;
}

export interface Observation {
  uuid: string;
  display: string;
  concept: {
    uuid: string;
    display: string;
  };
  obsGroup: any;
  obsDatetime: string;
  groupMembers?: Array<Observation>;
  value: {
    uuid: string;
    display: string;
  };
  location: OpenmrsResource;
  order: Order;
  status: string;
}

export interface Diagnosis {
  uuid: string;
  display: string;
  diagnosis: {
    coded?: {
      uuid: string;
      display?: string;
    };
    nonCoded?: string;
  };
  certainty: string;
  rank: number;
}

export interface LabOrderConcept {
  uuid: string;
  display: string;
  name?: ConceptName;
  datatype: Datatype;
  set: boolean;
  version: string;
  retired: boolean;
  descriptions: Array<Description>;
  mappings?: Array<Mapping>;
  answers?: Array<OpenmrsResource>;
  setMembers?: Array<LabOrderConcept>;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
}

export interface ConceptName {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
}

export interface Datatype {
  uuid: string;
  display: string;
  name: string;
  description: string;
  hl7Abbreviation: string;
  retired: boolean;
  resourceVersion: string;
}

export interface Description {
  display: string;
  uuid: string;
  description: string;
  locale: string;
  resourceVersion: string;
}

export interface Mapping {
  display: string;
  uuid: string;
  conceptReferenceTerm: OpenmrsResource;
  conceptMapType: OpenmrsResource;
  resourceVersion: string;
}

export function useOrderConceptByUuid(uuid: string) {
  const apiUrl = `${restBaseUrl}/concept/${uuid}?v=${labConceptRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    { data: LabOrderConcept },
    Error
  >(apiUrl, openmrsFetch);
  return {
    concept: data?.data,
    isLoading,
    error,
    isValidating,
    mutate,
  };
}

export function useLabEncounter(encounterUuid: string) {
  const apiUrl = `${restBaseUrl}/encounter/${encounterUuid}?v=${labEncounterRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    FetchResponse<Encounter>,
    Error
  >(apiUrl, openmrsFetch);

  return {
    encounter: data?.data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

export function usePatientLabEnounters(
  patientUuid: string,
  encounterTypeUuid: string
) {
  const apiUrl = `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${encounterTypeUuid}&v=${labEncounterRepresentation}&limit=1`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    FetchResponse<Array<Encounter>>,
    Error
  >(apiUrl, openmrsFetch);

  return {
    encounters: data?.data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
// get all orders
export function usePatientLabOrders(patientUuid: string) {
  const apiUrl = `${restBaseUrl}/order?patient=${patientUuid}&v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    FetchResponse,
    Error
  >(apiUrl, openmrsFetch);
  return {
    orders: data?.data?.results || [],
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
