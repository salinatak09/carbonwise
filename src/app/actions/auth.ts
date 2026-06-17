"use server";

import { signIn, signOut } from "@/lib/auth";

export async function loginWithGoogle() {
  try {
    await signIn("google", { redirectTo: "/dashboard" });
  } catch (error: any) {
    // Auth.js redirects by throwing a special error; we must rethrow it,
    // otherwise the redirect will fail.
    if (error?.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Google login error:", error);
    throw error;
  }
}

export async function loginAsDemo() {
  try {
    await signIn("credentials", {
      email: "demo@carbonwise.com",
      name: "Demo Eco Champion",
      redirectTo: "/dashboard",
    });
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.name === "Redirect") {
      throw error;
    }
    console.error("Demo login error:", error);
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
