'use client';
import { API_CONFIG } from '@/lib/api.config';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const LinkedInCallback = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const isNewUser = searchParams.get('isNewUser') === 'true';
        const needsWorkspaceSetup = searchParams.get('needsWorkspaceSetup') === 'true';
        const error = searchParams.get('error');

        // Check if we're in a popup window
        const isPopup = window.opener && window.opener !== window;

        console.log('LinkedIn Callback - Processing:', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          isNewUser,
          needsWorkspaceSetup,
          error,
          isPopup,
        });

        if (error) {
          if (isPopup) {
            window.opener.postMessage(
              {
                type: 'LINKEDIN_OAUTH_ERROR',
                error: decodeURIComponent(error),
              },
              window.location.origin,
            );
            window.close();
            return;
          }
          toast.error(`LinkedIn authentication failed: ${decodeURIComponent(error)}`);
          router.replace('/login');
          return;
        }

        if (!accessToken || !refreshToken) {
          if (isPopup) {
            window.opener.postMessage(
              {
                type: 'LINKEDIN_OAUTH_ERROR',
                error: 'Invalid authentication response from LinkedIn',
              },
              window.location.origin,
            );
            window.close();
            return;
          }
          toast.error('Invalid authentication response from LinkedIn');
          router.replace('/login');
          return;
        }

        // Get user data from the backend
        const response = await fetch(`${API_CONFIG.BASE_URL}/identity/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get user data');
        }

        const userData = await response.json();

        if (isPopup) {
          // Send success message to parent window
          window.opener.postMessage(
            {
              type: 'LINKEDIN_OAUTH_SUCCESS',
              data: {
                accessToken,
                refreshToken,
                user: userData,
                isNewUser,
                needsWorkspaceSetup,
              },
            },
            window.location.origin,
          );
          window.close();
          return;
        }

        // Set tokens and user data for direct navigation
        login({ accessToken, refreshToken }, userData);

        // Handle workspace setup for new users
        if (isNewUser && needsWorkspaceSetup) {
          toast.success('Welcome! Please set up your workspace.');
          router.replace('/workspace-setup');
          return;
        }

        // For existing users, check if they have a current workspace - use the earliest created workspace
       /*  if (userData.memberships && userData.memberships.length > 0) {
          const earliestMembership = getEarliestWorkspace(userData.memberships);
          if (earliestMembership) {
            await switchWorkspace(earliestMembership.workspaceId);
            toast.success('Welcome back!');
            navigate('/dashboard');
            return;
          }
        } */

        // If no active workspace, redirect to workspace setup
        toast.success('Please set up your workspace.');
        router.replace('/workspace-setup');
      } catch (error: any) {
        console.error('LinkedIn callback error:', error);

        // Check if we're in a popup window
        const isPopup = window.opener && window.opener !== window;

        if (isPopup) {
          window.opener.postMessage(
            {
              type: 'LINKEDIN_OAUTH_ERROR',
              error: error.message || 'Authentication failed',
            },
            window.location.origin,
          );
          window.close();
          return;
        }

        toast.error('Authentication failed. Please try again.');
        router.replace('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router, login]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Processing LinkedIn authentication...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default LinkedInCallback;