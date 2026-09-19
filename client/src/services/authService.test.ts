import { describe, expect, it, beforeEach, vi } from 'vitest';
import { createMember, listUsers, login, logout, revokeUserSessions, removeUser, getLastSession, setUserPassword, requestPasswordRecovery, resetPassword } from './authService';
import { error, revokeOtherSessions, setPassword } from 'better-auth/api';
import { data, redirect } from 'react-router-dom';
import { email } from 'better-auth';



const normalUser = {
  id: 'user-1',
  name: 'Jamie Morgan',
  email: 'user@homehub.test',
  role: 'user',
};
const adminUser = {
  id: 'admin-1',
  displayName: 'Alex Morgan',
  email: 'admin@homehub.test',
  role: 'admin',
};

// Created before Vitest replaces the imported auth-client module.
const authMock = vi.hoisted(() => ({
  useSession: vi.fn(),
  refetch: vi.fn(), 
  signInEmail: vi.fn(),
  signOut: vi.fn(),
  createUser: vi.fn(),
  listUsers: vi.fn(),
  removeUser: vi.fn(),
  revokeSession: vi.fn(),
  getLastSession: vi.fn(),
  setPassword: vi.fn(),
  requestPassword: vi.fn(),
  resetPassword: vi.fn(),
}));


// Replace your browser and client during this test file only.
vi.mock('../lib/auth-client', () => ({
  authClient: {
    // Better auth function name: authMock.whatever named above
    useSession: authMock.useSession,
    signIn: {
      email: authMock.signInEmail,
    },
    signOut: authMock.signOut,
    admin : {
      createUser: authMock.createUser,
      listUsers: authMock.listUsers,
      revokeUserSessions: authMock.revokeSession,
      listUserSessions: authMock.getLastSession,
      setUserPassword: authMock.setPassword,
      removeUser: authMock.removeUser,
    },
    requestPasswordReset: authMock.requestPassword,
    resetPassword: authMock.resetPassword,
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

describe('Testing authClient',() => {
  // Login Tests
  it('verify login() returns correct user data', async () => {
    authMock.signInEmail.mockReturnValue({
      data: {
        user: normalUser
      },
      error: null,
    })

    const result = await login('user@homehub.test', 'TestPassword1234!')

    expect(authMock.signInEmail).toHaveBeenCalledWith({
      email: 'user@homehub.test',
      password: 'TestPassword1234!',
    })

    expect(result).toEqual({
      id: 'user-1',
      displayName: 'Jamie Morgan',
      email: 'user@homehub.test',
      role: 'user',
    });
  })

  it("verify login() with inccorect credentials throws error", async () => {
    authMock.signInEmail.mockReturnValue({
      data: null,
      error: {
        message: 'Invalid email or password.'
      },
    })

    await expect(login('user@homehub.test', 'TestPassword1234!')).rejects.toThrow('Invalid email or password.')
  })

  it('verify login() with no error message is provided', async () => {
    authMock.signInEmail.mockReturnValue({
      data: null,
      error: {}
    });

    await expect(login('user@homehub.test', 'TestPassword1234!')).rejects.toThrow('Sign in failed.')
  })

  // Logout Tests
  it('verify logout() works', async () => {
    authMock.signOut.mockReturnValue({ error: null })

    await expect(logout()).resolves.toBeUndefined();

    expect(authMock.signOut).toHaveBeenCalledOnce()
  })

  it('verify logout() throws error', async () => {
    authMock.signOut.mockReturnValue({ error });

    await expect(logout()).rejects.toThrow('Sign out failed')
  })

  // Create Member Tests
  it('Verify creating using succesfully works', async () => {
    authMock.createUser.mockReturnValue({
      data: {
        user: normalUser
      },
      error: null,
    })

    await expect(createMember('Jamie Morgan', 'user@homehub.test', 'testing1234!' )).resolves.toBeUndefined()

    expect(authMock.createUser).toHaveBeenCalledWith({
      name: 'Jamie Morgan',
      email: 'user@homehub.test',
      password: 'testing1234!',
      role: 'user',
    });
  });


  it('uses a fallback when the error has no message', async () => {
    authMock.createUser.mockResolvedValue({
      data: null,
      error: {},
    });

    await expect(
      createMember('Jamie Morgan', 'user@homehub.test', 'TestPassword123!'),
    ).rejects.toThrow('Registration failed.');
  });

  it('throws when the response contains no user', async () => {
    authMock.createUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(
      createMember('Jamie Morgan', 'user@homehub.test', 'TestPassword123!'),
    ).rejects.toThrow('The server did not return a user.');
  });  

  // listUser() Testing
  it('verify listUser() returns user', async () => {
    authMock.listUsers.mockReturnValue({
      data: {
        users: [
          {
            id: 'user-1',
            name: 'Jamie Morgan',
            email: 'user@homehub.test',
            role: 'user',
          }
        ]
      },
      error: null
    });

    const result = await listUsers()

    expect(result).toEqual([
      {
      id: 'user-1',
      displayName: 'Jamie Morgan',
      email: 'user@homehub.test',
      role: 'user',
      },
    ]);
  });

  it('verify empty list retruns', async () =>{
    authMock.listUsers.mockReturnValue({
      data: { users: [] },
      error: null
    });

    const result = await listUsers()

    expect(result).toEqual([])
  })

  it('verify that error message is called', async () => {
    authMock.listUsers.mockReturnValue({
      data: { Users: [] },
      error: { message: 'Failed' }
    });

    await expect(listUsers()).rejects.toThrow('Failed')
    expect (authMock.listUsers).toHaveBeenCalledOnce()
  })

  it('verify that no data throws error', async () => {
    authMock.listUsers.mockReturnValue({
      data: null,
      error: null
    });

    await expect(listUsers()).rejects.toThrow('The server did not return users')
    expect(authMock.listUsers).toHaveBeenCalledOnce()
  })

  // revokeUserSessions tests
  it('verify revokeUserSessions() resolves with no errors', async () => {
    authMock.revokeSession.mockReturnValue({
      error: null
    });

    await expect(revokeUserSessions('user-1')).resolves.toBeUndefined()
    expect(authMock.revokeSession).toHaveBeenCalledOnce()
  })

  it('verify revokeUserSessions() resolves with error', async () => {
    authMock.revokeSession.mockResolvedValue({
      error: { message: 'Failed' }
    });

    await expect(revokeUserSessions('user-1')).rejects.toThrow('Failed')
    expect(authMock.revokeSession).toHaveBeenCalledOnce()
  });

  // removeUser() tests
  it('verify removeUser() resolves', async () => {
    authMock.removeUser.mockResolvedValue({
      error: null
    });

    await expect(removeUser('user-1')).resolves.toBeUndefined();
    expect(authMock.removeUser).toHaveBeenCalledOnce();
  });

  it('Verify that error is thorwn', async () => {
    authMock.removeUser.mockResolvedValue({
      error: { message: 'Failed' }
    });

    await expect(removeUser('user-1')).rejects.toThrow('Failed');
    expect(authMock.removeUser).toHaveBeenCalledOnce();
  });

  // getLastSession() tests
  it('Verify we return a valid session when calling getLAstSession()', async () => {
    authMock.getLastSession.mockResolvedValue({
      data: {
        sessions: [
          { createdAt: '2026-09-14T10:00:00.000Z' },
          { createdAt: '2026-09-16T15:00:00.000Z' },
          { createdAt: '2026-09-15T12:00:00.000Z' },
        ],
      },
      error: null,
    });

    await expect(getLastSession('user-1')).resolves.toEqual(
      new Date('2026-09-16T15:00:00.000Z')
    )

    expect(authMock.getLastSession).toHaveBeenCalledWith({
      userId: 'user-1'
    })
  });

  it('Verify error is thrown when called getLastSession()', async () => {
    authMock.getLastSession.mockResolvedValue({
      data: {
        sessions: [
          { createdAt: '2026-09-14T10:00:00.000Z' },
          { createdAt: '2026-09-16T15:00:00.000Z' },
          { createdAt: '2026-09-15T12:00:00.000Z' },
        ],
      },
      error: { message: 'Failed' },
    });

    await expect(getLastSession('user-1')).rejects.toThrow('Failed')
  })

  it('verify error is thrown if no data for getLastSession()', async () => {
    authMock.getLastSession.mockResolvedValue({
      data: null ,
      error: null,
    });

    await expect(getLastSession('user-id')).rejects.toThrow('The server did not return session data.')
  })

  it('returns null when the user has no sessions', async () => {
    authMock.getLastSession.mockResolvedValue({
      data: { sessions: [] },
      error: null,
    });

    await expect(getLastSession('user-1')).resolves.toBeNull();

    expect(authMock.getLastSession).toHaveBeenCalledWith({
      userId: 'user-1',
    });
  });

  // setUserPassword() tests
  it('Verify setUserPassword() resolves', async () => {
    authMock.setPassword.mockResolvedValue({
      data: {
        newPassword: 'Testingnewpassword',
        userId: 'user-1'
      },
      error: null,
    });

    await expect(setUserPassword('user-1', 'Testingnewpassword')).resolves.toBeUndefined();
    expect(authMock.setPassword).toHaveBeenCalledWith({
      userId: 'user-1',
      newPassword: 'Testingnewpassword'
    })
  });

  it('Verify that setUserPassword() throws error', async () => {
    authMock.setPassword.mockResolvedValue({
      data: {
        newPassword: 'Testingnewpassword',
        userId: 'user-1'
      },
      error: { message: 'Failed' },
    });

    await expect(setUserPassword('user-1', 'Testingnewpassword')).rejects.toThrow('Failed');
  })

  // requestPasswordRecovery() test
  it('Verify requestPasswordRecovery() resolves', async () => {
    authMock.requestPassword.mockResolvedValue({
      error: null
    });

    await expect(requestPasswordRecovery('test@example.com')).resolves.toBeUndefined();
    expect(authMock.requestPassword).toHaveBeenCalledOnce();
    expect(authMock.requestPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      redirectTo: new URL('/reset-password', window.location.origin).href,
    })
  });

  it('Verify that error is thrown for requestPasswordRecovery()', async () => {
    authMock.requestPassword.mockResolvedValue({
      error: {}
    });

    await expect(requestPasswordRecovery('testing@example.com')).rejects.toThrow('Unable to request a recovery link. Please try again.')
  });

  // resetPassword() tests
  it('Verify resetPassword() resolves', async () => {
    authMock.resetPassword.mockResolvedValue({
      error: null
    });

    await expect(resetPassword('newpasswordExample', 'dddddddddddddddddddd')).resolves.toBeUndefined();
    expect(authMock.resetPassword).toHaveBeenCalledOnce();
  });

  it('Verify resetPassword() throws error', async () => {
    authMock.resetPassword.mockResolvedValue({
      error: {}
    });

    await expect(resetPassword('newpasswordExample', 'dddddddddddddddddddd')).rejects.toThrow('Unable to reset password')
  })

  it('shows a rate-limit message when recovery returns 429', async () => {
    authMock.requestPassword.mockResolvedValue({
      data: null,
      error: { status: 429 },
    });

    await expect(
      requestPasswordRecovery('test@example.com'),
    ).rejects.toThrow('Too many attempts. Please try again later.');
  });
})

