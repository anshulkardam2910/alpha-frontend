"use client"
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/identity/auth`;

/**
 * Authentication Modes
 */
export enum AuthMode {
  ALPHA_AUTH = 'alpha_auth',    // No OAuth, pure Alpha auth
  BASIC_AUTH = 'basic_auth',    // OAuth basic scopes only
  FULL_AUTH = 'full_auth',      // OAuth with all sensitive scopes
}

/**
 * Alpha Inbox info returned after OAuth
 */
export interface AlphaInboxInfo {
  id: string;
  alphaEmail: string;
  displayName: string;
}

export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    googleId: string;
    provider: string;
    profile: {
      firstName: string;
      lastName: string;
      phone: string;
      settings: Record<string, unknown>;
    };
    memberships?: Array<{
      id: string;
      workspaceId: string;
      status: 'pending' | 'active';
      role: {
        name: string;
      };
      workspace: {
        id: string;
        name: string;
        domain: string;
        createdAt: string;
      };
    }>;
  };
  isNewUser: boolean;
  integrationStatus: string;
  workspace?: {
    id: string;
    name: string;
    domain: string;
  } | null;
  needsWorkspaceSetup: boolean;
  // Fallback auth fields
  authMode?: AuthMode;
  hasInboxAccess?: boolean;
  needsAlphaInbox?: boolean;
  alphaInbox?: AlphaInboxInfo;
}

export interface IntegrationStatus {
  isConnected: boolean;
  status: 'not_connected' | 'connected' | 'partial_access' | 'permissions_denied' | 'error';
  hasGmailScopes: boolean;
  accountEmail?: string;
  lastSyncAt?: string;
  errorMessage?: string;
  // Fallback auth fields
  authMode?: AuthMode;
  hasInboxAccess?: boolean;
  alphaInboxEmail?: string;
}

export interface GmailPermissionCheck {
  hasPermissions: boolean;
  canRequestPermissions: boolean;
}

export class GoogleOAuthService {
  private static instance: GoogleOAuthService;

  public static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  /**
   * Detect if the current browser is Safari (including mobile Safari)
   */
  private isSafari(): boolean {
    const userAgent = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(userAgent) || 
           /iPad|iPhone|iPod/.test(userAgent);
  }


  /**
   * Step 1: Initiate Google OAuth with safe scopes
   */
  async initiateGoogleAuth(redirectUri?: string, isSignup: boolean = false, inviteId?: string): Promise<{ authUrl: string; state: string }> {
    const baseState = this.generateRandomState();
    const stateWithInviteId = inviteId ? `${baseState}:${inviteId}` : baseState;
    console.log("initiateGoogleAuth", redirectUri, isSignup, inviteId, stateWithInviteId);
    const response = await fetch(`${API_BASE_URL}/google/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirectUri,
        state: stateWithInviteId,
        isSignup
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate Google OAuth');
    }

    const data = await response.json();
    
    // Store state for verification
    localStorage.setItem('google_oauth_state', data.state);
    
    return data;
  }

  /**
   * Step 2: Handle OAuth callback and complete authentication
   */
  async handleCallback(code: string, state?: string, inviteId?: string): Promise<GoogleAuthResponse> {
    // Verify state
    const storedState = localStorage.getItem('google_oauth_state');
    if (state && storedState !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    console.log("Google OAuth callback", code, state, inviteId, API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        inviteId
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log("Google OAuth callback failed", error);
      throw new Error(error.message || 'Google OAuth callback failed');
    }

    const data = await response.json();
    
    // Clear stored state
    localStorage.removeItem('google_oauth_state');
    
    return data;
  }

  /**
   * Step 3: Check Gmail permissions (background check)
   */
  async checkGmailPermissions(): Promise<GmailPermissionCheck> {
    const token = useAuthStore.getState().accessToken
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_BASE_URL}/google/gmail-permissions-check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check Gmail permissions');
    }

    return response.json();
  }

  /**
   * Step 4a: Request Gmail permissions
   */
  async requestGmailPermissions(redirectUri?: string): Promise<{ authUrl: string; state: string }> {
    const token = useAuthStore.getState().accessToken
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_BASE_URL}/google/gmail-permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirectUri
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to request Gmail permissions');
    }

    const data = await response.json();
    
    // Store state for Gmail flow
    localStorage.setItem('gmail_oauth_state', data.state);
    
    return data;
  }

  /**
   * Handle Gmail permissions callback
   */
  async handleGmailCallback(code: string, state?: string): Promise<{ message: string; integrationAccountId: string; accountEmail?: string }> {
    // Verify state
    const storedState = localStorage.getItem('gmail_oauth_state');
    if (state && storedState !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    const response = await fetch(`${API_BASE_URL}/google/gmail-callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gmail permissions callback failed');
    }

    const data = await response.json();
    
    // Clear stored state
    localStorage.removeItem('gmail_oauth_state');
    
    // Trigger initial contacts sync in the background
    if (data.integrationAccountId) {
      this.triggerInitialContactsSync(data.integrationAccountId).catch(error => {
        console.error('Failed to trigger initial contacts sync:', error);
        // Don't throw - sync can happen later
      });
    }
    
    return data;
  }

  /**
   * Trigger initial contacts sync after Gmail connection
   */
  private async triggerInitialContactsSync(integrationAccountId: string): Promise<void> {
    const token = useAuthStore.getState().accessToken
    if (!token) {
      console.warn('No access token available for contacts sync');
      return;
    }

    try {
      console.log(`🔄 Triggering initial contacts sync for integration: ${integrationAccountId}`);
      
      // Construct Communication Service URL through API Gateway
      // API_BASE_URL is like: http://localhost:3003/api/v1/identity/auth
      // We need: http://localhost:3003/api/v1/communication
      // Remove /identity/auth and add /communication
      const communicationUrl = API_BASE_URL.replace('/identity/auth', '/communication');
      
      console.log(`📡 Communication Service URL: ${communicationUrl}/contacts/${integrationAccountId}/initial-sync?provider=google`);
      
      const response = await fetch(
        `${communicationUrl}/contacts/${integrationAccountId}/initial-sync?provider=google`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Initial contacts sync failed' }));
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
   * Get integration status
   */
  async getIntegrationStatus(): Promise<IntegrationStatus> {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_BASE_URL}/google/integration-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get integration status');
    }

    return response.json();
  }

  /**
   * Open Google OAuth popup window
   */
  async openGoogleAuthPopup(authUrl: string): Promise<{ code: string; state?: string }> {
    return new Promise((resolve, reject) => {
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=500,height=600,left=' + (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 300)
      );

      if (!popup) {
        reject(new Error('Failed to open popup window'));
        return;
      }

      // Listen for PostMessage from the popup
      const messageListener = (event: MessageEvent) => {
        // Verify origin for security - allow messages from API Gateway and frontend
        const allowedOrigins = [
          process.env.NEXT_PUBLIC_APP_URL,
          window.location.origin,
          'http://localhost:3003', // API Gateway
          'http://localhost:3000', // Identity-Service (if direct)
          'https://web.get-alpha.ai', // Production API Gateway
          'https://api.get-alpha.ai' // Production API Gateway alternative
        ];
        
        console.log('Google OAuth - Received message:', {
          type: event.data?.type,
          origin: event.origin,
          allowed: allowedOrigins.includes(event.origin),
          data: event.data
        });
        
        if (!allowedOrigins.includes(event.origin)) {
          console.log('Google OAuth - Ignoring message from different origin:', event.origin, 'Allowed origins:', allowedOrigins);
          return;
        }

        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          console.log('Google OAuth - Success message received, closing popup and resolving', event.data.data);
          window.removeEventListener('message', messageListener);
          if (popup && !popup.closed) {
            popup.close();
          }
          
          // Resolve with the actual authentication data from the backend
          resolve(event.data.data);
          
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          console.log('Google OAuth - Error message received', event.data.error);
          window.removeEventListener('message', messageListener);
          if (popup && !popup.closed) {
            popup.close();
          }
          reject(new Error(event.data.error || 'OAuth authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('Authentication was cancelled'));
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Authentication timed out'));
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Complete Google OAuth flow using redirect for Safari compatibility
   */
  async authenticateWithGoogleRedirect(inviteId?: string, isSignup: boolean = false): Promise<void> {
    try {
      // Step 1: Initiate OAuth with inviteId in state
      const { authUrl } = await this.initiateGoogleAuth(undefined, isSignup, inviteId);
      
      console.log('Google OAuth URL (redirect):', authUrl);
      console.log('inviteId being passed in state:', inviteId);
      
      // Store the current page URL to return to after OAuth
      const returnUrl = window.location.href;
      localStorage.setItem('oauth_return_url', returnUrl);
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Google OAuth redirect error:', error);
      throw error;
    }
  }

  /**
   * Complete Google OAuth flow in popup (for non-Safari browsers)
   */
  async authenticateWithGooglePopup(inviteId?: string, isSignup: boolean = false): Promise<GoogleAuthResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        // Step 1: Initiate OAuth with inviteId in state
        const { authUrl } = await this.initiateGoogleAuth(undefined, isSignup, inviteId);
        
        console.log('Google OAuth URL (popup):', authUrl);
        console.log('inviteId being passed in state:', inviteId);
        
        // Step 2: Open popup and wait for PostMessage
        const popup = window.open(
          authUrl,
          'google-oauth',
          'width=500,height=600,left=' + (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 300)
        );

        if (!popup) {
          reject(new Error('Failed to open popup window'));
          return;
        }

        // Listen for PostMessage from the backend
        const messageListener = (event: MessageEvent) => {
          console.log('Google OAuth (authenticateWithGoogle) - Received message:', event);
          console.log('Google OAuth (authenticateWithGoogle) - Event origin:', event.origin);
          console.log('Google OAuth (authenticateWithGoogle) - Event data:', event.data);
          
          // Verify origin for security - allow messages from API Gateway and frontend
          const allowedOrigins = [
            process.env.NEXT_PUBLIC_APP_URL,
            window.location.origin,
            'http://localhost:3003', // API Gateway
            'https://web.get-alpha.ai' // Production API Gateway
          ];

          if (!allowedOrigins.includes(event.origin)) {
            console.log('Google OAuth (authenticateWithGoogle) - Ignoring message from different origin:', event.origin);
            return;
          }

          if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            console.log('Google OAuth (authenticateWithGoogle) - Success message received, closing popup and resolving');
            window.removeEventListener('message', messageListener);
            popup.close();
            resolve(event.data.data);
            
          } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
            window.removeEventListener('message', messageListener);
            popup.close();
            reject(new Error(event.data.error || 'OAuth authentication failed'));
          }
        };

        window.addEventListener('message', messageListener);

        // Check if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            reject(new Error('Authentication was cancelled'));
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Authentication timed out'));
        }, 5 * 60 * 1000);

      } catch (error) {
        console.error('Google OAuth error:', error);
        reject(error);
      }
    });
  }

  /**
   * Complete Google OAuth flow - automatically chooses popup or redirect based on browser
   */
  async authenticateWithGoogle(inviteId?: string, isSignup: boolean = false): Promise<GoogleAuthResponse | void> {
    // Use redirect for Safari browsers (especially mobile Safari)
    if (this.isSafari()) {
      console.log('Using redirect flow for Safari browser');
      return this.authenticateWithGoogleRedirect(inviteId, isSignup);
    } else {
      console.log('Using popup flow for non-Safari browser');
      return this.authenticateWithGooglePopup(inviteId, isSignup);
    }
  }

  /**
   * Complete Gmail permissions flow in popup
   */
  async connectGmailWithPopup(): Promise<{ message: string; integrationAccountId: string; accountEmail?: string; integrationType: string }> {
    try {
      // Step 1: Request Gmail permissions
      const { authUrl, state } = await this.requestGmailPermissions();
      
      // Step 2: Open popup and get authorization code
      const { code } = await this.openGoogleAuthPopup(authUrl);
      
      // Step 3: Handle Gmail callback
      const result = await this.handleGmailCallback(code, state);
      
      return {
        ...result,
        integrationType: 'google_gmail'
      };
    } catch (error) {
      console.error('Gmail permissions error:', error);
      throw error;
    }
  }

  private generateRandomState(): string {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  }
}

export default GoogleOAuthService.getInstance();
