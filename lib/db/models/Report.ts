import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  scanIds: mongoose.Types.ObjectId[];
  format: 'pdf' | 'html' | 'json' | 'markdown';
  fileUrl?: string;
  isPublic: boolean;
  shareToken?: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    scanIds: [{ type: Schema.Types.ObjectId, ref: 'ScanResult' }],
    format: { type: String, enum: ['pdf', 'html', 'json', 'markdown'], default: 'json' },
    fileUrl: String,
    isPublic: { type: Boolean, default: false },
    shareToken: String,
  },
  { timestamps: true }
);

ReportSchema.index({ userId: 1, createdAt: -1 });

export const Report =
  mongoose.models.Report ?? mongoose.model<IReport>('Report', ReportSchema);
