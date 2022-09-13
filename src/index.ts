/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */

import { getAsyncLifecycle, defineConfigSchema } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

/**
 * This tells the app shell the version of this app. We inject this variable
 * via the Webpack DefinePlugin, so first, in order to keep TypeScript happy,
 * we need to tell it that this is an available variable in this scope. At
 * build-time the __VERSION__ variable is replaced with the version from
 * package.json
 */
declare var __VERSION__: string;
const version = __VERSION__;

/**
 * This tells the app shell how to obtain translation files: that they
 * are JSON files in the directory `../translations` (which you should
 * see in the directory structure).
 */
const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

/**
 * This tells the app shell what versions of what OpenMRS backend modules
 * are expected. Warnings will appear if suitable modules are not
 * installed. The keys are the part of the module name after
 * `openmrs-module-`; e.g., `openmrs-module-fhir2` becomes `fhir2`.
 */
const backendDependencies = {
  fhir2: "^1.2.0",
  "webservices.rest": "^2.2.0",
};

/**
 * This function performs any setup that should happen at microfrontend
 * load-time (such as defining the config schema) and then returns an
 * object which describes how the React application(s) should be
 * rendered.
 *
 * In this example, our return object contains a single page definition.
 * It tells the app shell that the default export of `hello.tsx`
 * should be rendered when the route matches `hello`. The full route
 * will be `openmrsSpaBase() + 'hello'`, which is usually
 * `/openmrs/spa/hello`.
 */
function setupOpenMRS() {
  const moduleName = "@openmrs/esm-template-app";

  const options = {
    featureName: "hello-world",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import("./hello"), options),
        route: "hello",
      },
    ],
    extensions: [
      {
        name: "Red box",
        load: getAsyncLifecycle(
          () => import("./boxes/extensions/red-box"),
          options
        ),
        slot: "Boxes",
      },
      {
        name: "Blue box",
        load: getAsyncLifecycle(
          () => import("./boxes/extensions/blue-box"),
          options
        ),
        slot: "Boxes",
        // same as `slots: ["Boxes"],`
      },
      {
        name: "Brand box",
        load: getAsyncLifecycle(
          () => import("./boxes/extensions/brand-box"),
          options
        ),
        slot: "Boxes",
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
