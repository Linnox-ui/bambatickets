import crypto from "crypto";

const HQ_SECRET =
  process.env.HQ_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "bamba-hq-fallback-secret-key-32chars";

const rateLimitMap = new Map<
  string,
  { attempts: number; lockedUntil: number }
>();

export function checkRateLimit(
  ip: string,
  maxAttempts = 3,
  lockoutMinutes = 15,
): { allowed: boolean; waitTimeMinutes?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (record && record.lockedUntil > now) {
    const waitTime = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, waitTimeMinutes: waitTime };
  }

  if (record && record.lockedUntil <= now) {
    rateLimitMap.delete(ip);
  }

  return { allowed: true };
}

export function recordFailedAttempt(
  ip: string,
  maxAttempts = 3,
  lockoutMinutes = 15,
) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockoutMinutes * 60 * 1000;
  }

  rateLimitMap.set(ip, record);
}

export function resetRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function signClearanceToken(payload: {
  clearance: string;
  timestamp: number;
}): string {
  const data = `${payload.clearance}:${payload.timestamp}`;
  const signature = crypto
    .createHmac("sha256", HQ_SECRET)
    .update(data)
    .digest("hex");
  return `${data}.${signature}`;
}

export function verifyClearanceToken(
  token: string,
  maxAgeMinutes: number,
): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", HQ_SECRET)
    .update(data)
    .digest("hex");

  if (!timingSafeCompare(signature, expectedSignature)) return false;

  const [, timestampStr] = data.split(":");
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const ageMinutes = (Date.now() - timestamp) / (1000 * 60);
  return ageMinutes <= maxAgeMinutes;
}
