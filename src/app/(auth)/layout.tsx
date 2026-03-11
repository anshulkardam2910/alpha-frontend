import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-linear-to-br from-background to-muted/40">
        <div className="w-full max-w-md space-y-8">
          <Image
            src="/alpha.jpg"
            alt="Alpha"
            width={120}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
          {children}
        </div>
      </div>
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-linear-to-br to-neutral-950"
        aria-hidden
      />
    </div>
  );
}
