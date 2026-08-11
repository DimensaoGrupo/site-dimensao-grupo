import "server-only";

import bcrypt from "bcryptjs";

/**
 * Single-admin credentials, sourced from environment variables — never
 * hardcoded. Generate ADMIN_PASSWORD_HASH with `npm run admin:hash-password`.
 */
export async function verifyCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash) {
    throw new Error(
      "ADMIN_USERNAME/ADMIN_PASSWORD_HASH não configurados. Veja .env.local.example.",
    );
  }

  if (username !== expectedUsername) return false;
  return bcrypt.compare(password, expectedHash);
}
