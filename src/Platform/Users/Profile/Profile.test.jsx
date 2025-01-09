import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import { DataContext } from '../Context/Context';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Mock axios
jest.mock('axios');

// Mock useContext
jest.mock('../Context/Context', () => ({
  DataContext: {
    Provider: ({ children, value }) => children,
  },
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

describe('Profile Component', () => {
  const mockContextValue = {
    URLAPI: 'https://api-codeeagles-cpq8.vercel.app',
    getTokenUser: 'mock-token',
  };

  const mockUserData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone_number: '1234567890',
    attendance: [
      { attendanceStatus: 'present' },
      { attendanceStatus: 'absent' },
    ],
    tasks: [
      { score: 10, feedback: 'Good job!' },
      { score: 5, feedback: 'Needs improvement' },
    ],
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockUserData });
    axios.put.mockResolvedValue({ data: mockUserData });
    axios.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders user data correctly', async () => {
    render(
      <DataContext.Provider value={mockContextValue}>
        <Profile />
      </DataContext.Provider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/i)).toBeInTheDocument();
    });
  });

  test('handles edit profile', async () => {
    render(
      <DataContext.Provider value={mockContextValue}>
        <Profile />
      </DataContext.Provider>
    );

    // Click edit button
    fireEvent.click(screen.getByText(/Edit Profile/i));

    // Check if input fields are rendered
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();

    // Change name input
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Jane Doe' },
    });

    // Click save button
    fireEvent.click(screen.getByText(/Save/i));

    // Check if axios.put was called
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `${URLAPI}/api/users`,
        { name: 'Jane Doe', email: 'john@example.com', phone_number: '1234567890' },
        { headers: { Authorization: 'mock-token' } }
      );
    });
  });

  test('handles logout', async () => {
    render(
      <DataContext.Provider value={mockContextValue}>
        <Profile />
      </DataContext.Provider>
    );

    // Click logout button
    fireEvent.click(screen.getByText(/Logout/i));

    // Check if localStorage was cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('tokenExpirationUser');
    expect(localStorage.removeItem).toHaveBeenCalledWith('tokenUser');

    // Check if toast was called
    expect(toast.success).toHaveBeenCalledWith('logout successfully');
  });

  test('handles delete account', async () => {
    window.confirm = jest.fn(() => true); // Mock confirm dialog

    render(
      <DataContext.Provider value={mockContextValue}>
        <Profile />
      </DataContext.Provider>
    );

    // Click delete account button
    fireEvent.click(screen.getByText(/Delete Account/i));

    // Check if axios.delete was called
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(`${URLAPI}/api/users`, {
        headers: { Authorization: 'mock-token' },
      });
    });

    // Check if toast was called
    expect(toast.info).toHaveBeenCalledWith('Deleting your account...');
    expect(toast.success).toHaveBeenCalledWith(
      'Your account has been deleted successfully. Come back to us again!'
    );
  });
});