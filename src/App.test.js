import { render, screen } from '@testing-library/react';
import App from './App';


describe('App and UI components', () => {
  test('renders app', () => {
    render(<App />);
    const linkElement = screen.getByText(/ZK Email Ownership Proof Generator From Header/i);
    expect(linkElement).toBeInTheDocument();
  });
  test('renders input components', () => {
    render(<App />);
    const emailAndHeadersInput = screen.getByLabelText(/Full Email with Headers/i);
    expect(emailAndHeadersInput).toBeInTheDocument();
    const ethereumAddressInput =screen.getByLabelText(/Ethereum Address/i); 
    expect(ethereumAddressInput).toBeInTheDocument();
  });
  test('renders buttons and output', () => {
    render(<App />);
    const proofOutput = screen.getByLabelText(/Proof Output/i);
    expect(proofOutput).toBeInTheDocument();
    const proveButton = screen.getByText(/Prove/i);
    expect(proveButton).toBeInTheDocument();
    const verifyButton = screen.getByText(/Verify/i);
    expect(verifyButton).toBeInTheDocument();
  });
});
