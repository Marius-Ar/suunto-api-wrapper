const PART1 = "FBkubDYmN28bWVQLLTsWWhI+NAtILCNlPQc5Y";
const PART2 =
  "BgiMRYjKA99Jj4HHFIqLmomOFttBQchNzcZU0QrODcDWz4hekc1QGNTPlciNhEKGl5GPDkzFyVX";
const XOR_KEY = new TextEncoder().encode("Bh8nsTyCeC0Ql2drMen78awk84AE3ZxW");

const RAW = base64ToBytes(PART1 + PART2);
const SHARED = RAW.map((b, i) => b ^ XOR_KEY[i % XOR_KEY.length]);

const PBKDF2_ITERATIONS = 100;
const PBKDF2_KEY_LENGTH = 32;
const TOTP_PERIOD_MS = 30_000;
const TOTP_DIGITS = 6;

function getCrypto(): Crypto {
  const c = globalThis.crypto;
  if (!c?.subtle) {
    throw new Error(
      "Web Crypto API is unavailable. Use a browser or Node 20+ (or a global `crypto` polyfill).",
    );
  }
  return c;
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function generateXtotp(
  email: string,
  now: number = Date.now(),
): Promise<string> {
  const subtle = getCrypto().subtle;

  const baseKey = await subtle.importKey("raw", SHARED, "PBKDF2", false, [
    "deriveBits",
  ]);
  const derived = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(email),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-1",
    },
    baseKey,
    PBKDF2_KEY_LENGTH * 8,
  );

  const hmacKey = await subtle.importKey(
    "raw",
    derived,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const counter = BigInt(Math.floor(now / TOTP_PERIOD_MS));
  const msg = new Uint8Array(8);
  new DataView(msg.buffer).setBigUint64(0, counter, false);

  const mac = new Uint8Array(await subtle.sign("HMAC", hmacKey, msg));

  const offset = mac[mac.length - 1] & 0x0f;
  const view = new DataView(mac.buffer, mac.byteOffset, mac.byteLength);
  const binary = view.getUint32(offset, false) & 0x7fffffff;
  const code = binary % 10 ** TOTP_DIGITS;

  return code.toString().padStart(TOTP_DIGITS, "0");
}

export function secondsUntilRollover(now: number = Date.now()): number {
  const periodSeconds = TOTP_PERIOD_MS / 1000;
  return periodSeconds - (Math.floor(now / 1000) % periodSeconds);
}
