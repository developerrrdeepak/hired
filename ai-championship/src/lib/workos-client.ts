'use client';

// WorkOS Authentication Client
export class WorkOSClient {
  private clientId: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || '';
    // Default redirect URI should match what's configured in WorkOS dashboard
    this.redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || '';
  }

  /**
   * Get the authorization URL for WorkOS SSO
   * This calls the server-side API to generate the URL securely
   */
  async getAuthorizationUrl(userType: 'candidate' | 'employer' = 'candidate') {
    try {
      const res = await fetch('/api/auth/workos/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to get authorization URL');
      }
      
      return await res.json();
    } catch (error) {
      console.error('WorkOS Auth URL Error:', error);
      throw error;
    }
  }

  // Note: Authentication flow is handled via:
  // 1. Client redirects to URL from getAuthorizationUrl()
  // 2. User logs in at WorkOS
  // 3. WorkOS redirects to /api/auth/workos/callback (Server-side)
  // 4. Server exchanges code, creates Firebase user, and redirects to /auth/callback
}

export const workosClient = new WorkOSClient();
