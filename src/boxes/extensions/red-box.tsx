/**
 * This component demonstrates the creation of an extension.
 *
 * Check out the Extension System docs:
 *   https://openmrs.github.io/openmrs-esm-core/#/main/extensions
 */

import React from "react";
import styles from "./box.scss";

const RedBox: React.FC = () => {
  return <div className={styles.red}></div>;
};

export default RedBox;
