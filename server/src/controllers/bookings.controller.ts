import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import Booking from '../models/Booking';
import Tour from '../models/Tour';
import { createPaymentIntent, createRefund, constructWebhookEvent } from '../services/stripe.service';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

const createBookingSchema = z.object({
  tourId: z.string().min(1),
  participants: z.number().int().min(1),
  tourDate: z.coerce.date().optional(),
});

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createBookingSchema.safeParse(req.body);
    if (!body.success) {
      return next(new AppError(body.error.errors.map((e) => e.message).join(', '), 400));
    }

    const { tourId, participants, tourDate } = body.data;
    const userId = req.user!.userId;

    const tour = await Tour.findById(tourId);
    if (!tour || !tour.isActive) {
      return next(new AppError('Tour not found.', 404));
    }

    if (participants > tour.maxGroupSize) {
      return next(new AppError(`Maximum group size for this tour is ${tour.maxGroupSize}.`, 400));
    }

    const totalPrice = tour.price * participants;
    const amountInCents = Math.round(totalPrice * 100);

    const paymentIntent = await createPaymentIntent(amountInCents, 'usd', {
      userId,
      tourId,
      tourTitle: tour.title,
    });

    const booking = await Booking.create({
      userId: new Types.ObjectId(userId),
      tourId: new Types.ObjectId(tourId),
      participants,
      totalPrice,
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret ?? undefined,
      tourDate,
    });

    logger.info('Booking created', { bookingId: booking._id.toString(), userId });

    res.status(201).json({
      status: 'success',
      data: {
        booking: {
          id: booking._id,
          tourId: booking.tourId,
          participants: booking.participants,
          totalPrice: booking.totalPrice,
          status: booking.status,
          stripeClientSecret: paymentIntent.client_secret,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await Booking.find({ userId: req.user!.userId })
      .populate('tourId', 'title slug destination images price durationDays')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
  } catch (err) {
    next(err);
  }
}

export async function getAllBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? '20', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('userId', 'name email')
        .populate('tourId', 'title destination')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({ status: 'success', results: bookings.length, total, data: { bookings } });
  } catch (err) {
    next(err);
  }
}

export async function getGuideBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const guideTours = await Tour.find({ guideId: req.user!.userId }).select('_id');
    const bookings = await Booking.find({ tourId: { $in: guideTours.map((t) => t._id) } })
      .populate('userId', 'name email')
      .populate('tourId', 'title slug destination images price durationDays')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
  } catch (err) {
    next(err);
  }
}

async function respondToBooking(
  req: Request,
  res: Response,
  next: NextFunction,
  newStatus: 'confirmed' | 'cancelled',
): Promise<void> {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    if (req.user!.role === 'guide') {
      const tour = await Tour.findById(booking.tourId).select('guideId');
      if (!tour || tour.guideId.toString() !== req.user!.userId) {
        return next(new AppError('You can only manage bookings for your own tours.', 403));
      }
    }

    if (booking.status !== 'pending') {
      return next(new AppError(`Only pending bookings can be updated. Current status: ${booking.status}.`, 400));
    }

    booking.status = newStatus;
    await booking.save();
    logger.info('Booking updated by guide', { bookingId: booking._id.toString(), status: newStatus });

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (err) {
    next(err);
  }
}

export function confirmBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  return respondToBooking(req, res, next, 'confirmed');
}

export function declineBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  return respondToBooking(req, res, next, 'cancelled');
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    if (req.user!.role === 'traveler' && booking.userId.toString() !== req.user!.userId) {
      return next(new AppError('You can only cancel your own bookings.', 403));
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return next(new AppError(`Booking cannot be cancelled in its current status: ${booking.status}.`, 400));
    }

    const createdAt = booking.createdAt.getTime();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const withinWindow = Date.now() - createdAt < fortyEightHours;

    let newStatus: 'cancelled' | 'refunded' = 'cancelled';

    if (booking.status === 'confirmed' && withinWindow) {
      await createRefund(booking.stripePaymentIntentId);
      newStatus = 'refunded';
      logger.info('Booking refunded', { bookingId: booking._id.toString() });
    }

    booking.status = newStatus;
    await booking.save();

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (err) {
    next(err);
  }
}

export async function stripeWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = constructWebhookEvent(req.body as Buffer, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    logger.warn('Stripe webhook signature error', { message });
    res.status(400).json({ error: message });
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        await Booking.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          { status: 'confirmed' },
        );
        logger.info('Booking confirmed via webhook', { paymentIntentId: pi.id });
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as { payment_intent?: string };
        if (charge.payment_intent) {
          await Booking.findOneAndUpdate(
            { stripePaymentIntentId: charge.payment_intent },
            { status: 'refunded' },
          );
        }
        break;
      }
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error('Stripe webhook handler error', { error: err instanceof Error ? err.message : 'unknown' });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
