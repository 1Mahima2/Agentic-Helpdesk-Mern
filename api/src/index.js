import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

import authRoutes from './routes/auth.js';
import kbRoutes from './routes/kb.js';
import ticketsRoutes from './routes/tickets.js';
import agentRoutes from './routes/agent.js';
import configRoutes from './routes/config.js';
import auditRoutes from './routes/audit.js';

import AuditLog from './models/AuditLog.js';
import { auth } from './middleware/auth.js';

import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const eventBus = new EventEmitter();
app.set('eventBus', eventBus);
app.set('AuditLog', AuditLog);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/healthz', (_,res)=>res.json({ ok:true }));
app.get('/readyz', (_,res)=>res.json({ ok:true }));

app.use('/api/auth', authRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/config', configRoutes);
app.use('/api', auditRoutes);

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/helpdesk';

mongoose.connect(MONGO_URI).then(()=>{
  console.log('Mongo connected');
  app.listen(PORT, ()=> console.log('API on', PORT));
}).catch(err=>{
  console.error('Mongo error', err);
  process.exit(1);
});

// Simple in-process triage handler
import fetch from 'node-fetch';
eventBus.on('triage', async ({ ticketId }) => {
  try {
    // self-call: simulate internal triage endpoint
    // In Docker, service name 'api' resolves internally; but we are inside same process,
    // so we can call directly using app logic or via localhost. Use localhost here.
    await fetch(`http://localhost:${PORT}/api/agent/triage`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization: `Bearer ${makeSystemToken()}` },
      body: JSON.stringify({ ticketId })
    });
  } catch (e) {
    console.error('triage error', e);
  }
});

function makeSystemToken() {
  // Issue a token with 'agent' role for internal call
  return jwt.sign(
    { id: 'system', role: 'agent', email: 'system@local' },
    process.env.JWT_SECRET || 'change-me',
    { expiresIn: '5m' }
  );
}