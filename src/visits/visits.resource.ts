import { Visit, useOpenmrsSWR, useSession } from "@openmrs/esm-framework";

const customRepresentation =
  "custom:(uuid,patient:(uuid,identifiers:(identifier,uuid,identifierType:(name,uuid)),person:(age,display,gender,uuid,attributes:(value,attributeType:(uuid,display))))," +
  "visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,stopDatetime)";

export function useActiveVisits() {
  const {
    sessionLocation: { uuid: locationUuid },
  } = useSession();
  const { data, isLoading, isValidating, error } = useOpenmrsSWR(
    `/ws/rest/v1/visit?includeInactive=false&totalCount=true&location=${locationUuid}&v=${customRepresentation}`
  );

  return {
    visits: data?.data?.results as Array<Visit> | null,
    isLoadingVisits: isLoading,
    errorFetchingVisits: error,
    isValidating,
  };
}
