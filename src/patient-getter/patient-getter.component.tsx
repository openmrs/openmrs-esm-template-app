/**
 * Components that make queries delegate the query-making logic to a
 * `.resource.ts` function. This component leverages the`usePatient`
 * hook to fetch a patient from the backend. When the button is clicked,
 * the `patientName` variable is set to "test", which triggers the hook
 * to make a request to the backend. The hook returns patient data from the
 * request, which is then rendered in the UI. The hook also returns a boolean
 * property called `isLoading` that is set to true while the request is being
 * made. This component renders a loading indicator while `isLoading` is true.
 */

import React, { useState } from "react";
import { Button, InlineLoading, Tile } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { usePatient } from "./patient-getter.resource";
import styles from "./patient-getter.scss";

function PatientGetter() {
  const { t } = useTranslation();
  const [patientName, setPatientName] = useState(null);
  const { patient, isLoading } = usePatient(patientName);

  return (
    <div className={styles.container}>
      <h5>{t("dataFetching", "Data fetching")}</h5>
      <p>
        {t(
          "patientGetterExplainer",
          "Try clicking the button below to fetch a patient from the backend"
        )}
        :
      </p>
      <Button onClick={() => setPatientName("test")}>
        {t("getPatient", "Get a patient named")} 'test'
      </Button>
      {isLoading ? (
        <InlineLoading
          description={t("loading", "Loading") + "..."}
          role="progressbar"
        />
      ) : null}
      {patient ? (
        <Tile className={styles.tile}>
          {patient
            ? `${patient.name[0].given} ${patient.name[0].family} / ${patient.gender} / ${patient.birthDate}`
            : null}
        </Tile>
      ) : null}
    </div>
  );
}

export default PatientGetter;
