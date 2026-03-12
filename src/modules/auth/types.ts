import { GoogleAuthResponse } from '@/services/google-oauth.service';
import { LinkedInAuthResponse } from '@/services/linkedin-oauth.service';
import { OutlookAuthResponse } from '@/services/outlook-oauth.service';

export interface User {
  id: string;
  email: string;
  provider?: string; // 'local', 'google', 'linkedin', 'outlook'
  profile: {
    firstName: string;
    lastName: string;
    phone: string | null;
    settings: Record<string, unknown>;
  };
  memberships: Array<{
    id: string;
    workspaceId: string;
    role: {
      name: string;
    };
    status: 'active' | 'pending';
  }>;
  createdAt?: string;
  updatedAt?: string;
  emailVerified?: boolean;
}

export type OAuthResponse = GoogleAuthResponse | LinkedInAuthResponse | OutlookAuthResponse;
