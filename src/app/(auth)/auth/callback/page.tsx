'use client';
import { User } from '@/modules/auth/types';
import googleOauthService from '@/services/google-oauth.service';
import outlookOAuthService from '@/services/outlook-oauth.service';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Check if this page is running inside a popup opened by the parent window.
 */
function isPopupWindow(): boolean {
  try {
    return !!(window.opener && window.opener !== window);
  } catch {
    return false;
  }
}

/**
 * Get the postMessage event type based on the provider.
 */
function getMessageType(provider: string, success: boolean): string {
  const prefix = provider === 'outlook' ? 'OUTLOOK' : 'GOOGLE';
  return `${prefix}_OAUTH_${success ? 'SUCCESS' : 'ERROR'}`;
}

/**
 * Send result to the parent (opener) window and close the popup.
 */
function sendToOpenerAndClose(provider: string, data: unknown, isError = false) {
  const type = getMessageType(provider, !isError);
  const message = isError ? { type, error: data } : { type, data };
  window.opener.postMessage(message, window.location.origin);
  window.close();
}

const OAuthCallback = () => {
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const isPopup = isPopupWindow();

    const handleOAuthCallback = async () => {
      try {
        // Detect provider from URL or params
        const provider =
          searchParams.get('provider') ||
          (window.location.pathname.includes('outlook') ? 'outlook' : 'google');

        // Check if this is a success redirect from the backend
        const success = searchParams.get('success');
        const errorParam = searchParams.get('error');
        const message = searchParams.get('message');
        const data = searchParams.get('data');

        if (errorParam) {
          const errorMsg = decodeURIComponent(message || 'OAuth authentication failed');
          if (isPopup) {
            sendToOpenerAndClose(provider, errorMsg, true);
            return;
          }
          throw new Error(errorMsg);
        }

        if (success && data) {
          // This is a redirect from the backend with success data
          try {
            const response = JSON.parse(decodeURIComponent(data));
            console.log(`OAuth callback success (redirect) - ${provider}:`, response);

            // If running in a popup, send data to parent and close
            if (isPopup) {
              sendToOpenerAndClose(provider, response);
              return;
            }

            // Store authentication data securely (NOT in localStorage)
            login({ accessToken: response.accessToken, refreshToken: response.refreshToken }, response.user);

            // Show success message
            const providerName = provider === 'outlook' ? 'Microsoft' : 'Google';
            toast.success(`Successfully signed in with ${providerName}!`, {
              duration: 3000,
            });

            // Determine where to redirect
            let redirectPath = '/dashboard';

            if (response.isNewUser && response.needsWorkspaceSetup) {
              redirectPath = '/signup/step2';
            } else if (response.workspace) {
              redirectPath = '/dashboard';
            } else {
              const returnUrl = localStorage.getItem('oauth_return_url');
              if (returnUrl) {
                try {
                  const url = new URL(returnUrl);
                  redirectPath = url.pathname + url.search;
                  localStorage.removeItem('oauth_return_url');
                } catch (e) {
                  console.warn('Invalid return URL, using default');
                }
              }
            }

            router.replace(redirectPath);
            return;
          } catch (parseError) {
            console.error('Failed to parse OAuth success data:', parseError);
            if (isPopup) {
              sendToOpenerAndClose(provider, 'Failed to process authentication data', true);
              return;
            }
            throw new Error('Failed to process authentication data');
          }
        }

        // Fallback: handle direct OAuth callback with code (for popup flow)
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          if (isPopup) {
            sendToOpenerAndClose(provider, 'No authorization code received', true);
            return;
          }
          throw new Error('No authorization code received');
        }

        // Extract inviteId from state if present (format may vary by provider)
        let inviteId: string | undefined;
        if (state && state.includes(':')) {
          const [_, inviteIdPart] = state.split(':');
          inviteId = inviteIdPart;
        }

        console.log(`OAuth callback - ${provider}:`, { code, state, inviteId });

        // Route to appropriate OAuth service
        let response;
        if (provider === 'outlook') {
          response = await outlookOAuthService.handleCallback(code, state || undefined, inviteId);
        } else {
          response = await googleOauthService.handleCallback(code, state || undefined, inviteId);
        }

        console.log(`OAuth callback success - ${provider}:`, response);

        // If running in a popup, send data to parent and close
        if (isPopup) {
          sendToOpenerAndClose(provider, response);
          return;
        }

        // Store authentication data securely (NOT in localStorage)
        login({ accessToken: response.accessToken, refreshToken: response.refreshToken }, response.user as User);

        // Show success message
        const providerName = provider === 'outlook' ? 'Microsoft' : 'Google';
        toast.success(`Successfully signed in with ${providerName}!`, {
          duration: 3000,
        });

        // Determine where to redirect
        let redirectPath = '/dashboard';

        if (response.isNewUser && response.needsWorkspaceSetup) {
          redirectPath = '/signup/step2';
        } else if (inviteId || response.workspace) {
          redirectPath = '/dashboard';
        } else {
          const returnUrl = localStorage.getItem('oauth_return_url');
          if (returnUrl) {
            try {
              const url = new URL(returnUrl);
              redirectPath = url.pathname + url.search;
              localStorage.removeItem('oauth_return_url');
            } catch (e) {
              console.warn('Invalid return URL, using default');
            }
          }
        }

        router.replace(redirectPath);
      } catch (error) {
        console.error('OAuth callback error:', error);
        const errorMsg = error instanceof Error ? error.message : 'Authentication failed';

        // If running in a popup, send error to parent and close
        if (isPopup) {
          const provider =
            searchParams.get('provider') ||
            (window.location.pathname.includes('outlook') ? 'outlook' : 'google');
          sendToOpenerAndClose(provider, errorMsg, true);
          return;
        }

        setError(errorMsg);
        setIsProcessing(false);

        toast.error('Authentication failed. Please try again.', {
          duration: 5000,
        });

        setTimeout(() => {
          router.replace('/signin');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, login]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-black mb-2">Completing sign-in...</h2>
          <p className="text-gray-600">Please wait while we complete your sign-in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Failed</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-600">
              You will be redirected to the sign in page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
