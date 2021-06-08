![Node.js CI](https://github.com/openmrs/openmrs-esm-template-app/workflows/Node.js%20CI/badge.svg)

# OpenMRS ESM Template App

This repository provides a starting point for creating your own
[OpenMRS Microfrontend](https://wiki.openmrs.org/display/projects/OpenMRS+3.0%3A+A+Frontend+Framework+that+enables+collaboration+and+better+User+Experience).

For more information, please see the
[OpenMRS Frontend Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/).

In particular, the [Setup](https://openmrs.github.io/openmrs-esm-core/#/getting_started/setup)
section can help you get started developing microfrontends in general. The
[Creating a microfrontend](https://openmrs.github.io/openmrs-esm-core/#/main/creating_a_microfrontend)
section provides information about how to use this repository to create your
own microfrontend.

## Adapting the code

1. Start by finding and replacing all instances of "template" with the name
  of your microfrontend.
1. Update `index.ts` as appropriate, at least changing the feature name and
  the page name and route.
1. Rename the `hello.*` family of files to have the name of your first page.
1. Delete the contents of the objects in `config-schema`. Start filling them
  back in once you have a clear idea what will need to be configured.
1. Delete the `greeter` and `patient-getter` directories, and the contents of
  `hello.tsx`.
1. Delete the contents of `translations/en.json`.
1. Open up `.github/workflows` and adapt it to your needs. If you're writing
  a microfrontend that will be managed by the community, you might be able to
  just replace all instances of `template` with your microfrontend's name.
  However, if you're writing a microfrontend for a specific organization or
  implementation, you will probably need to configure GitHub Actions differently.
1. Delete the contents of this README and write a short explanation of what
  you intend to build. Links to planning or design documents can be very helpful.

At this point, you should be able to write your first page as a React application.

## Integrating it into your application

Please see [Creating a Microfrontend](https://openmrs.github.io/openmrs-esm-core/#/main/creating_a_microfrontend).
