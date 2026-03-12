'use client';

import { useState, useCallback, startTransition } from 'react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthDivider } from '@/modules/auth/components/AuthDivider';
import { authApi } from '@/services/auth';
import { ApiError } from '@/lib/apiClient';
import { SignInForm, signInSchema } from '@/modules/auth/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { AuthOAuthButtons } from '@/modules/auth/components/AuthOAuthButtons';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@/modules/auth/hooks';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: signIn, isPending } = useSignIn();

  const onSubmit = useCallback(
    (data: SignInForm) => {
      signIn(data, {
        onSuccess: (response) => {
          //TODO: Set Tokens and user data in the context
          toast.success('Successfully logged in!');
          form.reset();
          startTransition(() => {
            router.replace('/dashboard');
          });
        },
        onError: (error: unknown) => {
          if (error instanceof ApiError) {
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
    },
    [signIn],
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Log in to your account</p>
        <p className="text-sm text-muted-foreground mt-1">
          Good to see you again. Ready to pick up where you left off?
        </p>
      </div>

      <AuthOAuthButtons />

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
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
