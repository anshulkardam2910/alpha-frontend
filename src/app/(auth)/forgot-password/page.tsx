"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: wire to forgot-password API
    setTimeout(() => setIsSubmitting(false), 1000);
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Forgot Your Password?
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
            autoComplete="email"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send Reset Instructions"}
        </Button>
      </form>

      <p className="text-center mt-8">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-primary font-medium underline hover:no-underline"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to Login
        </Link>
      </p>
    </>
  );
}
