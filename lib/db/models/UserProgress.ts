import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  completedLessons: mongoose.Types.ObjectId[];
  quizScores: Array<{ lessonId: mongoose.Types.ObjectId; score: number; attempts: number }>;
  currentLesson?: mongoose.Types.ObjectId;
  percentComplete: number;
  completedAt?: Date;
  certificateUrl?: string;
  xpEarned: number;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    completedLessons: [{ type: Schema.Types.ObjectId }],
    quizScores: [
      {
        lessonId: Schema.Types.ObjectId,
        score: Number,
        attempts: { type: Number, default: 0 },
      },
    ],
    currentLesson: Schema.Types.ObjectId,
    percentComplete: { type: Number, default: 0 },
    completedAt: Date,
    certificateUrl: String,
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const UserProgress =
  mongoose.models.UserProgress ??
  mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
