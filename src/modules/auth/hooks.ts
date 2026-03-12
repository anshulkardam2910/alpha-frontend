import { useMutation } from '@tanstack/react-query';
import { SignInForm, SignUpForm } from './schema';
import { authApi } from '@/services/auth';

export function useSignup() {
  return useMutation({
    mutationFn: (payload: SignUpForm) => authApi.signUp(payload),
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: (payload: SignInForm) => authApi.signIn(payload),
  });
}
