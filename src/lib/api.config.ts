export const API_CONFIG = {
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/identity/auth/login',
    SIGNUP: '/identity/auth/signup',
    REFRESH: '/identity/auth/refresh',
    LOGOUT: '/identity/auth/logout',
    FORGOT_PASSWORD: '/identity/auth/forgot-password',
    RESET_PASSWORD: '/identity/auth/reset-password',
    VERIFY_EMAIL: '/identity/auth/verify-email',
    SET_PASSWORD: '/identity/auth/set-password',
    ME: '/identity/users/me',
  },
  GOOGLE_OAUTH: {
    INITIATE: '/identity/auth/google/initiate',
    CALLBACK: '/identity/auth/google/callback',
  },
  LINKEDIN_OAUTH: {
    INITIATE: '/identity/auth/linkedin/initiate',
    CALLBACK: '/identity/auth/linkedin/callback',
  },
  OUTLOOK_OAUTH: {
    INITIATE: '/identity/auth/outlook/initiate',
    CALLBACK: '/identity/auth/outlook/callback',
  },
  WORKSPACE: {
    ACCEPT_INVITE_BY_MEMBERSHIP: (membershipId: string) =>
      `/identity/workspaces/accept-invite/${membershipId}`,
  },
} as const;
