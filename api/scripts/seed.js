import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Article from '../src/models/Article.js';
import Ticket from '../src/models/Ticket.js';
import Config from '../src/models/Config.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/helpdesk';

async function run(){
  await mongoose.connect(MONGO_URI);
  console.log('Seeding...');

  await Promise.all([User.deleteMany({}), Article.deleteMany({}), Ticket.deleteMany({}), Config.deleteMany({})]);

  const password_hash = await bcrypt.hash('password123', 10);
  const [admin, agent, user] = await User.create([
    { name: 'Admin', email: 'admin@example.com', password_hash, role: 'admin' },
    { name: 'Agent', email: 'agent@example.com', password_hash, role: 'agent' },
    { name: 'User', email: 'user@example.com', password_hash, role: 'user' }
  ]);

  await Config.create({ autoCloseEnabled: true, confidenceThreshold: 0.78, slaHours: 24 });

  const kb = await Article.create([
    { title: 'How to update payment method', body: 'Go to billing settings, click update...', tags: ['billing','payments'], status: 'published' },
    { title: 'Troubleshooting 500 errors', body: 'Check logs, verify env, restart service...', tags: ['tech','errors'], status: 'published' },
    { title: 'Tracking your shipment', body: 'Use the tracking page with your order ID...', tags: ['shipping','delivery'], status: 'published' }
  ]);

  await Ticket.create([
    { title: 'Refund for double charge', description: 'I was charged twice for order #1234', category: 'other', createdBy: user._id },
    { title: 'App shows 500 on login', description: 'Stack trace mentions auth module', category: 'other', createdBy: user._id },
    { title: 'Where is my package?', description: 'Shipment delayed 5 days', category: 'other', createdBy: user._id }
  ]);

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e=>{ console.error(e); process.exit(1); });
