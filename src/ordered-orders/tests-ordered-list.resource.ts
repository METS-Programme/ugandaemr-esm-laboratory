import { formatDate, openmrsFetch, parseDate } from "@openmrs/esm-framework";
import dayjs from "dayjs";
import useSWR from "swr";
export interface PatientQueue {
  uuid: string;
  creator: {
    uuid: string;
    display: string;
    username: string;
    systemId: string;
    person: UuidDisplay;
    privileges: [];
    roles: Array<UuidDisplay>;
    retired: boolean;
  };
  dateCreated: string;
  changedBy?: string;
  dateChanged?: string;
  voided: boolean;
  dateVoided: string;
  voidedBy: string;
  patient: {
    uuid: string;
    display: string;
    identifiers: Array<UuidDisplay>;
    person: {
      uuid: string;
      display: string;
      gender: string;
      age: number;
      birthdate: string;
      birthdateEstimated: boolean;
      dead: boolean;
      deathDate?: string;
      causeOfDeath?: string;
      preferredName: UuidDisplay;
      preferredAddress: UuidDisplay;
      attributes: [];
      voided: boolean;
      birthtime?: string;
      deathdateEstimated: boolean;
    };
    voided: boolean;
  };
  provider: {
    uuid: string;
    display: string;
    person: UuidDisplay;
    identifier: string;
    attributes: [];
    retired: boolean;
  };
  locationFrom: QueueLocation;
  locationTo: QueueLocation;
  // encounter: string; // TODO add encounter type
  status: string; // TODO add status enum
  priority: number; // TODO add priority enum
  priorityComment: string;
  visitNumber: string;
  comment: string;
  queueRoom: QueueRoom;
  datePicked: string;
  dateCompleted: string;
}

export interface QueueLocation {
  uuid: string;
  display: string;
  name: string;
  description: string;
  address1?: string;
  address2?: string;
  cityVillage?: string;
  stateProvince?: string;
  country: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  countyDistrict?: string;
  address3?: string;
  address4?: string;
  address5?: string;
  address6?: string;
  tags: Array<UuidDisplay>;
  parentLocation: UuidDisplay;
  childLocations: Array<UuidDisplay>;
  retired: boolean;
  attributes: [];
}

export interface QueueRoom {
  uuid: string;
  display: string;
  name: string;
  description: string;
  address1?: string;
  address2?: string;
  cityVillage?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  countyDistrict?: string;
  address3?: string;
  address4?: string;
  address5?: string;
  address6?: string;
  tags: Array<UuidDisplay>;
  parentLocation: UuidDisplay;
  childLocations: Array<QueueLocation>;
  retired: boolean;
}

export interface UuidDisplay {
  uuid: string;
  display: string;
}

export function usePatientQueuesList(
  currentQueueLocationUuid: string,
  status: string,
  provider: string
) {
  const apiUrl = `/ws/rest/v1/patientqueue?v=full&status=${status}&room=${currentQueueLocationUuid}`;
  return usePatientQueueRequest(apiUrl, provider);
}
export function usePatientQueueRequest(apiUrl: string, provider) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    { data: { results: Array<PatientQueue> } },
    Error
  >(apiUrl, openmrsFetch, { refreshInterval: 3000 });

  const mapppedQueues = data?.data?.results.map((queue: PatientQueue) => {
    return {
      ...queue,
      id: queue.uuid,
      name: queue.patient?.person.display,
      patientUuid: queue.patient?.uuid,
      provider: queue.provider?.person.display,
      priorityComment: queue.priorityComment,
      priority:
        queue.priorityComment === "Urgent" ? "Priority" : queue.priorityComment,
      priorityLevel: queue.priority,
      waitTime: queue.dateCreated
        ? `${dayjs().diff(dayjs(queue.dateCreated), "minutes")}`
        : "--",
      status: queue.status,
      patientAge: queue.patient?.person?.age,
      patientSex: queue.patient?.person?.gender === "M" ? "MALE" : "FEMALE",
      patientDob: queue.patient?.person?.birthdate
        ? formatDate(parseDate(queue.patient.person.birthdate), { time: false })
        : "--",
      identifiers: queue.patient?.identifiers,
      locationFrom: queue.locationFrom?.uuid,
      locationTo: queue.locationTo?.uuid,
      locationToName: queue.locationTo?.name,
      queueRoom: queue.locationTo?.display,
      visitNumber: queue.visitNumber,
      dateCreated: queue.dateCreated,
      creatorUuid: queue.creator?.uuid,
      creatorUsername: queue.creator?.username,
      creatorDisplay: queue.creator?.display,
    };
  });

  return {
    patientQueueEntries: mapppedQueues || [],
    patientQueueCount: mapppedQueues?.length,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}
