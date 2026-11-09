import request from 'supertest';
import app from '../app';

describe('Auth Routes', () => {
  const travelerPayload = {
    name: 'Alice Traveler',
    email: 'alice@example.com',
    password: 'SecurePass123!',
    role: 'traveler',
  };

  const guidePayload = {
    name: 'Bob Guide',
    email: 'bob@example.com',
    password: 'SecurePass123!',
    role: 'guide',
  };

  describe('POST /api/auth/register', () => {
    it('registers a traveler and returns access token', async () => {
      const res = await request(app).post('/api/auth/register').send(travelerPayload);
      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.role).toBe('traveler');
    });

    it('registers a guide with pending status (no token)', async () => {
      const res = await request(app).post('/api/auth/register').send(guidePayload);
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
      expect(res.body.accessToken).toBeUndefined();
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/auth/register').send(travelerPayload);
      const res = await request(app).post('/api/auth/register').send(travelerPayload);
      expect(res.status).toBe(409);
    });

    it('rejects short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...travelerPayload, password: 'short' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(travelerPayload);
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: travelerPayload.email,
        password: travelerPayload.password,
      });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: travelerPayload.email,
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password.');
    });

    it('rejects unapproved guide login', async () => {
      await request(app).post('/api/auth/register').send(guidePayload);
      const res = await request(app).post('/api/auth/login').send({
        email: guidePayload.email,
        password: guidePayload.password,
      });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns new access token when refresh cookie is present', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(travelerPayload);
      const cookie = registerRes.headers['set-cookie'] as unknown as string[];

      const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears the refresh cookie', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(travelerPayload);
      const cookie = registerRes.headers['set-cookie'] as unknown as string[];

      const res = await request(app).post('/api/auth/logout').set('Cookie', cookie);
      expect(res.status).toBe(200);

      const setCookie = res.headers['set-cookie'] as unknown as string[];
      expect(setCookie?.some((c: string) => c.includes('refreshToken=;') || c.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);
    });
  });
});
