'use client';

import { startTransition, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { AuthDivider } from '../../../modules/auth/components/AuthDivider';
import { type SignUpForm, signUpSchema } from '@/modules/auth/schema';
import { useSignup } from '@/modules/auth/hooks';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { type z } from 'zod/v4';
import { PhoneInput } from '@/components/ui/phone-input';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthOAuthButtons } from '@/modules/auth/components/AuthOAuthButtons';
import { useAuthStore } from '@/store/authStore';
import { type OAuthResponse, type User } from '@/modules/auth/types';
import { useQuery } from '@tanstack/react-query';
import { get as apiGet } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/api.config';

interface InviteInfo {
  membershipId: string;
  workspaceName: string;
  workspaceDomain: string;
  role: string;
  userEmail: string;
}

interface PendingInvite {
  membershipId: string;
  workspace: { name: string; domain: string };
  role: string;
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('invite');
  const inviteEmail = searchParams.get('email');

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: signup, isPending } = useSignup();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: (inviteId && inviteEmail) ? inviteEmail : '',
      phone: '',
      password: '',
    },
  });

  const inviteInfoQuery = useQuery({
    queryKey: ['invite-info', inviteId],
    queryFn: ({ signal }) =>
      apiGet<InviteInfo>(API_ENDPOINTS.INVITES.INFO(inviteId!), { signal }),
    enabled: !!inviteId,
  });

  const pendingInviteQuery = useQuery({
    queryKey: ['pending-invite', inviteEmail],
    queryFn: ({ signal }) =>
      apiGet<PendingInvite[]>(
        API_ENDPOINTS.INVITES.PENDING_BY_EMAIL(encodeURIComponent(inviteEmail!)),
        { signal },
      ),
    enabled: !!inviteEmail && !inviteId,
  });

  const pendingInvite = pendingInviteQuery.data?.[0];

  const inviteInfo: InviteInfo | null =
    inviteInfoQuery.data ??
    (pendingInvite
      ? {
          membershipId: pendingInvite.membershipId,
          workspaceName: pendingInvite.workspace.name,
          workspaceDomain: pendingInvite.workspace.domain,
          role: pendingInvite.role,
          userEmail: inviteEmail!,
        }
      : null);

  const isInviteSignup = !!inviteInfo;

  useEffect(() => {
    if (!inviteInfo) return;
    if (inviteInfo.userEmail) form.setValue('email', inviteInfo.userEmail);
    form.setValue('inviteId', inviteInfo.membershipId);
  }, [inviteInfo, form]);

  useEffect(() => {
    if (pendingInvite) {
      toast.success(
        `You have a pending invitation to join ${pendingInvite.workspace.name}. Complete your account setup to accept it.`,
      );
    }
  }, [pendingInvite]);

  function onSubmit(formData: SignUpForm) {
    signup(formData, {
      onSuccess: (response) => {
        useAuthStore.getState().login(
          { accessToken: response.accessToken, refreshToken: response.refreshToken },
          response.user,
        );

        toast.success(
          isInviteSignup
            ? 'Account created and invitation accepted! Welcome to the workspace.'
            : 'Successfully signed up!',
        );

        startTransition(() => {
          router.replace(isInviteSignup ? '/dashboard' : '/workspace-setup');
        });

        form.reset();
      },
      onError: (error) => {
        const message = error.message || 'Failed to sign up';
        if (message.includes('workspace exists')) {
          toast.error(
            'This workspace already exists. An invitation has been sent to the workspace owner.',
          );
        } else {
          toast.error(message);
        }
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

    if (isInviteSignup) {
      toast.success('Invitation accepted!');
    }

    startTransition(() => {
      router.replace(response.needsWorkspaceSetup ? '/workspace-setup' : '/dashboard');
    });
  }

  return (
    <div>
      <div className="mb-8">
        {isInviteSignup && inviteInfo ? (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 mb-4">
              <span className="text-white font-bold text-lg">
                {inviteInfo.workspaceName[0]?.toUpperCase() ?? 'W'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Join {inviteInfo.workspaceName}
            </h1>
            <p className="text-muted-foreground">
              You&apos;ve been invited as a{' '}
              <span className="font-medium text-foreground">{inviteInfo.role}</span>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-muted-foreground">
              Join the alpha and start automating your outreach
            </p>
          </>
        )}
      </div>

      <AuthOAuthButtons
        onSuccess={handleOAuthSuccess}
        onError={(error: Error) => toast.error(`Sign-up failed: ${error.message}`)}
        disabled={isPending}
        inviteId={inviteId ?? undefined}
        text={isInviteSignup ? 'Accept invitation with Google' : 'Continue with Google'}
        isSignup={true}
      />

      <AuthDivider label="or continue with email" className="my-6" />

      <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    {...field}
                    id="firstName"
                    aria-invalid={fieldState.invalid}
                    className="h-10"
                    placeholder="John"
                    autoComplete="given-name"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    {...field}
                    id="lastName"
                    className="h-10"
                    aria-invalid={fieldState.invalid}
                    placeholder="Doe"
                    autoComplete="family-name"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <PhoneInput
                  placeholder="Enter a phone number"
                  {...field}
                  autoComplete="phone"
                  international={true}
                  defaultCountry="IN"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

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
                  placeholder="john@company.com"
                  className="h-10"
                  autoComplete="email"
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="h-10 pr-10"
                    autoComplete="new-password"
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
                <p className="text-xs text-muted-foreground">
                  At least 8 characters with uppercase, lowercase, number, and special character
                </p>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full h-12">
            {isPending
              ? 'Creating account...'
              : isInviteSignup
                ? 'Create account & join workspace'
                : 'Create account'}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center mt-6 text-xs text-muted-foreground">
        By signing up, you agree to our{' '}
        <Link href="#" className="text-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>

      <p className="text-center mt-4 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/signin" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
