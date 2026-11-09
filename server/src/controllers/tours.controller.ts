import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { z } from 'zod';
import Tour from '../models/Tour';
import { ApiFeatures } from '../utils/apiFeatures';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

const tourTagEnum = z.enum(['mountains', 'sea', 'culture', 'adventure', 'wildlife', 'urban', 'desert', 'forest', 'arctic']);

const createTourSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  destination: z.string().min(2).max(100),
  durationDays: z.number().int().min(1),
  price: z.number().min(0),
  maxGroupSize: z.number().int().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  images: z.array(z.string().url()).optional(),
  tags: z.array(tourTagEnum).optional(),
  startDates: z.array(z.coerce.date()).optional(),
});

const updateTourSchema = createTourSchema.partial();

export async function getAllTours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const baseQuery = Tour.find({ isActive: true }).populate('guideId', 'name avatarUrl');

    const features = new ApiFeatures(baseQuery, req.query as Record<string, string>)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.getQuery();
    const total = await Tour.countDocuments({ isActive: true });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      total,
      data: { tours },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTop5Cheap(req: Request, res: Response, next: NextFunction): Promise<void> {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'title,slug,price,ratingsAverage,difficulty,destination,images,durationDays';
  return getAllTours(req, res, next);
}

export async function getTourBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug, isActive: true })
      .populate('guideId', 'name email avatarUrl');

    if (!tour) {
      return next(new AppError('Tour not found.', 404));
    }

    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    next(err);
  }
}

export async function createTour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createTourSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const slug = slugify(body.data.title, { lower: true, strict: true });
    const guideId = req.user!.userId;

    const tour = await Tour.create({ ...body.data, slug, guideId });
    logger.info('Tour created', { tourId: tour._id.toString(), guideId });

    res.status(201).json({ status: 'success', data: { tour } });
  } catch (err) {
    next(err);
  }
}

export async function updateTour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = updateTourSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const tour = await Tour.findById(req.params.id);
    if (!tour || !tour.isActive) {
      return next(new AppError('Tour not found.', 404));
    }

    if (req.user!.role === 'guide' && tour.guideId.toString() !== req.user!.userId) {
      return next(new AppError('You can only edit your own tours.', 403));
    }

    const updated = await Tour.findByIdAndUpdate(req.params.id, body.data, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: 'success', data: { tour: updated } });
  } catch (err) {
    next(err);
  }
}

export async function deleteTour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour || !tour.isActive) {
      return next(new AppError('Tour not found.', 404));
    }

    if (req.user!.role === 'guide' && tour.guideId.toString() !== req.user!.userId) {
      return next(new AppError('You can only delete your own tours.', 403));
    }

    await Tour.findByIdAndUpdate(req.params.id, { isActive: false });
    logger.info('Tour soft-deleted', { tourId: req.params.id });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}
