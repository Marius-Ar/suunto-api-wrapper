import crypto from "node:crypto";

const PART1 = "FBkubDYmN28bWVQLLTsWWhI+NAtILCNlPQc5Y";
const PART2 =
  "BgiMRYjKA99Jj4HHFIqLmomOFttBQchNzcZU0QrODcDWz4hekc1QGNTPlciNhEKGl5GPDkzFyVX";
const XOR_KEY = Buffer.from("Bh8nsTyCeC0Ql2drMen78awk84AE3ZxW");

const RAW = Buffer.from(PART1 + PART2, "base64");
const SHARED = Buffer.from(
  RAW.map((b, i) => b ^ XOR_KEY[i % XOR_KEY.length]),
);

const PBKDF2_ITERATIONS = 100;
const PBKDF2_KEY_LENGTH = 32;
const TOTP_PERIOD_MS = 30_000;
const TOTP_DIGITS = 6;

export function generateXtotp(email: string, now: number = Date.now()): string {
  const key = crypto.pbkdf2Sync(
    SHARED,
    Buffer.from(email, "utf8"),
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    "sha1",
  );

  const counter = BigInt(Math.floor(now / TOTP_PERIOD_MS));
  const msg = Buffer.allocUnsafe(8);
  msg.writeBigUInt64BE(counter);

  const mac = crypto.createHmac("sha1", key).update(msg).digest();

  const offset = mac[mac.length - 1] & 0x0f;
  const binary = mac.readUInt32BE(offset) & 0x7fffffff;
  const code = binary % 10 ** TOTP_DIGITS;

  return code.toString().padStart(TOTP_DIGITS, "0");
}

export function secondsUntilRollover(now: number = Date.now()): number {
  const periodSeconds = TOTP_PERIOD_MS / 1000;
  return periodSeconds - (Math.floor(now / 1000) % periodSeconds);
}
