import crypto from 'crypto';
import { cookies } from 'next/headers';
import getDb from './db';

const SESSION_COOKIE_NAME = 'cv_admin_session';
const SECRET_SALT = 'web_cv_secret_salt_2026';

// Hash password with SHA-256
export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SECRET_SALT).digest('hex');
}

// Generate session token
export function generateSessionToken(username) {
  const payload = `${username}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', SECRET_SALT).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

// Verify session token
export function verifySessionToken(token) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, timestamp, signature] = decoded.split(':');
    
    if (!username || !timestamp || !signature) return false;

    // Verify signature
    const expectedSig = crypto.createHmac('sha256', SECRET_SALT).update(`${username}:${timestamp}`).digest('hex');
    if (signature !== expectedSig) return false;

    // Session valid for 7 days
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 7 * 24 * 60 * 60 * 1000) return false;

    return username;
  } catch (e) {
    return false;
  }
}

// Get current authenticated admin user from cookies
export async function getAuthSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(sessionToken);
}

// Set session cookie
export async function setAuthCookie(username) {
  const cookieStore = await cookies();
  const token = generateSessionToken(username);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
  return token;
}

// Clear session cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
