import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET não está definido. Configure-o em .env.local (veja .env.local.example).",
    );
  }
  return new TextEncoder().encode(secret);
}

type SessionPayload = {
  username: string;
  expiresAt: number;
};

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expiresAt / 1000))
    .sign(getSecretKey());
}

async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(username: string) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = await encrypt({ username, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Optimistic read — does not redirect. Safe to call from Server Components/layouts. */
export async function getSession() {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
}

/**
 * Real authorization check for Server Actions and admin pages. Proxy
 * (src/proxy.ts) only redirects unauthenticated visitors for UX — it can be
 * silently bypassed by a route change, so every mutation and every admin
 * page re-checks the session here too (defense in depth, per Next.js' own
 * auth guide).
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Não autorizado.");
  }
  return session;
}

/** Same check as requireSession, but redirects instead of throwing — for Server Component admin pages/layouts. */
export async function requireSessionOrRedirect() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
