import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Greeter } from './greeter';

describe(`<Greeter />`, () => {
  afterEach(cleanup);
  it(`renders without dying`, () => {
    render(<Greeter />);
  });
});
