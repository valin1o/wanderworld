import mongoose, { Document, Schema, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';

export interface IBooking {
  userId: Types.ObjectId;
  tourId: Types.ObjectId;
  participants: number;
  totalPrice: number;
  status: BookingStatus;
  stripePaymentIntentId: string;
  stripeClientSecret?: string;
  tourDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingDocument extends IBooking, Document {}

const bookingSchema = new Schema<IBookingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    participants: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: { type: String, required: true },
    stripeClientSecret: { type: String, select: false },
    tourDate: { type: Date },
  },
  { timestamps: true },
);

bookingSchema.index({ userId: 1, tourId: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ stripePaymentIntentId: 1 }, { unique: true });

const Booking = mongoose.model<IBookingDocument>('Booking', bookingSchema);
export default Booking;
