import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const array = crypto.getRandomValues(new Uint8Array(8));
  let code = "";
  for (let i = 0; i < array.length; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}
function validatePasswordStrength(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain both letters and numbers.";
  }
  return null;
}

export { validatePasswordStrength as a, generateReferralCode as g, hashPassword as h, verifyPassword as v };
