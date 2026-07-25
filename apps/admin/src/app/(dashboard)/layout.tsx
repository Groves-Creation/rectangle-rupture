import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-bold tracking-widest text-primary-foreground">
              LIT
            </span>
            <span className="hidden text-sm font-semibold sm:inline">
              Headquarters
            </span>
          </div>

          <MainNav />

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{session.user.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {session.user.email}
              </p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut aria-hidden="true" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
