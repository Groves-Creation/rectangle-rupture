"use server";

import { redirect } from "next/navigation";

import { publicApiFetch } from "@/lib/api/server-client";
import { isNextControlFlowError, serializeError } from "@/lib/api/errors";
import type { AuthResponse } from "@/lib/api/types";
import { clearAuthCookies, persistAuthResponse, readRefreshToken } from "@/lib/auth/cookies";

import type { LoginFormState } from "./types";

const DEVICE_IDENTIFIER = "lit-admin-dashboard";

/**
 * `POST /api/auth/login`.
 *
 * Runs on the server so the access and refresh tokens go straight into
 * httpOnly cookies and are never handed to the browser as JS-readable values.
 */
export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (email === "" || password === "") {
    return {
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Enter both an email address and a password.",
    };
  }

  let auth: AuthResponse;
  try {
    auth = await publicApiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password, deviceIdentifier: DEVICE_IDENTIFIER },
    });
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    return { status: "error", ...serializeError(error) };
  }

  await persistAuthResponse(auth);
  // Outside the try/catch: redirect signals by throwing.
  redirect("/orders");
}

/**
 * `POST /api/auth/logout`. The cookies are cleared regardless of whether the
 * API call succeeds — a stale server-side session is better than leaving the
 * operator apparently signed in.
 */
export async function signOutAction(): Promise<void> {
  const refreshToken = await readRefreshToken();

  if (refreshToken) {
    try {
      await publicApiFetch<void>("/api/auth/logout", {
        method: "POST",
        body: { refreshToken },
      });
    } catch {
      // Best effort.
    }
  }

  await clearAuthCookies();
  redirect("/login");
}
