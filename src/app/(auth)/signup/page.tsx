"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { AuthOAuthButtons } from "../../../modules/auth/components/AuthOAuthButtons";
import { AuthDivider } from "../../../modules/auth/components/AuthDivider";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Dummy form - no submission
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create an account</h1>
        <p className="text-muted-foreground">
          Get started with your free account today
        </p>
      </div>

      <AuthOAuthButtons />

      <AuthDivider label="or continue with email" className="my-0 mb-6" />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="John"
              className="h-12"
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              className="h-12"
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@company.com"
            className="h-12"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="h-12 pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
        </div>

        <Button type="submit" className="w-full h-12">
          Create account
        </Button>
      </form>

      <p className="text-center mt-6 text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link href="#" className="text-primary hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
