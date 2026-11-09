import { MongoMemoryServer } from 'mongodb-memory-server';

module.exports = async (): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mongoServer = (global as any).__MONGO_SERVER__ as MongoMemoryServer | undefined;
  if (mongoServer) {
    await mongoServer.stop();
  }
};
