import { openmrsFetch, restBaseUrl, useConfig } from "@openmrs/esm-framework";
import { useCallback } from "react";
import useSWR, { mutate } from "swr";

export interface Result {
  uuid: string;
  orderNumber: string;
  display: string;
  accessionNumber?: string;
  instructions?: string;
  careSetting: CareSetting;
  encounter: Encounter;
  fulfillerComment?: string;
  orderType: OrderType;
  concept: Concept;
  action: string;
  dateStopped?: string;
  fulfillerStatus: string;
  dateActivated: string;
  orderer: Orderer;
  urgency: string;
  patient: Patient2;
  type: string;
}

export interface CareSetting {
  uuid: string;
}

export interface Encounter {
  uuid: string;
  obs: Ob[];
}

export interface Ob {
  order?: Order;
}

export interface Order {
  uuid: string;
  display: string;
  patient: Patient;
}

export interface Patient {
  uuid: string;
  display: string;
}

export interface OrderType {
  uuid: string;
  display: string;
}

export interface Concept {
  display: string;
  uuid: string;
}

export interface Orderer {
  uuid: string;
  display: string;
}

export interface Patient2 {
  uuid: string;
  names: Name[];
  display: string;
  gender: string;
  birthdate: string;
  identifiers: Identifier[];
}

export interface Name {
  display: string;
}

export interface Identifier {
  voided: boolean;
  preferred: boolean;
  uuid: string;
  display: string;
  identifierType: IdentifierType;
}

export interface IdentifierType {
  uuid: string;
}

export function useGetOrdersWorklist(fulfillerStatus: string, dateTo?: string) {
  const { laboratoryOrderTypeUuid } = useConfig();
  const customRepresentation =
    "v=custom:(uuid,orderNumber,accessionNumber,instructions,careSetting:(uuid),encounter:(uuid,obs:(order:(uuid,display,patient:(uuid,display)))),fulfillerComment,orderType:(display),concept:(display,uuid),action,dateStopped,fulfillerStatus,dateActivated,orderer:(uuid,display),urgency,patient:(uuid,names:(display),display,gender,birthdate,identifiers:(voided,preferred,uuid,display,identifierType:(uuid))))";
  const orderTypeQuery =
    laboratoryOrderTypeUuid !== ""
      ? `orderTypes=${laboratoryOrderTypeUuid}`
      : "";
  let apiUrl = `${restBaseUrl}/order?${orderTypeQuery}&fulfillerStatus=${fulfillerStatus}&${customRepresentation}`;
  if (dateTo) {
    apiUrl += `&activatedOnOrAfterDate=${dateTo}`;
  }

  const mutateOrders = useCallback(
    () =>
      mutate(
        (key) =>
          typeof key === "string" &&
          key.startsWith(
            `${restBaseUrl}/order?orderTypes=${laboratoryOrderTypeUuid}`
          )
      ),
    [laboratoryOrderTypeUuid]
  );

  const { data, error, isLoading } = useSWR<
    { data: { results: Array<Result> } },
    Error
  >(apiUrl, openmrsFetch, { refreshInterval: 3000 });

  return {
    data: data?.data ? data.data.results : [],
    isLoading,
    isError: error,
    mutate: mutateOrders,
  };
}
