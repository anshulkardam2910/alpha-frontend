import Image from "next/image";
import Link from "next/link";
import { AuthPanel } from "@/modules/auth/components/AuthPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-linear-to-br from-background to-muted/40">
        <div className="w-full max-w-md space-y-8">
          <Link href="/" className="block w-fit">
            <Image
              src="/alpha.jpg"
              alt="Alpha"
              width={120}
              height={48}
              className="h-12 w-auto object-contain rounded-xs"
              priority
            />
          </Link>
          {children}
        </div>
      </div>
      <div
        className="hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-linear-to-br from-neutral-900 to-neutral-950"
        aria-hidden
      >
        <AuthPanel />
      </div>
    </div>
  );
}
