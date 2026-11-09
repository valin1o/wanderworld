import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

describe('JWT utilities', () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-long-enough-for-jwt';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-long-enough-for-jwt';
  });

  it('signs and verifies an access token', () => {
    const token = signAccessToken('user123', 'traveler');
    const payload = verifyAccessToken(token);
    expect(payload.userId).toBe('user123');
    expect(payload.role).toBe('traveler');
  });

  it('signs and verifies a refresh token', () => {
    const token = signRefreshToken('user456', 'guide');
    const payload = verifyRefreshToken(token);
    expect(payload.userId).toBe('user456');
    expect(payload.role).toBe('guide');
  });

  it('throws for an invalid access token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('throws for a tampered access token', () => {
    const token = signAccessToken('user789', 'admin');
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});
