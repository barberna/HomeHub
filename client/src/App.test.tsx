import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import App from './App';
import { renderWithProviders } from './test/testUtils';

const normalUser = {
  id: 'user-1',
  name: 'Jamie Morgan',
  email: 'user@homehub.test',
  role: 'user',
};
const adminUser = {
  id: 'admin-1',
  name: 'Alex Morgan',
  email: 'admin@homehub.test',
  role: 'admin',
};

// Created before Vitest replaces the imported auth-client module.
const authMock = vi.hoisted(() => ({
  useSession: vi.fn(),
  refetch: vi.fn(), 
}));

// Replace your browser and client during this test file only.
vi.mock('./lib/auth-client', () => ({
  authClient: {
    useSession: authMock.useSession,
  },
}));

beforeEach(() => {
  vi.resetAllMocks();

  authMock.useSession.mockReturnValue({
    data: null,
    isPending: false,
    error: null,
    refetch: authMock.refetch
  });
});




describe('route protection and navigation', () => {
  it('Rejects a member from teh admin page', async () => {
    authMock.useSession.mockReturnValue({
      data: {
        user: normalUser
      },
      isPending: false,
      error: null,
      refetch: authMock.refetch,
    });

    renderWithProviders(<App/>, '/admin/register')

    expect( await screen.findByRole('heading', {
        name: /this area is for administrators/i,
      }),
    ).toBeInTheDocument();
  })
});

