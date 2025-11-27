import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock API
jest.mock('../api', () => ({
    post: jest.fn(),
}));

const renderLogin = () => {
    render(
        <AuthProvider>
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        </AuthProvider>
    );
};

test('renders login form', () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
});
