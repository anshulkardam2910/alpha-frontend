export interface User {
  id: string;
  email: string;
  provider?: string; // 'local', 'google', 'linkedin', 'outlook'
  profile: {
    firstName: string;
    lastName: string;
    phone: string | null;
    settings: Record<string, any>;
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
