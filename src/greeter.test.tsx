import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Root from './greeter';

describe(`<Root />`, () => {
  afterEach(cleanup);
  it(`renders without dying`, () => {
    render(<Root />);
  });
});
