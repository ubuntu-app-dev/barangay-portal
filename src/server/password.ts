import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024;

function scrypt(password: string, salt: Buffer, keylen: number, n: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, { N: n, r, p, maxmem: MAXMEM }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

/** Stored as "scrypt:N:r:p:salt:hash" (base64). Built into Node, no native dependency. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64"), hash.toString("base64")].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length, Number(n), Number(r), Number(p));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** At least `min` characters with a letter and a number. Returns a message, or null when acceptable. */
export function passwordProblem(password: string, min = 8): string | null {
  if (password.length < min) return `Use at least ${min} characters.`;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Use both letters and numbers.";
  return null;
}

/** A readable temporary password (no 0/O or 1/l), e.g. "Kp7r-Xw4m-Tq9d". */
export function temporaryPassword() {
  const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const bytes = randomBytes(12);
  const part = (o: number) => letters[bytes[o] % letters.length] + digits[bytes[o + 1] % digits.length] + letters[bytes[o + 2] % letters.length] + letters[bytes[o + 3] % letters.length];
  return `${part(0)}-${part(4)}-${part(8)}`;
}
