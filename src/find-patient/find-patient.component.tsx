import React, { useState } from "react";
import styles from "../patient-getter/patient-getter.scss";
import { useTranslation, Trans } from "react-i18next";
import { Search, InlineLoading, Tile } from "@carbon/react";
import { usePatient } from "./find-patient.resource";
import { useConfig } from "@openmrs/esm-framework";
import { Config } from "../config-schema";

const FindPatient: React.FC = () => {
  const [patientName, setPatientName] = useState(null);
  const { data, isLoading } = usePatient(patientName);
  const config: Config = useConfig();

  const { t } = useTranslation();

  const findPatientWithName = (name: string) => {
    setPatientName(name);
  };

  const getPatientName = (patient) => {
    const givenNames =
      patient?.name[0].given.length > 1
        ? patient?.name[0].given
        : patient?.name[0].given.join(" ");
    const familyName = patient?.name[0].family ? patient?.name[0].family : "";

    return `${givenNames} ${familyName}`;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return `${age}`;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.welcome}>
        {t("welcomeText", "Welcome to the O3 Template app")}
      </h3>
      <p className={styles.explainer}>{t("findPatient", "Find Patient")}</p>

      <Search
        size="md"
        placeholder="Enter Patient's Name"
        labelText="Search"
        closeButtonLabelText="Clear search input"
        id="search-1"
        onChange={(e) => findPatientWithName(e.target.value)}
      />

      {isLoading ? (
        <InlineLoading
          description={t("loading", "Loading") + "..."}
          role="progressbar"
        />
      ) : null}
      {data ? (
        <>
          {data && data.length > 0
            ? data.map((patient) => (
                <Tile className={styles.tile} key={patient.id}>
                  {config.casualGreeting ? (
                    <Trans key="casualGreeting">
                      Hey {getPatientName(patient)}! You are currently{" "}
                      {calculateAge(patient.birthDate)} years old!
                    </Trans>
                  ) : (
                    <Trans key="formalGreeting">
                      Hello {getPatientName(patient)}! You are currently{" "}
                      {calculateAge(patient.birthDate)} years old!
                    </Trans>
                  )}
                </Tile>
              ))
            : null}
        </>
      ) : null}
    </div>
  );
};

export default FindPatient;
