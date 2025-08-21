import express from 'express';
import Article from '../models/Article.js';
import { auth, requireRole } from '../middleware/auth.js';
import { kbCreateSchema, kbUpdateSchema } from '../utils/validator.js';

const router = express.Router();

router.get('/', auth(false), async (req,res) => {
  const q = (req.query.query || '').toString().toLowerCase();
  const filter = q ? {
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { body: { $regex: q, $options: 'i' } },
      { tags: { $elemMatch: { $regex: q, $options: 'i' } } }
    ]
  } : {};
  const articles = await Article.find(filter).sort({ updatedAt: -1 }).limit(50);
  res.json(articles);
});

router.post('/', auth(), requireRole(['admin']), async (req,res) => {
  const parse = kbCreateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const doc = await Article.create(parse.data);
  res.status(201).json(doc);
});

router.put('/:id', auth(), requireRole(['admin']), async (req,res) => {
  const parse = kbUpdateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const doc = await Article.findByIdAndUpdate(req.params.id, parse.data, { new: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

router.delete('/:id', auth(), requireRole(['admin']), async (req,res) => {
  const doc = await Article.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
