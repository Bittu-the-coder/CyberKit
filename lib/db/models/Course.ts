import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'lab';
  content: string;
  duration: number;
  xpReward: number;
}

export interface IModule {
  _id: mongoose.Types.ObjectId;
  title: string;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  slug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  thumbnail: string;
  isPro: boolean;
  modules: IModule[];
  totalLessons: number;
  totalDuration: number;
  enrollments: number;
  rating: number;
  createdAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  title: String,
  type: { type: String, enum: ['video', 'text', 'quiz', 'lab'] },
  content: String,
  duration: Number,
  xpReward: { type: Number, default: 10 },
});

const ModuleSchema = new Schema<IModule>({
  title: String,
  lessons: [LessonSchema],
});

const CourseSchema = new Schema<ICourse>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    category: String,
    tags: [String],
    thumbnail: String,
    isPro: { type: Boolean, default: false },
    modules: [ModuleSchema],
    totalLessons: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    enrollments: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CourseSchema.index({ slug: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ difficulty: 1 });

export const Course =
  mongoose.models.Course ?? mongoose.model<ICourse>('Course', CourseSchema);
