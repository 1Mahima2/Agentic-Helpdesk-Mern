import AuditLog from '../models/AuditLog.js';

export async function logEvent({ ticketId, traceId, actor, action, meta }) {
  await AuditLog.create({ ticketId, traceId, actor, action, meta, timestamp: new Date() });
}
