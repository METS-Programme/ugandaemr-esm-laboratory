import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";

export interface OrderApprovalPayload {
  orderIds: string[];
  comments?: string;
  approvedBy: string;
}

export async function ApproverOrder(body: OrderApprovalPayload) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/approveorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: body,
  });
}
