import Link from 'next/link';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { GridBackground } from './GridWithSpotlight';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
          radial-gradient(
            550px circle at 50% 60%,
            rgba(226,232,240,0.1) 0%,
            rgba(226,232,240,0.08) 40%,
            rgba(226,232,240,0.05) 60%,
            transparent 100%
          )
        `,
        }}
      />
      <GridBackground />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-muted/80 dark:bg-muted/40 border border-border/60 text-xs font-medium text-muted-foreground mb-10 tracking-wide">
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full mr-2.5 animate-pulse" />
          AI for GTM teams <Spinner className="ml-2" />
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

      <div className="relative z-10 max-w-5xl mx-auto mt-16">
        <div className="overflow-hidden rounded-xl border border-border/60 shadow-2xl shadow-black/10 dark:shadow-black/40">
          <Image
            src="/dashboard.png"
            alt="Alpha dashboard"
            width={1200}
            height={520}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="pointer-events-none hidden dark:block relative -mt-32 h-32 bg-linear-to-t from-background to-transparent" />
      </div>
    </section>
  );
}
