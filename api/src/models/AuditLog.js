import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  traceId: { type: String, required: true },
  actor: { type: String, enum: ['system','agent','user'], required: true },
  action: { type: String, required: true },
  meta: { type: Object, default: {} },
  timestamp: { type: Date, default: () => new Date() }
}, { timestamps: false });

export default mongoose.model('AuditLog', auditLogSchema);
