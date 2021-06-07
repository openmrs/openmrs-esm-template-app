import { openmrsFetch, fhir } from '@openmrs/esm-framework';

export async function getPatient(query) {
  const searchResult = await openmrsFetch(`/ws/rest/v1/patient?q=${query}&limit=1`, {
    method: 'GET',
  });
  return (await fhir.read<fhir.Patient>({ type: 'Patient', patient: searchResult.data.results[0].uuid })).data;
}
