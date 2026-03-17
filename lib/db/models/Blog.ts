import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  thumbnail: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    tags: [String],
    thumbnail: { type: String, default: '' },
    published: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);


BlogSchema.index({ published: 1, publishedAt: -1 });

export const Blog = (mongoose.models && mongoose.models.Blog) || mongoose.model<IBlog>('Blog', BlogSchema);
