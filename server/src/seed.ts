import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').trim();
        if (key && val && process.env[key.trim()] === undefined) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
} catch {
  // Ignore error if .env is missing
}

import User from './models/User';
import Tour from './models/Tour';

const MONGODB_URI = process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/wanderworld';

async function seed(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  const demoPassword = 'SecurePass123!';

  await User.deleteOne({ email: 'alice@example.com' });
  await User.create({
    name: 'Alice Traveler',
    email: 'alice@example.com',
    passwordHash: demoPassword,
    role: 'traveler',
    isActive: true,
    isApproved: true,
  });
  console.log('Created Traveler: alice@example.com');

  await User.deleteOne({ email: 'bob@example.com' });
  const guide = await User.create({
    name: 'Bob Guide',
    email: 'bob@example.com',
    passwordHash: demoPassword,
    role: 'guide',
    isActive: true,
    isApproved: true,
  });
  console.log('Created Guide: bob@example.com');

  await User.deleteOne({ email: 'admin@example.com' });
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: demoPassword,
    role: 'admin',
    isActive: true,
    isApproved: true,
  });
  console.log('Created Admin: admin@example.com');

  const sampleTours = [
    {
      title: 'Iceland Glow & Northern Lights Adventure',
      slug: 'iceland-glow-adventure',
      description: 'Discover the dramatic landscapes of Iceland, from glowing aurora borealis and blue ice caves to cascading waterfalls and geothermal hot springs. Guided by expert local mountaineers with small groups.',
      destination: 'Reykjavik, Iceland',
      durationDays: 7,
      price: 1850,
      maxGroupSize: 12,
      difficulty: 'medium' as const,
      images: [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
      ],
      ratingsAverage: 4.9,
      ratingsCount: 28,
      guideId: guide._id,
      tags: ['arctic', 'mountains', 'adventure'] as const,
      startDates: [new Date('2025-06-15'), new Date('2025-07-20'), new Date('2025-08-10')],
      isActive: true,
    },
    {
      title: 'Swiss Alps High Trail Expedition',
      slug: 'swiss-alps-high-trail',
      description: 'An unforgettable traverse across the iconic Swiss peaks. Experience dramatic ridges, crystal-clear alpine lakes, traditional mountain huts, and scenic railway crossings.',
      destination: 'Zermatt, Switzerland',
      durationDays: 6,
      price: 1450,
      maxGroupSize: 8,
      difficulty: 'hard' as const,
      images: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      ],
      ratingsAverage: 4.8,
      ratingsCount: 19,
      guideId: guide._id,
      tags: ['mountains', 'adventure', 'culture'] as const,
      startDates: [new Date('2025-07-01'), new Date('2025-08-15')],
      isActive: true,
    },
    {
      title: 'Kyoto Ancient Temples & Bamboo Forest Walk',
      slug: 'kyoto-ancient-temples-walk',
      description: 'Immerse yourself in classical Japanese heritage. Stroll through the Arashiyama bamboo grove, historic wooden shrines, traditional tea ceremonies, and serene zen gardens.',
      destination: 'Kyoto, Japan',
      durationDays: 4,
      price: 890,
      maxGroupSize: 10,
      difficulty: 'easy' as const,
      images: [
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      ],
      ratingsAverage: 5.0,
      ratingsCount: 35,
      guideId: guide._id,
      tags: ['culture', 'urban', 'forest'] as const,
      startDates: [new Date('2025-05-10'), new Date('2025-09-12')],
      isActive: true,
    },
    {
      title: 'Patagonia Glaciers & Peaks Trek',
      slug: 'patagonia-glaciers-trek',
      description: 'Deep wilderness backpacking through Torres del Paine and Los Glaciares. Witness thunderous ice calving and granite spires towering over emerald glacial lagoons.',
      destination: 'Patagonia, Chile & Argentina',
      durationDays: 9,
      price: 2200,
      maxGroupSize: 10,
      difficulty: 'hard' as const,
      images: [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      ],
      ratingsAverage: 4.9,
      ratingsCount: 14,
      guideId: guide._id,
      tags: ['mountains', 'wildlife', 'adventure'] as const,
      startDates: [new Date('2025-11-05'), new Date('2025-12-01')],
      isActive: true,
    },
    {
      title: 'Bali Coastal Reefs & Tropical Hidden Waterfalls',
      slug: 'bali-coastal-reefs-waterfalls',
      description: 'Explore tranquil coastal coves, vibrant coral reefs, lush rice terraces, and hidden jungle waterfalls. Perfect for relaxing, snorkeling, and cultural discovery.',
      destination: 'Ubud & Nusa Penida, Bali',
      durationDays: 5,
      price: 650,
      maxGroupSize: 14,
      difficulty: 'easy' as const,
      images: [
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      ],
      ratingsAverage: 4.7,
      ratingsCount: 42,
      guideId: guide._id,
      tags: ['sea', 'forest', 'culture'] as const,
      startDates: [new Date('2025-06-01'), new Date('2025-07-15'), new Date('2025-08-20')],
      isActive: true,
    },
  ];

  for (const tourData of sampleTours) {
    await Tour.findOneAndUpdate({ slug: tourData.slug }, tourData, { upsert: true });
    console.log(`Seeded tour: ${tourData.title}`);
  }

  console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
  console.log('Demo Credentials (Password: SecurePass123!):');
  console.log(' - Traveler: alice@example.com');
  console.log(' - Guide:    bob@example.com');
  console.log(' - Admin:    admin@example.com\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
