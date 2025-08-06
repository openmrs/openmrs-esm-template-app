# OpenMRS ESM Template App

![Node.js CI](https://github.com/openmrs/openmrs-esm-template-app/workflows/Node.js%20CI/badge.svg)

This repository serves as a template for building OpenMRS frontend modules. For detailed guidance, see the [Creating a Frontend Module](https://openmrs.atlassian.net/wiki/x/rIIBCQ) documentation.

For more information, please see the [OpenMRS Frontend Developer Documentation](https://openmrs.atlassian.net/wiki/x/IABBHg).

The [Setup](https://openmrs.atlassian.net/wiki/x/PIIBCQ) section will help you get started with frontend module development.

## Running this code

```sh
yarn  # to install dependencies
yarn start  # to run the dev server
```

Once it is running, a browser window should open running the O3 reference application. Log in and then navigate to `/openmrs/spa/root`.

## Adapting the code

1. Replace all instances of "template" with your frontend module's name
2. Update `index.ts` with your feature name, page name, and route
3. Rename the `root.*` files to match your first page
4. Clear `config-schema` objects and rebuild as needed
5. Delete the `greeter` and `patient-getter` directories and clear `root.component.tsx`
6. Clear `translations/en.json`
7. Update `.github/workflows` for your deployment needs
8. Replace this README with documentation for your module

At this point, you should be able to write your first page as a React application.

See the [Medication dispensing app](https://github.com/openmrs/openmrs-esm-dispensing-app) for a complete example of a non-trivial frontend module built using this template.

## Integration

See [Creating a Frontend Module](https://openmrs.atlassian.net/wiki/x/rIIBCQ) for details on how to integrate your custom frontend module into the OpenMRS reference application.
