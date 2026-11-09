import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).__MONGO_SERVER__ = null;

module.exports = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  process.env['MONGO_TEST_URI'] = mongoServer.getUri();
  process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-long-enough-for-jwt-signing';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-long-enough-for-jwt-signing';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).__MONGO_SERVER__ = mongoServer;
};
