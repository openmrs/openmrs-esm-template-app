![Node.js CI](https://github.com/openmrs/openmrs-esm-template-app/workflows/Node.js%20CI/badge.svg)

# OpenMRS ESM Template App

This repository provides a starting point for creating your own
[OpenMRS Microfrontend](https://wiki.openmrs.org/display/projects/OpenMRS+3.0%3A+A+Frontend+Framework+that+enables+collaboration+and+better+User+Experience).

For more information, please see the
[OpenMRS Frontend Developer Documentation](https://o3-docs.openmrs.org/#/).

In particular, the [Setup](https://o3-docs.openmrs.org/docs/frontend-modules/setup) section can help you get started developing microfrontends in general. The [Creating a microfrontend](https://o3-docs.openmrs.org/docs/recipes/create-a-frontend-module) section provides information about how to use this repository to create your own microfrontend.

## Running this code

1. **Navigate to the Project Directory**
   ```
    cd openmrs-esm-template-app
   ```
   
2.**Install Dependencies and Start the Development Server**

  - *Using Yarn*
    ```sh
    yarn
    yarn start
    ```

  - *Using npm*
    ```sh
    npm install
    npm start
    ```


Once it is running, a browser window should open with the OpenMRS 3 application.
**Log in and then navigate to `/openmrs/spa/root`.**

---

## Adapting the code

1. Start by finding and replacing all instances of "template" with the name
  of your microfrontend.
2. Update `index.ts` as appropriate, at least changing the feature name and the page name and route.
3. Rename the `root.*` family of files to have the name of your first page.
4. Delete the contents of the objects in `config-schema`. Start filling them back in once you have a clear idea what will need to be configured.
5. Delete the `greeter` and `patient-getter` directories, and the contents of `root.component.tsx`.
6. Delete the contents of `translations/en.json`.
7. Open up `.github/workflows` and adapt it to your needs. If you're writing
 a microfrontend that will be managed by the community, you might be able to
  just replace all instances of `template` with your microfrontend's name.
  However, if you're writing a microfrontend for a specific organization or
  implementation, you will probably need to configure GitHub Actions differently.
8. Delete the contents of this README and write a short explanation of what
  you intend to build. Links to planning or design documents can be very helpful.

At this point, you should be able to write your first page as a React application.

Check out the [Medication dispensing app](https://github.com/openmrs/openmrs-esm-dispensing-app) for an example of a non-trivial app built using the Template.

## Integrating it into your application

Please see [Creating a Frontend Module](https://o3-docs.openmrs.org/docs/recipes/create-a-frontend-module).
