import mongoose, { Document, Schema, Types } from 'mongoose';

export type Terrain = 'mountains' | 'sea' | 'desert' | 'forest' | 'arctic';
export type Activity = 'hiking' | 'diving' | 'sightseeing' | 'culture' | 'wildlife' | 'food' | 'adventure';
export type Budget = 'budget' | 'mid-range' | 'luxury';
export type TravelStyle = 'solo' | 'couple' | 'family' | 'group';

export interface IAiPreference {
  userId: Types.ObjectId;
  terrain: Terrain[];
  activities: Activity[];
  budget: Budget;
  travelStyle: TravelStyle;
  groupSize: number;
  durationDays: number;
  departureMonth?: number;
  lastRecommendations: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAiPreferenceDocument extends IAiPreference, Document {}

const aiPreferenceSchema = new Schema<IAiPreferenceDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    terrain: [
      {
        type: String,
        enum: ['mountains', 'sea', 'desert', 'forest', 'arctic'],
      },
    ],
    activities: [
      {
        type: String,
        enum: ['hiking', 'diving', 'sightseeing', 'culture', 'wildlife', 'food', 'adventure'],
      },
    ],
    budget: { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'mid-range' },
    travelStyle: { type: String, enum: ['solo', 'couple', 'family', 'group'], default: 'solo' },
    groupSize: { type: Number, default: 1, min: 1 },
    durationDays: { type: Number, default: 7, min: 1 },
    departureMonth: { type: Number, min: 1, max: 12 },
    lastRecommendations: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
  },
  { timestamps: true },
);


const AiPreference = mongoose.model<IAiPreferenceDocument>('AiPreference', aiPreferenceSchema);
export default AiPreference;
