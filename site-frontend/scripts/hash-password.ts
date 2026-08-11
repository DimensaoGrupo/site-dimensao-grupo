import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Uso: npm run admin:hash-password -- <senha>");
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  // Next.js expands `$VAR` references in .env files, and a bcrypt hash is
  // full of literal `$` — every one has to be escaped as `\$` or Next
  // silently truncates the value at each one (see docs/environment-variables.md).
  const escaped = hash.replaceAll("$", "\\$");
  console.log("\nAdicione isto ao seu .env.local (os \\$ são necessários — não remova):\n");
  console.log(`ADMIN_PASSWORD_HASH=${escaped}\n`);
});
