import { render, screen } from '@testing-library/react';
import App from './App';

test('renders medialist login screen', () => {
  render(<App />);
  const titleElement = screen.getByText(/medialist/i);
  expect(titleElement).toBeInTheDocument();
});
