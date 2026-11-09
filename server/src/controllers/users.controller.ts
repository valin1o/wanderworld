import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import User from '../models/User';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          isApproved: user.isApproved,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = updateProfileSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const user = await User.findByIdAndUpdate(req.user!.userId, body.data, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = changePasswordSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const user = await User.findById(req.user!.userId).select('+passwordHash');
    if (!user) return next(new AppError('User not found.', 404));

    const valid = await user.comparePassword(body.data.currentPassword);
    if (!valid) return next(new AppError('Current password is incorrect.', 401));

    user.passwordHash = body.data.newPassword;
    await user.save();

    logger.info('Password changed', { userId: user._id.toString() });
    res.status(200).json({ status: 'success', message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? '20', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({ status: 'success', results: users.length, total, data: { users } });
  } catch (err) {
    next(err);
  }
}

export async function getPendingGuides(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const guides = await User.find({ role: 'guide', isApproved: false, isActive: true }).sort('-createdAt');
    res.status(200).json({ status: 'success', results: guides.length, data: { guides } });
  } catch (err) {
    next(err);
  }
}

export async function approveGuide(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!Types.ObjectId.isValid(id)) return next(new AppError('Invalid user ID.', 400));

    const user = await User.findOneAndUpdate(
      { _id: new Types.ObjectId(id), role: 'guide' },
      { isApproved: true },
      { new: true },
    );
    if (!user) return next(new AppError('Guide account not found.', 404));

    logger.info('Guide approved', { userId: user._id.toString(), adminId: req.user!.userId });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function rejectGuide(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!Types.ObjectId.isValid(id)) return next(new AppError('Invalid user ID.', 400));

    const user = await User.findOneAndUpdate(
      { _id: new Types.ObjectId(id), role: 'guide' },
      { isActive: false },
      { new: true },
    );
    if (!user) return next(new AppError('Guide account not found.', 404));

    logger.info('Guide rejected', { userId: user._id.toString(), adminId: req.user!.userId });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function changeUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!Types.ObjectId.isValid(id)) return next(new AppError('Invalid user ID.', 400));

    const { role } = z.object({ role: z.enum(['traveler', 'guide', 'admin']) }).parse(req.body);

    const user = await User.findByIdAndUpdate(
      new Types.ObjectId(id),
      { role },
      { new: true, runValidators: true },
    );
    if (!user) return next(new AppError('User not found.', 404));

    logger.info('User role changed', { userId: user._id.toString(), newRole: role });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!Types.ObjectId.isValid(id)) return next(new AppError('Invalid user ID.', 400));

    const user = await User.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isActive: false },
      { new: true },
    );
    if (!user) return next(new AppError('User not found.', 404));

    logger.info('User deactivated', { userId: user._id.toString(), adminId: req.user!.userId });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}
