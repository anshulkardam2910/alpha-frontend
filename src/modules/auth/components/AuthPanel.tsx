'use client';

import { usePathname } from 'next/navigation';

const signInContent = {
  headline: 'Every rep saves 40+ hours per week.',
  subtitle: 'Powered by GTM-AI agents.',
};

const signUpContent = {
  headline: 'Join the alpha.',
  subtitle: 'Start automating your outreach.',
};

export function AuthPanel() {
  const pathname = usePathname();
  const isSignUp = pathname === '/signup';
  const content = isSignUp ? signUpContent : signInContent;

  return (
    <div
      className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-8 text-center"
      aria-hidden
    >
      <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-100 leading-tight tracking-tight">
        {content.headline}
      </p>
      <p className="mt-3 font-serif text-base sm:text-lg text-neutral-400 font-normal">
        {content.subtitle}
      </p>
    </div>
  );
}
