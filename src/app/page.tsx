import Link from 'next/link';
import Image from 'next/image';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

function MainHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 dark:bg-background/90 backdrop-blur-xl border-b border-border/80">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-foreground hover:opacity-90 transition-opacity duration-200"
        >
          <div className="relative w-8 h-8 shrink-0 rounded-md overflow-hidden bg-muted">
            <Image
              src="/alpha.jpg"
              alt="Alpha"
              fill
              className="object-cover"
              sizes="32px"
              priority
            />
          </div>
          <span className="font-semibold font-sans text-xl tracking-tight">alpha</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center bg-muted/40 dark:bg-muted/20 p-1.5 rounded-full border border-border/60 shadow-sm">
            <Link
              href="/"
              className="px-5 py-2 bg-background dark:bg-card/80 rounded-full text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:shadow"
            >
              Home
            </Link>
            <Link
              href="#plans"
              className="px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Plans
            </Link>
            <Link
              href="#careers"
              className="px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Careers
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/signin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Sign in
          </Link>
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 px-6 text-center hero-glow">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-muted/80 dark:bg-muted/40 border border-border/60 text-xs font-medium text-muted-foreground mb-10 tracking-wide">
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full mr-2.5 animate-pulse" />
          AI for GTM teams <Spinner className='ml-2' />
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-foreground mb-8 leading-[1.08]">
          Full-Funnel Momentum
          <br />
          on Autopilot
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground/95 max-w-2xl mx-auto mb-12 leading-relaxed">
          Create compelling, perfectly-timed outreach on every channel, powered by agentic AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button
            asChild
            size="lg"
            className="rounded-xl px-8 py-3.5 h-auto font-semibold shadow-lg shadow-foreground/5 hover:shadow-xl hover:shadow-foreground/10 hover:bg-foreground/90 transition-all duration-200"
          >
            <Link href="#demo">See In Action</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl px-8 py-3.5 h-auto font-semibold border border-border/80 hover:bg-muted/40 hover:border-border transition-all duration-200"
          >
            <Link href="#beta">Join Beta</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground/70">
          No credit card required • Free 14-day trial
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen antialiased">
      <MainHeader />
      <main className="pt-20">
        <HeroSection />
      </main>
    </div>
  );
}
