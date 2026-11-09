import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import Tour from '../models/Tour';
import AiPreference from '../models/AiPreference';
import { generateTravelRecommendations } from '../services/watsonx.service';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

const preferencesSchema = z.object({
  terrain: z.array(z.enum(['mountains', 'sea', 'desert', 'forest', 'arctic'])).optional().default([]),
  activities: z
    .array(z.enum(['hiking', 'diving', 'sightseeing', 'culture', 'wildlife', 'food', 'adventure']))
    .optional()
    .default([]),
  budget: z.enum(['budget', 'mid-range', 'luxury']).default('mid-range'),
  travelStyle: z.enum(['solo', 'couple', 'family', 'group']).default('solo'),
  groupSize: z.number().int().min(1).default(1),
  durationDays: z.number().int().min(1).default(7),
  departureMonth: z.number().int().min(1).max(12).optional(),
});

export async function getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const prefs = await AiPreference.findOne({ userId: new Types.ObjectId(userId) });

    res.status(200).json({
      status: 'success',
      data: { preferences: prefs },
    });
  } catch (err) {
    next(err);
  }
}

export async function upsertPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = preferencesSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const userId = req.user!.userId;
    const prefs = await AiPreference.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { ...body.data, userId: new Types.ObjectId(userId) },
      { upsert: true, new: true, runValidators: true },
    );

    res.status(200).json({ status: 'success', data: { preferences: prefs } });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = preferencesSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const userId = req.user!.userId;
    const preferences = body.data;

    await AiPreference.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { ...preferences, userId: new Types.ObjectId(userId) },
      { upsert: true, runValidators: true },
    );

    const tagFilter = [...(preferences.terrain ?? []), ...(preferences.activities ?? [])];
    const tourQuery = Tour.find({ isActive: true, ...(tagFilter.length ? { tags: { $in: tagFilter } } : {}) })
      .select('title destination tags price durationDays difficulty ratingsAverage')
      .sort('-ratingsAverage')
      .limit(20)
      .lean();

    const tours = await tourQuery;

    const tourContext = tours.map((t) => ({
      id: (t._id as Types.ObjectId).toString(),
      title: t.title,
      destination: t.destination,
      tags: t.tags,
      price: t.price,
      durationDays: t.durationDays,
      difficulty: t.difficulty,
      ratingsAverage: t.ratingsAverage,
    }));

    const recommendations = await generateTravelRecommendations(preferences, tourContext);

    await AiPreference.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { lastRecommendations: recommendations.tourIds.map((id) => new Types.ObjectId(id)) },
    );

    const recommendedTours = await Tour.find({
      _id: { $in: recommendations.tourIds.map((id) => new Types.ObjectId(id)) },
    }).populate('guideId', 'name avatarUrl');

    logger.info('AI recommendations generated', { userId, count: recommendedTours.length });

    res.status(200).json({
      status: 'success',
      data: {
        narrative: recommendations.narrative,
        tours: recommendedTours,
      },
    });
  } catch (err) {
    next(err);
  }
}
