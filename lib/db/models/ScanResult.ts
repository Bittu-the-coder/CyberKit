import mongoose, { Document, Schema } from 'mongoose';

export interface IFinding {
  type: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  evidence?: string;
}

export interface IScanResult extends Document {
  userId?: mongoose.Types.ObjectId;
  toolName: string;
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  findings: IFinding[];
  duration?: number;
  jobId?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
}

const FindingSchema = new Schema<IFinding>({
  type: String,
  severity: { type: String, enum: ['info', 'low', 'medium', 'high', 'critical'] },
  title: String,
  description: String,
  recommendation: String,
  evidence: String,
});

const ScanResultSchema = new Schema<IScanResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    toolName: { type: String, required: true },
    target: { type: String, required: true },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'completed' },
    severity: { type: String, enum: ['info', 'low', 'medium', 'high', 'critical'], default: 'info' },
    input: { type: Schema.Types.Mixed, default: {} },
    result: { type: Schema.Types.Mixed, default: {} },
    findings: { type: [FindingSchema], default: [] },
    duration: Number,
    jobId: String,
    tags: { type: [String], default: [] },
    notes: String,
  },
  { timestamps: true }
);

ScanResultSchema.index({ userId: 1, createdAt: -1 });
ScanResultSchema.index({ toolName: 1 });

export const ScanResult =
  (mongoose.models && mongoose.models.ScanResult) || mongoose.model<IScanResult>('ScanResult', ScanResultSchema);
