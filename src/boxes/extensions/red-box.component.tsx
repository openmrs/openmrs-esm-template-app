/**
 * This component demonstrates the creation of an extension.
 *
 * Check out the Extension System docs:
 * https://o3-docs.vercel.app/docs/extension-system
 */

import React from "react";
import styles from "./box.scss";

const RedBox: React.FC = () => {
  return <div className={styles.red}></div>;
};

export default RedBox;
