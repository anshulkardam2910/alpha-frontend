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
    return new Promise(async (resolve, reject) => {
      try {
        const { authUrl } = await this.initiateLinkedInAuth(undefined, isSignup, userId);

        // Open popup window (like Google OAuth)
        const popup = window.open(
          authUrl,
          'linkedin-auth',
          'width=500,height=600,left=' +
            (window.screen.width / 2 - 250) +
            ',top=' +
            (window.screen.height / 2 - 300),
        );

        if (!popup) {
          throw new Error('Failed to open popup window');
        }

        // Listen for messages from popup (like Google OAuth)
        const messageListener = (event: MessageEvent) => {
          console.log('LinkedIn OAuth - Received message:', event.data);

          // Verify origin for security - allow messages from API Gateway and frontend
          const allowedOrigins = [
            process.env.NEXT_PUBLIC_APP_URL,
            window.location.origin,
            'http://localhost:3003', // API Gateway
            'https://web.get-alpha.ai', // Production API Gateway
          ];

          if (!allowedOrigins.includes(event.origin)) {
            console.log('LinkedIn OAuth - Ignoring message from different origin:', event.origin);
            return;
          }

          if (event.data.type === 'LINKEDIN_OAUTH_SUCCESS') {
            console.log('LinkedIn OAuth - Success message received');
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            resolve(event.data.data);
          } else if (event.data.type === 'LINKEDIN_OAUTH_ERROR') {
            console.log('LinkedIn OAuth - Error message received:', event.data.error);
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageListener);

        // Check if popup is closed manually (like Google OAuth)
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            reject(new Error('Authentication was cancelled'));
          }
        }, 1000);

        // Timeout after 5 minutes (like Google OAuth)
        setTimeout(
          () => {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            if (!popup.closed) {
              popup.close();
            }
            reject(new Error('Authentication timed out'));
          },
          5 * 60 * 1000,
        );
      } catch (error) {
        reject(error);
      }
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
