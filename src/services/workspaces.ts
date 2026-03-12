//TODO: Implement workspaces API

/* import { apiClient } from '@/lib/apiClient';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export const workspacesApi = {
  getAll: async (): Promise<Workspace[]> => {
    const { data } = await apiClient.get('/workspaces');
    return data;
  },
  getById: async (id: string): Promise<Workspace> => {
    const { data } = await apiClient.get(`/workspaces/${id}`);
    return data;
  },
  create: async (payload: Pick<Workspace, 'name' | 'slug'>) => {
    const { data } = await apiClient.post('/workspaces', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Workspace>) => {
    const { data } = await apiClient.patch(`/workspaces/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/workspaces/${id}`);
  },
}; */