//Global types for the application

import { User } from '@/modules/auth/types';

//TODO: Types Not confirmed yet for workspace, member, etc. also move them to a separate file

export interface Workspace {
  id: string;
  name: string;
  domain: string;
  uniqueId?: string;
  owner: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  } | null;
  role?: string;
  createdAt: string;
  members?: WorkspaceMember[];
  currentUserId?: string;
}

export interface WorkspaceMember {
  id: string | null;
  email: string;
  role: string;
  status: 'active' | 'pending';
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  workspace?: Workspace;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
