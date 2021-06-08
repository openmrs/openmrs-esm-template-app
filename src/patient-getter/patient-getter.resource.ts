import { openmrsFetch, fhir } from '@openmrs/esm-framework';

/**
 * This is a somewhat silly resource function. It searches for a patient
 * using the REST API, and then immediately gets the data using the FHIR
 * API for the first patient found. OpenMRS API endpoints are generally
 * hit using `openmrsFetch`. For FHIR endpoints we use the FHIR API
 * object.
 *
 * See the `fhir` object API docs: https://github.com/openmrs/openmrs-esm-core/blob/master/packages/framework/esm-api/docs/API.md#fhir
 * See the docs for the underlying fhir.js Client object: https://github.com/FHIR/fhir.js#api
 * See the OpenMRS FHIR Module docs: https://wiki.openmrs.org/display/projects/OpenMRS+FHIR+Module
 * See the OpenMRS REST API docs: https://rest.openmrs.org/#openmrs-rest-api
 *
 * @param query A patient name or ID
 * @returns The first matching patient
 */
export async function getPatient(query) {
  const searchResult = await openmrsFetch(`/ws/rest/v1/patient?q=${query}&limit=1`, {
    method: 'GET',
  });
  return (await fhir.read<fhir.Patient>({ type: 'Patient', patient: searchResult.data.results[0].uuid })).data;
}
