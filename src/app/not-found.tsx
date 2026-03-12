import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border">
          <FileQuestion className="size-8" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Button asChild size="lg" className="min-w-[140px]">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  )
}
