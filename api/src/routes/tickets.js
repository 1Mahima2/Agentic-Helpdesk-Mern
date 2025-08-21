import express from 'express';
import Ticket from '../models/Ticket.js';
import AgentSuggestion from '../models/AgentSuggestion.js';
import { auth, requireRole } from '../middleware/auth.js';
import { ticketCreateSchema } from '../utils/validator.js';
import { logEvent } from '../services/audit.js';

const router = express.Router();

router.post('/', auth(), async (req,res) => {
  const parse = ticketCreateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const ticket = await Ticket.create({ ...parse.data, createdBy: req.user.id });
  await logEvent({ ticketId: ticket._id, traceId: ticket._id.toString(), actor: 'user', action: 'TICKET_CREATED', meta: {} });

  // trigger triage
  // (call internal route logic directly for simplicity)
  req.app.get('eventBus').emit('triage', { ticketId: ticket._id.toString() });

  res.status(201).json(ticket);
});

router.get('/', auth(), async (req,res) => {
  const { status, mine } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (mine === 'true') filter.createdBy = req.user.id;
  const tickets = await Ticket.find(filter).sort({ updatedAt: -1 });
  res.json(tickets);
});

router.get('/:id', auth(), async (req,res) => {
  const t = await Ticket.findById(req.params.id).populate('createdBy', 'name email').populate('assignee','name email');
  if (!t) return res.status(404).json({ error: 'Not found' });
  const suggestion = await AgentSuggestion.findOne({ ticketId: t._id });
  res.json({ ticket: t, suggestion });
});

router.post('/:id/reply', auth(), requireRole(['agent','admin']), async (req,res) => {
  // For simplicity: replying marks as resolved and logs
  const t = await Ticket.findById(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  t.status = 'resolved';
  await t.save();
  await logEvent({ ticketId: t._id, traceId: t._id.toString(), actor: 'agent', action: 'REPLY_SENT', meta: { by: req.user.email } });
  res.json({ ok: true });
});

router.post('/:id/assign', auth(), requireRole(['agent','admin']), async (req,res) => {
  const { assignee } = req.body;
  const t = await Ticket.findByIdAndUpdate(req.params.id, { assignee }, { new: true });
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

router.get('/:id/audit', auth(), async (req,res) => {
  const logs = await req.app.get('AuditLog').find({ ticketId: req.params.id }).sort({ timestamp: 1 });
  res.json(logs);
});

export default router;
