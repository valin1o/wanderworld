import mongoose, { Document, Schema, Types } from 'mongoose';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TourTag =
  | 'mountains'
  | 'sea'
  | 'culture'
  | 'adventure'
  | 'wildlife'
  | 'urban'
  | 'desert'
  | 'forest'
  | 'arctic';

export interface ITour {
  title: string;
  slug: string;
  description: string;
  destination: string;
  durationDays: number;
  price: number;
  maxGroupSize: number;
  difficulty: Difficulty;
  images: string[];
  ratingsAverage: number;
  ratingsCount: number;
  guideId: Types.ObjectId;
  tags: TourTag[];
  startDates: Date[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITourDocument extends ITour, Document {}

const tourSchema = new Schema<ITourDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, maxlength: 5000 },
    destination: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    maxGroupSize: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    images: [{ type: String }],
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    guideId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [
      {
        type: String,
        enum: ['mountains', 'sea', 'culture', 'adventure', 'wildlife', 'urban', 'desert', 'forest', 'arctic'],
      },
    ],
    startDates: [{ type: Date }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

tourSchema.index({ destination: 1 });
tourSchema.index({ tags: 1 });
tourSchema.index({ price: 1 });
tourSchema.index({ ratingsAverage: -1 });
tourSchema.index({ isActive: 1 });

const Tour = mongoose.model<ITourDocument>('Tour', tourSchema);
export default Tour;
