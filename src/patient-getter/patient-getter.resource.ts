import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';

/**
 * This hook searches for a patient using the provided search term from the
 * OpenMRS FHIR API.It leverages the useSWR hook from the SWR library
 * https://swr.vercel.app/docs/data-fetching to fetch data. SWR provides a
 * number of benefits over the standard React useEffect hook, including:
 *
 * - Fast, lightweight and reusable data fetching
 * - Built-in cache and request deduplication
 * - Real-time updates
 * - Simplified error and loading state handling, and more.
 *
 *  We recommend using SWR for data fetching in your OpenMRS frontend modules.
 *
 * See the docs for the underlying fhir.js Client object: https://github.com/FHIR/fhir.js#api
 * See the OpenMRS FHIR Module docs: https://wiki.openmrs.org/display/projects/OpenMRS+FHIR+Module
 * See the OpenMRS REST API docs: https://rest.openmrs.org/#openmrs-rest-api
 *
 * @param query A patient name or ID
 * @returns The first matching patient
 */

export function usePatient(shouldFetch: boolean) {
  const url = `${fhirBaseUrl}/Patient?_summary=data&_count=100`;
  const { data, error, isLoading } = useSWR<
    {
      data: { entry: Array<{ resource: fhir.Patient }> };
    },
    Error
  >(shouldFetch ? url : null, openmrsFetch);

  let patient = null;
  if (data && data.data.entry && data.data.entry.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.data.entry.length);
    patient = data.data.entry[randomIndex].resource;
  }

  return {
    patient: patient,
    error: error,
    isLoading,
  };
}
