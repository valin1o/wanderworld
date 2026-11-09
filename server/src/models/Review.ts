import mongoose, { Document, Schema, Types, Model } from 'mongoose';
import Tour from './Tour';

export interface IReview {
  userId: Types.ObjectId;
  tourId: Types.ObjectId;
  rating: number;
  comment: string;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {}

export interface IReviewModel extends Model<IReviewDocument> {
  recalculateTourStats(tourId: Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReviewDocument, IReviewModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

reviewSchema.index({ userId: 1, tourId: 1 }, { unique: true });
reviewSchema.index({ tourId: 1, rating: -1 });

reviewSchema.statics.recalculateTourStats = async function (tourId: Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { tourId } },
    {
      $group: {
        _id: '$tourId',
        ratingsCount: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsCount: stats[0].ratingsCount,
      ratingsAverage: Math.round(stats[0].ratingsAverage * 10) / 10,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, { ratingsCount: 0, ratingsAverage: 0 });
  }
};

reviewSchema.post('save', async function () {
  await (this.constructor as IReviewModel).recalculateTourStats(this.tourId);
});

reviewSchema.post(
  'findOneAndDelete',
  async function (doc: IReviewDocument | null) {
    if (doc) {
      await (Review as IReviewModel).recalculateTourStats(doc.tourId);
    }
  },
);

const Review = mongoose.model<IReviewDocument, IReviewModel>('Review', reviewSchema);
export default Review;
