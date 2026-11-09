import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Tour from '../models/Tour';

async function loginAs(role: 'traveler' | 'guide' | 'admin', email: string): Promise<string> {
  const password = 'SecurePass123!';

  if (role === 'admin') {
    await User.create({
      name: 'Admin User',
      email,
      passwordHash: password,
      role: 'admin',
      isApproved: true,
    });
  } else {
    await request(app).post('/api/auth/register').send({ name: 'Test User', email, password, role });

    if (role === 'guide') {
      await User.findOneAndUpdate({ email }, { isApproved: true });
    }
  }

  const loginRes = await request(app).post('/api/auth/login').send({ email, password });
  return loginRes.body.accessToken as string;
}

describe('Tours Routes', () => {
  let guideToken: string;

  beforeEach(async () => {
    guideToken = await loginAs('guide', 'guide@example.com');
  });

  describe('GET /api/tours', () => {
    it('returns tours list publicly', async () => {
      const res = await request(app).get('/api/tours');
      expect(res.status).toBe(200);
      expect(res.body.data.tours).toBeDefined();
    });
  });

  describe('GET /api/tours/top5cheap', () => {
    it('returns at most 5 tours', async () => {
      const res = await request(app).get('/api/tours/top5cheap');
      expect(res.status).toBe(200);
      expect(res.body.data.tours.length).toBeLessThanOrEqual(5);
    });
  });

  describe('POST /api/tours', () => {
    const tourData = {
      title: 'Alpine Adventure',
      description: 'A stunning alpine tour through the highest peaks.',
      destination: 'Swiss Alps',
      durationDays: 7,
      price: 1500,
      maxGroupSize: 10,
      difficulty: 'hard',
      tags: ['mountains', 'adventure'],
    };

    it('allows a guide to create a tour', async () => {
      const res = await request(app)
        .post('/api/tours')
        .set('Authorization', `Bearer ${guideToken}`)
        .send(tourData);
      expect(res.status).toBe(201);
      expect(res.body.data.tour.slug).toBe('alpine-adventure');
    });

    it('rejects unauthenticated tour creation', async () => {
      const res = await request(app).post('/api/tours').send(tourData);
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/tours/:id', () => {
    it('allows guide to update own tour', async () => {
      const guide = await User.findOne({ email: 'guide@example.com' });
      const tour = await Tour.create({
        title: 'My Tour',
        slug: 'my-tour',
        description: 'A great tour description here.',
        destination: 'Nepal',
        durationDays: 5,
        price: 800,
        maxGroupSize: 8,
        difficulty: 'medium',
        guideId: guide!._id,
      });

      const res = await request(app)
        .patch(`/api/tours/${tour._id}`)
        .set('Authorization', `Bearer ${guideToken}`)
        .send({ price: 900 });
      expect(res.status).toBe(200);
      expect(res.body.data.tour.price).toBe(900);
    });
  });
});
