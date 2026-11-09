import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserRole } from '../models/User';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

function getSecret(envVar: string): string {
  const secret = process.env[envVar];
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
    return `dev_fallback_secret_${envVar}_wanderworld_1234567890`;
  }
  return secret;
}

export function signAccessToken(userId: Types.ObjectId | string, role: UserRole): string {
  const payload: JwtPayload = { userId: userId.toString(), role };
  const options: SignOptions = { expiresIn: '15m' };
  return jwt.sign(payload, getSecret('JWT_ACCESS_SECRET'), options);
}

export function signRefreshToken(userId: Types.ObjectId | string, role: UserRole): string {
  const payload: JwtPayload = { userId: userId.toString(), role };
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret('JWT_ACCESS_SECRET')) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as JwtPayload;
}
