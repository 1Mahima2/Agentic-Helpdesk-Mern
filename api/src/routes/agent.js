import express from 'express';
import Ticket from '../models/Ticket.js';
import AgentSuggestion from '../models/AgentSuggestion.js';
import { auth } from '../middleware/auth.js';
import { triageTicket } from '../services/agentStub.js';
import { logEvent } from '../services/audit.js';

const router = express.Router();

router.post('/triage', auth(), async (req,res) => {
  const { ticketId } = req.body;
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const result = await triageTicket(ticket);

  await logEvent({ ticketId: ticket._id, traceId: result.traceId, actor: 'system', action: 'AGENT_CLASSIFIED', meta: { predictedCategory: result.predictedCategory, confidence: result.confidence } });
  await logEvent({ ticketId: ticket._id, traceId: result.traceId, actor: 'system', action: 'KB_RETRIEVED', meta: { articleIds: result.articleIds } });
  await logEvent({ ticketId: ticket._id, traceId: result.traceId, actor: 'system', action: 'DRAFT_GENERATED', meta: {} });

  // decision
  const autoCloseEnabled = (process.env.AUTO_CLOSE_ENABLED || 'true') === 'true';
  const threshold = Number(process.env.CONFIDENCE_THRESHOLD || 0.78);
  let autoClosed = false;

  const suggestion = await AgentSuggestion.create({
    ticketId: ticket._id,
    predictedCategory: result.predictedCategory,
    articleIds: result.articleIds,
    draftReply: result.draftReply,
    confidence: result.confidence,
    autoClosed,
    modelInfo: result.modelInfo
  });

  ticket.agentSuggestionId = suggestion._id;
  ticket.status = 'triaged';

  if (autoCloseEnabled && result.confidence >= threshold) {
    ticket.status = 'resolved';
    autoClosed = true;
    suggestion.autoClosed = true;
    await logEvent({ ticketId: ticket._id, traceId: result.traceId, actor: 'system', action: 'AUTO_CLOSED', meta: { threshold } });
  } else {
    ticket.status = 'waiting_human';
    await logEvent({ ticketId: ticket._id, traceId: result.traceId, actor: 'system', action: 'ASSIGNED_TO_HUMAN', meta: {} });
  }

  await suggestion.save();
  await ticket.save();

  res.json({ ok: true, suggestionId: suggestion._id });
});

router.get('/suggestion/:ticketId', auth(), async (req,res) => {
  const suggestion = await AgentSuggestion.findOne({ ticketId: req.params.ticketId });
  if (!suggestion) return res.status(404).json({ error: 'Not found' });
  res.json(suggestion);
});

export default router;
