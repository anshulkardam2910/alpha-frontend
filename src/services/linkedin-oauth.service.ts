import { API_CONFIG } from '@/lib/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface LinkedInAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    provider: string;
    memberships: unknown[];
  };
  isNewUser: boolean;
  needsWorkspaceSetup: boolean;
}

class LinkedInOAuthService {
  private generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  async initiateLinkedInAuth(
    redirectUri?: string,
    isSignup: boolean = false,
    userId?: string,
  ): Promise<{ authUrl: string; state: string }> {
    const response = await fetch(`${API_BASE_URL}/identity/auth/linkedin/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirectUri: redirectUri || `${API_BASE_URL}/identity/auth/linkedin/callback`,
        state: this.generateRandomState(),
        isSignup,
        userId, // Pass userId for integration connections (not login)
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initiate LinkedIn authentication');
    }

    return response.json();
  }

  async authenticateWithLinkedIn(
    _inviteId?: string,
    isSignup: boolean = false,
    userId?: string,
  ): Promise<LinkedInAuthResponse> {
    const { authUrl } = await this.initiateLinkedInAuth(undefined, isSignup, userId);

    return new Promise((resolve, reject) => {
      let settled = false;

      const popup = window.open(
        authUrl,
        'linkedin-auth',
        'width=500,height=600,left=' +
          (window.screen.width / 2 - 250) +
          ',top=' +
          (window.screen.height / 2 - 300),
      );

      if (!popup) {
        reject(new Error('Failed to open popup window. Please allow popups for this site.'));
        return;
      }

      const cleanup = () => {
        window.removeEventListener('message', messageListener);
        clearInterval(checkClosed);
        clearTimeout(timeout);
      };

      const messageListener = (event: MessageEvent) => {
        if (settled) return;

        const allowedOrigins = [
          process.env.NEXT_PUBLIC_APP_URL,
          window.location.origin,
          'http://localhost:3003',
          'https://web.get-alpha.ai',
          'https://api.get-alpha.ai',
        ];

        if (!allowedOrigins.includes(event.origin)) return;

        if (event.data?.type === 'LINKEDIN_OAUTH_SUCCESS') {
          settled = true;
          cleanup();
          if (popup && !popup.closed) popup.close();
          resolve(event.data.data);
        } else if (event.data?.type === 'LINKEDIN_OAUTH_ERROR') {
          settled = true;
          cleanup();
          if (popup && !popup.closed) popup.close();
          reject(new Error(event.data.error || 'LinkedIn authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);

      const checkClosed = setInterval(() => {
        if (settled) return;
        if (popup.closed) {
          settled = true;
          cleanup();
          reject(new Error('Authentication was cancelled'));
        }
      }, 1000);

      const timeout = setTimeout(
        () => {
          if (settled) return;
          settled = true;
          cleanup();
          if (!popup.closed) popup.close();
          reject(new Error('Authentication timed out'));
        },
        5 * 60 * 1000,
      );
    });
  }

  private async getUserData(accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    return response.json();
  }
}

export const linkedinOAuthService = new LinkedInOAuthService();
