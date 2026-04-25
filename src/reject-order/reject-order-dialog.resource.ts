import {
  FetchResponse,
  openmrsFetch,
  restBaseUrl,
  useConfig,
} from "@openmrs/esm-framework";

export interface OrderRejectionPayload {
  fulfillerStatus: string;
  fulfillerComment?: string;
}

export async function RejectOrder(uuid: string, body: OrderRejectionPayload) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/order/${uuid}/fulfillerdetails/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: body,
  });
}
