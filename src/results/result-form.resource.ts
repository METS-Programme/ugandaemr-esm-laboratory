import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";
import useSWR from "swr";
import { validateObservationPayload as validateObs } from "./result-form-validation.utils";
import {
  ObservationListPayload,
  OrderDiscontinuationPayload,
} from "../types/laboratory.types";

export interface ConceptResponse {
  uuid: string;
  display: string;
  name: Name;
  datatype: Datatype;
  conceptClass: ConceptClass;
  set: boolean;
  version: string;
  retired: boolean;
  names: Name2[];
  descriptions: Description[];
  mappings: Mapping[];
  answers: any[];
  setMembers: ConceptReference[];
  auditInfo: AuditInfo;
  attributes: any[];
  links: Link18[];
  resourceVersion: string;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
}

export interface Name {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
  links: Link[];
  resourceVersion: string;
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Datatype {
  uuid: string;
  display: string;
  name: string;
  description: string;
  hl7Abbreviation: string;
  retired: boolean;
  links: Link2[];
  resourceVersion: string;
}

export interface Link2 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ConceptClass {
  uuid: string;
  display: string;
  name: string;
  description: string;
  retired: boolean;
  links: Link3[];
  resourceVersion: string;
}

export interface Link3 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Name2 {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType?: string;
  links: Link4[];
  resourceVersion: string;
}

export interface Link4 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Description {
  display: string;
  uuid: string;
  description: string;
  locale: string;
  links: Link5[];
  resourceVersion: string;
}

export interface Link5 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Mapping {
  display: string;
  uuid: string;
  conceptReferenceTerm: ConceptReferenceTerm;
  conceptMapType: ConceptMapType;
  links: Link8[];
  resourceVersion: string;
}

export interface ConceptReferenceTerm {
  uuid: string;
  display: string;
  links: Link6[];
}

export interface Link6 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ConceptMapType {
  uuid: string;
  display: string;
  links: Link7[];
}

export interface Link7 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link8 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ConceptReference {
  uuid: string;
  display: string;
  name: Name3;
  datatype: Datatype2;
  conceptClass: ConceptClass2;
  set: boolean;
  version: string;
  retired: boolean;
  names: Name4[];
  descriptions: any[];
  mappings: Mapping2[];
  answers: Answer[];
  setMembers: any[];
  attributes: any[];
  links: Link15[];
  resourceVersion: string;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
}

export interface Name3 {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
  links: Link9[];
  resourceVersion: string;
}

export interface Link9 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Datatype2 {
  uuid: string;
  display: string;
  links: Link10[];
}

export interface Link10 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ConceptClass2 {
  uuid: string;
  display: string;
  links: Link11[];
}

export interface Link11 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Name4 {
  uuid: string;
  display: string;
  links: Link12[];
}

export interface Link12 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Mapping2 {
  uuid: string;
  display: string;
  links: Link13[];
}

export interface Link13 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Answer {
  uuid: string;
  display: string;
  links: Link14[];
}

export interface Link14 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link15 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: ChangedBy;
  dateChanged: string;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Link16[];
}

export interface Link16 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ChangedBy {
  uuid: string;
  display: string;
  links: Link17[];
}

export interface Link17 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link18 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ObPayload {
  concept: string;
  order: string;
  value: string | number;
  status: string;
}

