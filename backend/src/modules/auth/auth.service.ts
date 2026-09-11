import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

// short lived, sent in the response body, frontend keeps it in memory
// (NOT localStorage - that's an XSS magnet, brief specifically calls this out)
export function generateAccessToken(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY as any });
}

// long lived, goes in an HttpOnly cookie so client-side JS literally cannot
// touch it. this is the whole point of storing it this way
function generateRefreshToken(user: { id: string }) {
return jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY as any });
}

// we hash the refresh token before storing it, same idea as passwords -
// if the DB ever leaks, raw refresh tokens sitting in a table would be
// basically "here's a free login to anyone", no thanks
function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid credentials'); // same msg for both cases on purpose

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // store the hashed refresh token so we can revoke it later on logout
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days, matches REFRESH_TOKEN_EXPIRY
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { id: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
  } catch {
    throw new ApiError(401, 'Refresh token expired or invalid, please log in again');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.id, tokenHash, revoked: false },
  });

  // token not in DB (or revoked) = someone's using an old/stolen token. deny
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token not recognized, please log in again');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw new ApiError(401, 'User not found');

  return generateAccessToken(user);
}

export async function logoutUser(refreshToken: string) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  // just mark it revoked instead of deleting, keeps an audit trail if we ever need it
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}
