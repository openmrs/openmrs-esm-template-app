import React from "react";
import styles from "./boxes.css";
import { Extension, ExtensionSlot } from "@openmrs/esm-framework";

export const Boxes: React.FC = () => {
  return (
    <div className={styles.container}>
      Here are some colored boxes. Because they are attached as extensions
      within a slot, an admin can change what boxes are shown using
      configuration. These boxes happen to be defined in this module, but they
      could attach to this slot even if they were in a different module.
      <ExtensionSlot extensionSlotName="Boxes" className={styles.boxes}>
        <div className={styles.box}>
          <Extension />
        </div>
      </ExtensionSlot>
    </div>
  );
};
