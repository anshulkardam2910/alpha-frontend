import { Spinner } from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading…
        </p>
      </div>
    </div>
  )
}
