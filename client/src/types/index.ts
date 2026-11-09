export type UserRole = 'traveler' | 'guide' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  isApproved?: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

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

export interface TourGuide {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface Tour {
  _id: string;
  id?: string;
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
  guideId: TourGuide | string;
  tags: TourTag[];
  startDates: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';

export interface Booking {
  _id: string;
  id?: string;
  userId: { _id: string; name: string; email: string } | string;
  tourId: Tour;
  participants: number;
  totalPrice: number;
  status: BookingStatus;
  stripePaymentIntentId: string;
  stripeClientSecret?: string;
  tourDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  id?: string;
  userId: { _id: string; name: string; avatarUrl?: string } | string;
  tourId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type Terrain = 'mountains' | 'sea' | 'desert' | 'forest' | 'arctic';
export type Activity = 'hiking' | 'diving' | 'sightseeing' | 'culture' | 'wildlife' | 'food' | 'adventure';
export type Budget = 'budget' | 'mid-range' | 'luxury';
export type TravelStyle = 'solo' | 'couple' | 'family' | 'group';

export interface AiPreference {
  terrain: Terrain[];
  activities: Activity[];
  budget: Budget;
  travelStyle: TravelStyle;
  groupSize: number;
  durationDays: number;
  departureMonth?: number;
}

export interface AiRecommendationResponse {
  narrative: string;
  tours: Tour[];
}

export interface AuthResponse {
  status: 'success' | 'pending' | 'error';
  message?: string;
  accessToken?: string;
  user?: User;
}

export interface ApiResponse<T> {
  status: 'success' | 'pending' | 'error';
  results?: number;
  total?: number;
  message?: string;
  data: T;
}
