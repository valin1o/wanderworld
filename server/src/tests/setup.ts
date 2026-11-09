import mongoose from 'mongoose';

beforeAll(async () => {
  const uri = process.env['MONGO_TEST_URI'];
  if (!uri) throw new Error('MONGO_TEST_URI not set — ensure globalSetup ran');
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key]?.deleteMany({});
  }
});
