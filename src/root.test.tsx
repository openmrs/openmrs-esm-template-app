import React from 'react';
import { render, screen } from '@testing-library/react';
import Root from './root.component';

it('renders a landing page for the Template app', () => {
  render(<Root />);

  expect(screen.getByText('root')).toBeInTheDocument();
});
