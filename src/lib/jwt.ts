import jwt from "jsonwebtoken"

// Dynamically retrieve JWT secret to avoid caching module-level constant
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return secret;
}

export function signJwt(payload: object) {
  const secret = getJwtSecret();
  console.log("Signing JWT with secret:", secret ? '***' : 'undefined');
  return jwt.sign(payload, secret, { expiresIn: '30d' });
}

export function verifyJwt(token: string) {
  const secret = getJwtSecret();
  console.log("Verifying JWT with secret:", secret ? '***' : 'undefined');
  try {
    return jwt.verify(token, secret);
  } catch (err: any) {
    console.log("JWT verification error:", err.message);
    console.log("Invalid token:", token);
    return null;
  }
}