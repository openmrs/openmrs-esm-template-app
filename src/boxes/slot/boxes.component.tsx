import React from "react";
import { useTranslation } from "react-i18next";
import { Extension, ExtensionSlot } from "@openmrs/esm-framework";
import styles from "./boxes.scss";

export const Boxes: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h5>{t("extensionSystem", "Extension system")}</h5>
      <p>
        {t(
          "extensionExplainer",
          "Here are some colored boxes. Because they are attached as extensions within a slot, an admin can change what boxes are shown using configuration. These boxes happen to be defined in this module, but they could attach to this slot even if they were in a different module."
        )}
      </p>
      <ExtensionSlot name="Boxes" className={styles.boxes}>
        <div className={styles.box}>
          <Extension />
        </div>
      </ExtensionSlot>
    </div>
  );
};
