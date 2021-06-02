import { render, screen } from '@testing-library/react';
import App from '../App';
import NodePeerGraph from '../components/node-page/NodePeerGraph';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/CISELab/i);
  expect(linkElement).toBeInTheDocument();
});
