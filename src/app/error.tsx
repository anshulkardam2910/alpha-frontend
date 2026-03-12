'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <AlertCircle className="size-8" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. We&apos;ve been notified and are looking into it.
          </p>
        </div>
        <Button
          onClick={() => reset()}
          size="lg"
          className="min-w-[140px]"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}
