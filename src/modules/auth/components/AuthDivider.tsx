import { cn } from "@/lib/utils";

export function AuthDivider({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative my-8", className)}>
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background/80 backdrop-blur px-3 text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
