'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthDivider } from '@/modules/auth/components/AuthDivider';
import { ApiError, post as apiPost } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/api.config';
import { type SignInForm, signInSchema } from '@/modules/auth/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { AuthOAuthButtons } from '@/modules/auth/components/AuthOAuthButtons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn } from '@/modules/auth/hooks';
import { useAuthStore } from '@/store/authStore';
import { type OAuthResponse, type User } from '@/modules/auth/types';

const REASON_MESSAGES: Record<string, string> = {
  session_expired: 'Your session has expired. Please log in again.',
};

export default function SignInPage() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('invite');
  const reason = searchParams.get('reason');

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: signIn, isPending } = useSignIn();
  const messageShownRef = useRef(false);

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (reason && REASON_MESSAGES[reason] && !messageShownRef.current) {
      messageShownRef.current = true;
      toast.error(REASON_MESSAGES[reason]);
    }
  }, [reason]);

  function onSubmit(data: SignInForm) {
    signIn(data, {
      onSuccess: async (response) => {
        useAuthStore.getState().login(
          { accessToken: response.accessToken, refreshToken: response.refreshToken },
          response.user,
        );

        if (inviteId) {
          try {
            await apiPost(API_ENDPOINTS.WORKSPACE.ACCEPT_INVITE_BY_MEMBERSHIP(inviteId));
            toast.success('Welcome back! Invitation accepted.');
          } catch {
            toast.success('Successfully logged in!');
            toast.error('Failed to accept invitation. You can accept it from the Invites page.');
          }
        } else {
          toast.success('Successfully logged in!');
        }

        form.reset();
        startTransition(() => {
          router.replace('/dashboard');
        });
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (
            error.message.includes('pending invitation') ||
            error.message.includes('complete your account setup')
          ) {
            toast.error('You have a pending invitation. Please complete your account setup.');
            startTransition(() => {
              router.replace(`/signup?email=${encodeURIComponent(form.getValues('email'))}`);
            });
            return;
          }

          if (error.isValidation() && error.errors) {
            Object.entries(error.errors).forEach(([field, messages]) => {
              form.setError(field as keyof SignInForm, { message: messages[0] });
            });
            return;
          }

          toast.error(error.message);
          return;
        }

        toast.error('Something went wrong. Please try again.');
      },
    });
  }

  function handleOAuthSuccess(response: OAuthResponse) {
    const userWithMemberships = {
      ...response.user,
      memberships: response.user.memberships ?? [],
    } as User;

    useAuthStore.getState().login(
      { accessToken: response.accessToken, refreshToken: response.refreshToken },
      userWithMemberships,
    );

    toast.success(response.isNewUser ? 'Welcome! Your account has been created.' : 'Welcome back!');

    startTransition(() => {
      router.replace(response.needsWorkspaceSetup ? '/workspace-setup' : '/dashboard');
    });
  }

  const signUpHref = inviteId ? `/signup?invite=${inviteId}` : '/signup';

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Log in to your account</p>
        <p className="text-sm text-muted-foreground mt-1">
          Good to see you again. Ready to pick up where you left off?
        </p>
      </div>

      <AuthOAuthButtons
        onSuccess={handleOAuthSuccess}
        onError={(error: Error) => toast.error(`Sign-in failed: ${error.message}`)}
        disabled={isPending}
        text="Continue with Google"
        inviteId={inviteId ?? undefined}
        isSignup={false}
      />

      <AuthDivider label="or" />

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12"
                  autoComplete="username"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-12 pr-10"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 cursor-pointer" />
                    ) : (
                      <Eye className="h-5 w-5 cursor-pointer" />
                    )}
                  </button>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button type="submit" className="w-full h-12" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center mt-8 text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href={signUpHref} className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