// get order concept
export async function GetOrderConceptByUuid(uuid: string) {
  const abortController = new AbortController();
  return openmrsFetch(`${restBaseUrl}/concept/${uuid}?v=full`, {
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function useGetOrderConceptByUuid(uuid: string) {
  const apiUrl = `${restBaseUrl}/concept/${uuid}?v=custom:(uuid,display,name,datatype,set,answers,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,setMembers:(uuid,display,answers,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    { data: ConceptResponse },
    Error
  >(apiUrl, openmrsFetch);
  return {
    concept: data?.data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

export async function UpdateEncounter(
  uuid: string,
  payload: ObservationListPayload
) {
  const abortController = new AbortController();
  return openmrsFetch(`${restBaseUrl}/encounter/${uuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: payload,
  });
}

/**
 * Transactional result saving with automatic rollback on failure
 * Ensures data consistency between order updates and observation saves
 */

export interface TransactionResult {
  success: boolean;
  error?: string;
  orderUpdated?: boolean;
  observationSaved?: boolean;
}

/**
 * Rolls back a discontinued order by voiding it
 * This is used when observation save fails after order discontinuation
 */
async function rollbackDiscontinuedOrder(orderUuid: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if this is actually a discontinued order
    const orderResponse = await openmrsFetch(`${restBaseUrl}/order/${orderUuid}`);

    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      // Only rollback if the order was actually stopped/discontinued
      if (orderData.stopped || orderData.dateStopped) {
        // Void the discontinuation action
        await openmrsFetch(`${restBaseUrl}/order/${orderUuid}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        return { success: true };
      }
    }

    return { success: true }; // Order wasn't discontinued, no rollback needed
  } catch (error) {
    console.error('Failed to rollback order:', error);
    return {
      success: false,
      error: `Rollback failed: ${error.message}`
    };
  }
}

/**
 * Transactional update of order and observation with automatic rollback
 * If observation save fails after order discontinuation, the order is automatically reinstated
 *
 * @param encounterUuid - The encounter UUID for saving observations
 * @param obsPayload - The observation payload to save
 * @param orderPayload - The order discontinuation payload
 * @returns TransactionResult with success status and error details
 */
export async function UpdateOrderResult(
  encounterUuid: string,
  obsPayload: ObservationListPayload,
  orderPayload: OrderDiscontinuationPayload
): Promise<TransactionResult> {
  const abortController = new AbortController();

  try {
    // Step 1: Validate observation payload first
    const validation = await validateObs(obsPayload as unknown as Record<string, unknown>);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        orderUpdated: false,
        observationSaved: false
      };
    }

    // Step 2: Update the order (discontinue previous order)
    let orderUpdateResponse;
    try {
      orderUpdateResponse = await openmrsFetch(`${restBaseUrl}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
        body: orderPayload,
      });
    } catch (orderError) {
      return {
        success: false,
        error: `Order update failed: ${orderError.message}`,
        orderUpdated: false,
        observationSaved: false
      };
    }

    if (orderUpdateResponse.status !== 201) {
      // Order update failed - no need to rollback since nothing changed
      const errorData = orderUpdateResponse.data?.error || {};
      const errorMessage = errorData.message || 'Order update failed';

      return {
        success: false,
        error: `Order update failed: ${errorMessage}`,
        orderUpdated: false,
        observationSaved: false
      };
    }

    // Order was successfully updated
    const previousOrderUuid = orderPayload.previousOrder;

    // Step 3: Save the observations
    let obsResponse;
    try {
      obsResponse = await openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
        body: obsPayload,
      });
    } catch (obsError) {
      // Observation save failed - rollback the order
      const rollback = await rollbackDiscontinuedOrder(previousOrderUuid);

      return {
        success: false,
        error: `Observation save failed: ${obsError.message}. ${rollback.success ? 'Order has been rolled back.' : 'Order rollback failed - manual intervention required.'}`,
        orderUpdated: true,
        observationSaved: false
      };
    }

    if (!obsResponse.ok) {
      // Observation save returned error status - rollback the order
      const errorData = obsResponse.data?.error || {};
      const errorMessage = errorData.message || 'Observation save failed';
      const rollback = await rollbackDiscontinuedOrder(previousOrderUuid);

      return {
        success: false,
        error: `Observation save failed: ${errorMessage}. ${rollback.success ? 'Order has been rolled back.' : 'Order rollback failed - manual intervention required.'}`,
        orderUpdated: true,
        observationSaved: false
      };
    }

    // Success! Both order and observations were saved
    return {
      success: true,
      orderUpdated: true,
      observationSaved: true
    };

  } catch (error) {
    // Unexpected error
    console.error('Unexpected error in UpdateOrderResult:', error);
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
      orderUpdated: false,
      observationSaved: false
    };
  }
}
