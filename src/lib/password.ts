import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateReferralCode(): string {
  // CSPRNG instead of Math.random so codes cannot be predicted/enumerated.
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous look-alikes
  const array = crypto.getRandomValues(new Uint8Array(8));
  let code = '';
  for (let i = 0; i < array.length; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

/**
 * Minimum password strength enforced at registration and admin login setup.
 * Returns an error message, or null when the password is acceptable.
 */
export function validatePasswordStrength(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain both letters and numbers.';
  }
  return null;
}
