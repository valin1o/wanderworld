import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import Review from '../models/Review';
import Booking from '../models/Booking';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000),
});

const updateReviewSchema = createReviewSchema.partial();

export async function getReviewsByTour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reviews = await Review.find({ tourId: req.params.tourId })
      .populate('userId', 'name avatarUrl')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
  } catch (err) {
    next(err);
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createReviewSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const userId = req.user!.userId;
    const tourId = String(req.params.tourId);

    if (!Types.ObjectId.isValid(tourId)) {
      return next(new AppError('Invalid tour ID.', 400));
    }

    const hasBooking = await Booking.findOne({
      userId: new Types.ObjectId(userId),
      tourId: new Types.ObjectId(tourId),
      status: 'confirmed',
    });
    if (!hasBooking) {
      return next(new AppError('You can only review tours you have booked and completed.', 403));
    }

    const existing = await Review.findOne({ userId: new Types.ObjectId(userId), tourId: new Types.ObjectId(tourId) });
    if (existing) {
      return next(new AppError('You have already reviewed this tour.', 409));
    }

    const review = await Review.create({
      userId: new Types.ObjectId(userId),
      tourId: new Types.ObjectId(tourId),
      rating: body.data.rating,
      comment: body.data.comment,
    });

    logger.info('Review created', { reviewId: review._id.toString(), tourId });

    res.status(201).json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
}

export async function updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = updateReviewSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new AppError('Review not found.', 404));
    }

    if (review.userId.toString() !== req.user!.userId) {
      return next(new AppError('You can only edit your own reviews.', 403));
    }

    Object.assign(review, body.data);
    await review.save();

    res.status(200).json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new AppError('Review not found.', 404));
    }

    const isOwner = review.userId.toString() === req.user!.userId;
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('You can only delete your own reviews.', 403));
    }

    await Review.findByIdAndDelete(req.params.id);
    logger.info('Review deleted', { reviewId: req.params.id });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}
