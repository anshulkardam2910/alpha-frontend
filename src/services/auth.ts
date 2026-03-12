import { API_ENDPOINTS } from '@/lib/api.config';
import { post } from '@/lib/apiClient';
import { SignInForm, SignUpForm } from '@/modules/auth/schema';
import { AuthResponse } from '@/utils/types';

export const authApi = {
  signIn: (payload: SignInForm) => post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, payload),

  signUp: (payload: SignUpForm) => post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, payload),

  logout: () => post<void>(API_ENDPOINTS.AUTH.LOGOUT),
};
