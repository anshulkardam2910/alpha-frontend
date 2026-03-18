import { API_CONFIG } from '@/lib/api.config';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

export interface OutlookAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    provider: string;
    memberships?: unknown[];
    profile?: {
      firstName: string;
      lastName: string;
      phone: string | null;
      settings: unknown;
    };
  };
  isNewUser: boolean;
  needsWorkspaceSetup: boolean;
  integrationAccount?: {
    id: string;
    providerType: string;
    status: string;
    grantedScopes: string[];
  };
  workspace?: {
    id: string;
    name: string;
    domain: string;
  } | null;
  grantedScopes?: string[];
  requestedScopes?: string[];
}

class OutlookOAuthService {
  private readonly baseUrl = `${API_CONFIG.BASE_URL}/identity/auth/outlook`;

  /**
   * Detect if the current browser is Safari (including mobile Safari)
   */
  private isSafari(): boolean {
    const userAgent = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent);
  }

  async initiateOutlookAuth(
    inviteId?: string,
    isSignup: boolean = false,
    userId?: string,
  ): Promise<{ authUrl: string; state: string; requestedScopes: string[] }> {
    const response = await apiClient.post(`/identity/auth/outlook/initiate`, {
      inviteId,
      isSignup,
      userId, // userId is passed when connecting as integration (not login)
    });
    return response.data;
  }

  /**
   * Handle OAuth callback - similar to Google OAuth service
   */
  async handleCallback(
    code: string,
    state?: string,
    inviteId?: string,
  ): Promise<OutlookAuthResponse> {
    const response = await apiClient.post(`/callback`, {
      code,
      state,
      inviteId,
    });

    const data = response.data;

    // Trigger initial contacts sync in the background
    if (data.integrationAccountId) {
      this.triggerInitialContactsSync(data.integrationAccountId).catch((error) => {
        console.error('Failed to trigger initial contacts sync:', error);
        // Don't throw - sync can happen later
      });
    }

    return data;
  }

  /**
   * Trigger initial contacts sync after Outlook connection
   */
  private async triggerInitialContactsSync(integrationAccountId: string): Promise<void> {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      console.warn('No access token available for contacts sync');
      return;
    }

    try {
      console.log(`🔄 Triggering initial contacts sync for integration: ${integrationAccountId}`);

      const communicationUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/communication`;

      console.log(
        `📡 Communication Service URL: ${communicationUrl}/contacts/${integrationAccountId}/initial-sync?provider=outlook`,
      );

      const response = await fetch(
        `${communicationUrl}/contacts/${integrationAccountId}/initial-sync?provider=outlook`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Initial contacts sync failed' }));
        throw new Error(error.message || 'Initial contacts sync failed');
      }

      const result = await response.json();
      console.log(`✅ Initial contacts sync completed: ${result.contactsSynced} contacts synced`);
    } catch (error) {
      console.error('Initial contacts sync error:', error);
      throw error;
    }
  }

  /**
   * Get Microsoft integration status
   */
  async getIntegrationStatus(): Promise<{
    connected: boolean;
    scopes: string[];
    status: string;
    hasMailAccess: boolean;
    hasContactsAccess: boolean;
    hasCalendarAccess: boolean;
    accountEmail?: string;
    lastSyncAt?: string;
    errorMessage?: string;
  }> {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await apiClient.get(`/integration-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  /**
   * Complete Microsoft OAuth flow using redirect for Safari compatibility
   */
  async authenticateWithOutlookRedirect(
    inviteId?: string,
    isSignup: boolean = false,
    userId?: string,
  ): Promise<void> {
    try {
      // Step 1: Initiate OAuth with inviteId and userId (for integration) in state
      const { authUrl } = await this.initiateOutlookAuth(inviteId, isSignup, userId);

      console.log('Microsoft OAuth URL (redirect):', authUrl);
      console.log('inviteId being passed:', inviteId);

      // Store the current page URL to return to after OAuth
      const returnUrl = window.location.href;
      localStorage.setItem('oauth_return_url', returnUrl);

      // Redirect to Microsoft OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Microsoft OAuth redirect error:', error);
      throw error;
    }
  }

  /**
   * Complete Microsoft OAuth flow in popup (for non-Safari browsers)
   * For integration connection, pass userId to connect without changing login
   */
  async authenticateWithOutlookPopup(
    inviteId?: string,
    isSignup: boolean = false,
    userId?: string,
  ): Promise<OutlookAuthResponse> {
    // Step 1: Initiate OAuth with userId for integration (not login)
    const { authUrl } = await this.initiateOutlookAuth(inviteId, isSignup, userId);

    // Step 2: Open popup and wait for PostMessage
    return new Promise((resolve, reject) => {
      let settled = false;

      const popup = window.open(
        authUrl,
        'outlook-oauth',
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
          API_CONFIG.BASE_URL,
          'http://localhost:3003',
          'https://web.get-alpha.ai',
          'https://api.get-alpha.ai',
        ];

        if (!allowedOrigins.includes(event.origin)) return;

        if (event.data?.type === 'OUTLOOK_OAUTH_SUCCESS') {
          settled = true;
          cleanup();
          if (popup && !popup.closed) popup.close();
          resolve(event.data.data);
        } else if (event.data?.type === 'OUTLOOK_OAUTH_ERROR') {
          settled = true;
          cleanup();
          if (popup && !popup.closed) popup.close();
          reject(new Error(event.data.error || 'Microsoft OAuth authentication failed'));
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

  /**
   * Complete Microsoft OAuth flow - automatically chooses popup or redirect based on browser
   * For integration connection (not login), pass userId
   */
  async authenticateWithOutlook(
    inviteId?: string,
    isSignup: boolean = false,
    userId?: string,
  ): Promise<OutlookAuthResponse | void> {
    // Use redirect for Safari browsers (especially mobile Safari)
    if (this.isSafari()) {
      console.log('Using redirect flow for Safari browser');
      return this.authenticateWithOutlookRedirect(inviteId, isSignup, userId);
    } else {
      console.log('Using popup flow for non-Safari browser');
      return this.authenticateWithOutlookPopup(inviteId, isSignup, userId);
    }
  }
}

export const outlookOAuthService = new OutlookOAuthService();
export default outlookOAuthService;
