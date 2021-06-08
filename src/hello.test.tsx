/**
 * This is the root test for this page. It simply checks that the page
 * renders. If the components of your page are highly interdependent,
 * (e.g., if the `Hello` component had state that communicated
 * information between `Greeter` and `PatientGetter`) then you might
 * want to do most of your testing here. If those components are
 * instead quite independent (as is the case in this example), then
 * it would make more sense to test those components independently.
 *
 * The key thing to remember, always, is: write tests that behave like
 * users. They should *look* for elements by their visual
 * characteristics, *interact* with them, and (mostly) *assert* based
 * on things that would be visually apparent to a user.
 *
 * To learn more about how we do testing, see the following resources:
 *   https://kentcdodds.com/blog/how-to-know-what-to-test
 *   https://kentcdodds.com/blog/testing-implementation-details
 *   https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
 *
 * Kent C. Dodds is the inventor of `@testing-library`:
 *   https://testing-library.com/docs/guiding-principles
 */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Hello from './hello';
import { useConfig } from '@openmrs/esm-framework';
import { Config } from './config-schema';

/**
 * This is an idiomatic way of dealing with mocked files. Note that
 * `useConfig` is already mocked; the Jest moduleNameMapper (see the
 * Jest config) has mapped the `@openmrs/esm-framework` import to a
 * mock file. This line just tells TypeScript that the object is, in
 * fact, a mock, and so will have methods like `mockReturnValue`.
 */
const mockUseConfig = useConfig as jest.Mock;

describe(`<Hello />`, () => {
  afterEach(cleanup);
  it(`renders without dying`, () => {
    const config: Config = { casualGreeting: false, whoToGreet: ['World'] };
    mockUseConfig.mockReturnValue(config);
    render(<Hello />);
  });
});
