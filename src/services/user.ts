import { API_ENDPOINTS } from '@/lib/api.config';
import { get } from '@/lib/apiClient';
import { User } from '@/modules/auth/types';

export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    return get<User>(API_ENDPOINTS.AUTH.ME);
  },
};
