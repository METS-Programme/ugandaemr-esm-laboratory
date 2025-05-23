import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export async function getAllTestOrderResults() {
  const payload = {
    action: 'RUNTASK',
    tasks: ['Request Viral Results'],
  };
  const apiUrl = `${restBaseUrl}/taskaction`;
  const abortController = new AbortController();
  return await openmrsFetch(apiUrl, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });
}

export async function syncAllTestOrders() {
  const payload = {
    action: 'RUNTASK',
    tasks: ['Send Viral Load Request to Central Server Task'],
  };
  const apiUrl = `${restBaseUrl}/taskaction`;
  const abortController = new AbortController();
  return await openmrsFetch(apiUrl, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });
}

// request results
export async function syncSelectedTestOrders(orders: string[]) {
  const apiUrl = `${restBaseUrl}/syncTestOrder`;

  const payload = JSON.stringify({
    orders: orders,
  });

  const abortController = new AbortController();
  return await openmrsFetch(apiUrl, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });
}

export async function syncSelectedTestOrderResults(orders: string[]) {
  const apiUrl = `${restBaseUrl}/requestlabresult`;

  const payload = JSON.stringify({
    orders: orders,
  });

  const abortController = new AbortController();
  return await openmrsFetch(apiUrl, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });
}
