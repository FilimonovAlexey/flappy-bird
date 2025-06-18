import { render, screen } from '@testing-library/react';
import App from './App';

test('renders leaderboard', () => {
  render(<App />);
  const heading = screen.getByText(/leaderboard/i);
  expect(heading).toBeInTheDocument();
});
