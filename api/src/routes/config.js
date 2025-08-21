import express from 'express';
import Config from '../models/Config.js';
import { auth, requireRole } from '../middleware/auth.js';
import { configUpdateSchema } from '../utils/validator.js';

const router = express.Router();

router.get('/', auth(), async (req,res) => {
  let cfg = await Config.findOne();
  if (!cfg) cfg = await Config.create({});
  res.json(cfg);
});

router.put('/', auth(), requireRole(['admin']), async (req,res) => {
  const parse = configUpdateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  let cfg = await Config.findOne();
  if (!cfg) cfg = await Config.create({});
  Object.assign(cfg, parse.data);
  await cfg.save();
  res.json(cfg);
});

export default router;
