import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerSchema, loginSchema } from '../utils/validator.js';

const router = express.Router();

router.post('/register', async (req,res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { name, email, password } = parse.data;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already used' });

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash, role: 'user' });
  const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'change-me', { expiresIn: '2h' });
  res.json({ token });
});

router.post('/login', async (req,res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { email, password } = parse.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'change-me', { expiresIn: '2h' });
  res.json({ token });
});

export default router;
