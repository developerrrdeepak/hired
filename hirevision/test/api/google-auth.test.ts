/**
 * Google Auth API Tests
 * Tests Google OAuth integration
 */

import { loginWithGoogle } from '@/lib/google-auth';

// Mock Firebase
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  getAdditionalUserInfo: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    commit: jest.fn(),
  })),
}));

describe('Google Auth API', () => {
  it('should handle successful Google sign-in', async () => {
    const mockAuth = {};
    const mockFirestore = {};
    
    // Mock successful response
    const { signInWithPopup, getAdditionalUserInfo } = require('firebase/auth');
    signInWithPopup.mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      },
    });
    getAdditionalUserInfo.mockReturnValue({ isNewUser: true });

    const { getDoc } = require('firebase/firestore');
    getDoc.mockResolvedValue({ exists: () => false });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await loginWithGoogle('Owner', mockAuth, mockFirestore);
    
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });

  it('should handle Google sign-in errors', async () => {
    const mockAuth = {};
    const mockFirestore = {};
    
    const { signInWithPopup } = require('firebase/auth');
    signInWithPopup.mockRejectedValue(new Error('Auth failed'));

    const result = await loginWithGoogle('Owner', mockAuth, mockFirestore);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle existing user sign-in', async () => {
    const mockAuth = {};
    const mockFirestore = {};
    
    const { signInWithPopup, getAdditionalUserInfo } = require('firebase/auth');
    signInWithPopup.mockResolvedValue({
      user: {
        uid: 'existing-uid',
        email: 'existing@example.com',
        displayName: 'Existing User',
        photoURL: null,
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      },
    });
    getAdditionalUserInfo.mockReturnValue({ isNewUser: false });

    const { getDoc } = require('firebase/firestore');
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ organizationId: 'org-123' }),
    });

    const result = await loginWithGoogle('Candidate', mockAuth, mockFirestore);
    
    expect(result.success).toBe(true);
    expect(result.isNewUser).toBe(false);
  });
});
