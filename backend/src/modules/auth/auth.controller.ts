import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { loginUser, refreshAccessToken, logoutUser } from './auth.service';
import { env } from '../../config/env';

// cookie options, pulled out so login + refresh + logout all agree on the
// same settings (learned this the hard way, had a bug where logout wasnt
// clearing the cookie bc the options didnt match exactly)
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // js cannot read this. thats the entire point
  secure: env.NODE_ENV === 'production', // https only in prod
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await loginUser(email, password);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({ success: true, accessToken, user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token, log in again' });
  }
  const accessToken = await refreshAccessToken(token);
  res.json({ success: true, accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  await logoutUser(token);
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.json({ success: true, message: 'logged out, see ya' });
});
