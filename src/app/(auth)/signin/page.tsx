"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { AuthOAuthButtons } from "../../../modules/auth/components/AuthOAuthButtons";
import { AuthDivider } from "../../../modules/auth/components/AuthDivider";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Dummy form - no submission
  }

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

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email or username</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="h-12"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-12 pr-10"
              autoComplete="current-password"
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
        </div>

        <Button type="submit" className="w-full h-12">
          Sign In
        </Button>
      </form>

      <p className="text-center mt-8 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
