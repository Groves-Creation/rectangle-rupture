import { redirect } from "next/navigation";

import { readSessionSnapshot } from "@/lib/auth/cookies";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in · LIT HQ",
};

export default async function LoginPage() {
  // Already signed in? Skip the form.
  const session = await readSessionSnapshot();
  if (session) {
    redirect("/orders");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold tracking-widest text-primary-foreground">
            LIT
          </span>
          <div>
            <h1 className="text-xl font-semibold">Headquarters sign in</h1>
            <p className="text-sm text-muted-foreground">
              Distribution platform administration
            </p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
