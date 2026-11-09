import api from './axios';
import {
  User,
  Tour,
  Booking,
  Review,
  AiPreference,
  AiRecommendationResponse,
  ApiResponse,
} from '../types';

export const authApi = {
  async register(data: { name: string; email: string; password: string; role?: 'traveler' | 'guide' }) {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async refresh() {
    const res = await api.post<AuthResponse>('/auth/refresh');
    return res.data;
  },

  async logout() {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/logout');
    return res.data;
  },

  async getMe() {
    const res = await api.get<ApiResponse<{ user: User }>>('/users/me');
    return res.data;
  },

  async updateMe(data: { name?: string; avatarUrl?: string }) {
    const res = await api.patch<ApiResponse<{ user: User }>>('/users/me', data);
    return res.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await api.patch<ApiResponse<{ message: string }>>('/users/me/password', data);
    return res.data;
  },
};

export const toursApi = {
  async getAllTours(params?: Record<string, string | number | undefined>) {
    const res = await api.get<ApiResponse<{ tours: Tour[] }>>('/tours', { params });
    return res.data;
  },

  async getTop5Cheap() {
    const res = await api.get<ApiResponse<{ tours: Tour[] }>>('/tours/top5cheap');
    return res.data;
  },

  async getTourBySlug(slug: string) {
    const res = await api.get<ApiResponse<{ tour: Tour }>>(`/tours/${slug}`);
    return res.data;
  },

  async createTour(data: Partial<Tour>) {
    const res = await api.post<ApiResponse<{ tour: Tour }>>('/tours', data);
    return res.data;
  },

  async updateTour(id: string, data: Partial<Tour>) {
    const res = await api.patch<ApiResponse<{ tour: Tour }>>(`/tours/${id}`, data);
    return res.data;
  },

  async deleteTour(id: string) {
    const res = await api.delete(`/tours/${id}`);
    return res.data;
  },
};

export const bookingsApi = {
  async createBooking(data: { tourId: string; participants: number; tourDate?: string }) {
    const res = await api.post<ApiResponse<{ booking: Booking & { stripeClientSecret?: string } }>>('/bookings', data);
    return res.data;
  },

  async getMyBookings() {
    const res = await api.get<ApiResponse<{ bookings: Booking[] }>>('/bookings/my');
    return res.data;
  },

  async getAllBookings(params?: Record<string, string | number | undefined>) {
    const res = await api.get<ApiResponse<{ bookings: Booking[] }>>('/bookings', { params });
    return res.data;
  },

  async getGuideBookings() {
    const res = await api.get<ApiResponse<{ bookings: Booking[] }>>('/bookings/guide');
    return res.data;
  },

  async confirmBooking(id: string) {
    const res = await api.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/confirm`);
    return res.data;
  },

  async declineBooking(id: string) {
    const res = await api.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/decline`);
    return res.data;
  },

  async cancelBooking(id: string) {
    const res = await api.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/cancel`);
    return res.data;
  },
};

export const reviewsApi = {
  async getReviewsByTour(tourId: string) {
    const res = await api.get<ApiResponse<{ reviews: Review[] }>>(`/tours/${tourId}/reviews`);
    return res.data;
  },

  async createReview(tourId: string, data: { rating: number; comment: string }) {
    const res = await api.post<ApiResponse<{ review: Review }>>(`/tours/${tourId}/reviews`, data);
    return res.data;
  },

  async updateReview(id: string, data: { rating?: number; comment?: string }) {
    const res = await api.patch<ApiResponse<{ review: Review }>>(`/reviews/${id}`, data);
    return res.data;
  },

  async deleteReview(id: string) {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
};

export const aiApi = {
  async getPreferences() {
    const res = await api.get<ApiResponse<{ preferences: AiPreference | null }>>('/ai/preferences');
    return res.data;
  },

  async upsertPreferences(data: Partial<AiPreference>) {
    const res = await api.put<ApiResponse<{ preferences: AiPreference }>>('/ai/preferences', data);
    return res.data;
  },

  async getRecommendations(data: Partial<AiPreference>) {
    const res = await api.post<ApiResponse<AiRecommendationResponse>>('/ai/recommendations', data);
    return res.data;
  },
};

export const usersApi = {
  async getAllUsers(params?: Record<string, string | number | undefined>) {
    const res = await api.get<ApiResponse<{ users: User[] }>>('/users', { params });
    return res.data;
  },

  async getPendingGuides() {
    const res = await api.get<ApiResponse<{ guides: User[] }>>('/users/pending-guides');
    return res.data;
  },

  async approveGuide(id: string) {
    const res = await api.patch<ApiResponse<{ user: User }>>(`/users/${id}/approve`);
    return res.data;
  },

  async rejectGuide(id: string) {
    const res = await api.patch<ApiResponse<{ user: User }>>(`/users/${id}/reject`);
    return res.data;
  },

  async changeUserRole(id: string, role: 'traveler' | 'guide' | 'admin') {
    const res = await api.patch<ApiResponse<{ user: User }>>(`/users/${id}/role`, { role });
    return res.data;
  },

  async deactivateUser(id: string) {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};
