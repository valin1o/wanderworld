import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import User from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['traveler', 'guide']).default('traveler'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, COOKIE_OPTIONS);
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', path: '/' });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const { name, email, password, role } = body.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const isApproved = role !== 'guide';

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      isApproved,
    });

    logger.info('User registered', { userId: user._id.toString(), role });

    if (!isApproved) {
      res.status(201).json({
        status: 'pending',
        message: 'Your guide account has been created and is awaiting admin approval. You will be notified once approved.',
      });
      return;
    }

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id, user.role);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      status: 'success',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError('Invalid email or password.', 400));
    }

    const { email, password } = body.data;

    const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    if (!user.isApproved) {
      return next(new AppError('Your guide account is pending admin approval.', 403));
    }

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id, user.role);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });

    logger.info('User logged in', { userId: user._id.toString() });

    setRefreshCookie(res, refreshToken);
    res.status(200).json({
      status: 'success',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token: string | undefined = req.cookies?.refreshToken;
    if (!token) {
      return next(new AppError('Refresh token not found.', 401));
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return next(new AppError('Invalid or expired refresh token.', 401));
    }

    const user = await User.findById(payload.userId).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      return next(new AppError('Session not found. Please log in again.', 401));
    }

    const tokenMatches = await bcrypt.compare(token, user.refreshTokenHash);
    if (!tokenMatches) {
      return next(new AppError('Refresh token reuse detected. Please log in again.', 401));
    }

    if (!user.isActive || !user.isApproved) {
      return next(new AppError('Account access denied.', 403));
    }

    const newAccessToken = signAccessToken(user._id, user.role);
    const newRefreshToken = signRefreshToken(user._id, user.role);
    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, newRefreshToken);
    res.status(200).json({
      status: 'success',
      accessToken: newAccessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token: string | undefined = req.cookies?.refreshToken;
    if (token) {
      let payload;
      try {
        payload = verifyRefreshToken(token);
        await User.findByIdAndUpdate(payload.userId, { $unset: { refreshTokenHash: '' } });
      } catch {
        // Ignore token errors during logout
      }
    }

    clearRefreshCookie(res);
    res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}
