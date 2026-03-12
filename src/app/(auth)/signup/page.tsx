'use client';

import { startTransition, useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { AuthDivider } from '../../../modules/auth/components/AuthDivider';
import { SignUpForm, signUpSchema } from '@/modules/auth/schema';
import { useSignup } from '@/modules/auth/hooks';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { z } from 'zod/v4';
import { PhoneInput } from '@/components/ui/phone-input';
import { useRouter } from 'next/navigation';
import { AuthOAuthButtons } from '@/modules/auth/components/AuthOAuthButtons';
import { useAuthStore } from '@/store/authStore';
import { GoogleAuthResponse } from '@/services/google-oauth.service';
import { OAuthResponse, User } from '@/modules/auth/types';

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const { mutate: signup, isPending } = useSignup();

  const onSubmit = useCallback(
    (data: SignUpForm) => {
      signup(data, {
        onSuccess: (data) => {
          useAuthStore
            .getState()
            .login({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
          toast.success('Successfully signed up!');
          form.reset();
          startTransition(() => {
            router.replace('/dashboard');
          });
        },
        onError: (error: any) => {
          toast.error(error.message || 'Something went wrong. Please try again.');
        },
      });
    },
    [signup],
  );

  const handleOAuthSuccess = (response: OAuthResponse) => {
    const userWithMemberships = {
      ...response.user,
      memberships: response.user.memberships || [],
    } as User;
    useAuthStore
      .getState()
      .login(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        userWithMemberships,
      );

    if (response.isNewUser) {
      toast.success('Welcome! Your account has been created with Google.');
    } else {
      toast.success('Welcome back!');
    }

    // Check if workspace setup is needed
    if (response.needsWorkspaceSetup) {
      router.push('/workspace-setup');
      return;
    }

    // Go to dashboard if everything is set up
    router.push('/dashboard');
  };

  const handleOAuthError = (provider: string) => (error: Error) => {
    toast.error(`${provider} sign-up failed: ${error.message}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create an account</h1>
        <p className="text-muted-foreground">Join the alpha and start automating your outreach</p>
      </div>

      <AuthOAuthButtons
        onSuccess={handleOAuthSuccess}
        onError={handleOAuthError('google')}
        disabled={isPending}
        text={false ? 'Accept invitation with Google' : 'Continue with Google'}
        inviteId={undefined}
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
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center  mt-6 text-xs text-muted-foreground">
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
