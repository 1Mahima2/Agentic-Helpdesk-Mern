import Article from '../models/Article.js';
import { v4 as uuidv4 } from 'uuid';

// Deterministic classification and drafting
export async function triageTicket(ticket) {
  const traceId = uuidv4();
  const start = Date.now();
  // 1) Classify (keyword based)
  const text = (ticket.title + ' ' + ticket.description).toLowerCase();
  let predictedCategory = 'other';
  let score = 0.3;
  const signals = [];

  if (/(refund|invoice|payment|charged)/.test(text)) { predictedCategory = 'billing'; score = 0.86; signals.push('billing'); }
  if (/(error|bug|stack|500|exception|login)/.test(text)) { predictedCategory = 'tech'; score = Math.max(score, 0.84); signals.push('tech'); }
  if (/(delivery|shipment|shipping|package|courier|track)/.test(text)) { predictedCategory = 'shipping'; score = Math.max(score, 0.82); signals.push('shipping'); }

  // 2) Retrieve KB (simple keyword search)
  const all = await Article.find({ status: 'published' });
  const ranked = all.map(a => {
    const t = (a.title + ' ' + a.body + ' ' + (a.tags||[]).join(' ')).toLowerCase();
    let s = 0;
    text.split(/\W+/).forEach(tok => { if (tok && t.includes(tok)) s += 1; });
    if (a.tags && a.tags.includes(predictedCategory)) s += 2;
    return { a, s };
  }).sort((x,y) => y.s - x.s).slice(0,3);

  const articles = ranked.map(r => r.a);
  const articleIds = articles.map(a => a._id);

  // 3) Draft reply
  const citations = articles.map((a, idx) => `${idx+1}. ${a.title}`).join('\n');
  const draftReply = `Hi there,\n\nThanks for reaching out. We categorized your issue as **${predictedCategory}**. ` +
    `Here are some steps that may help (see references below):\n- Please review the relevant guide(s).\n- If this doesn't resolve your issue, reply and an agent will assist.\n\nReferences:\n${citations}\n\nBest,\nSupport Bot`;

  const latencyMs = Date.now() - start;
  return {
    traceId,
    predictedCategory,
    confidence: Number(score.toFixed(2)),
    articleIds,
    draftReply,
    modelInfo: { provider: process.env.STUB_MODE ? 'stub' : 'openai', model: 'stub-rule-based', promptVersion: 'v1', latencyMs }
  };
}
