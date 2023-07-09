/**
 * @returns {Promise<import('jest').Config>}
 */
module.exports = {
  collectCoverageFrom: [
    "**/src/**/*.component.tsx",
    "!**/node_modules/**",
    "!**/src/declarations.d.ts",
  ],
  transform: {
    "^.+\\.tsx?$": ["@swc/jest"],
  },
  transformIgnorePatterns: ["/node_modules/(?!@openmrs)"],
  moduleNameMapper: {
    "@openmrs/esm-framework": "@openmrs/esm-framework/mock",
    "\\.(s?css)$": "identity-obj-proxy",
    "^lodash-es/(.*)$": "lodash/$1",
    "^dexie$": require.resolve("dexie"),
  },
  setupFilesAfterEnv: ["<rootDir>/src/setup-tests.ts"],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
};
