import mongoose, { Schema, Document } from 'mongoose';
import { Repository as IRepository } from '@/types';

export interface RepositoryDocument extends Omit<IRepository, 'id'>, Document {
  _id: string;
}

const RepositorySchema = new Schema<RepositoryDocument>({
  name: {
    type: String,
    required: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    required: true,
  },
  cloneUrl: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    index: true,
  },
  size: {
    type: Number,
    required: true,
  },
  stargazersCount: {
    type: Number,
    default: 0,
    index: true,
  },
  forksCount: {
    type: Number,
    default: 0,
  },
  openIssuesCount: {
    type: Number,
    default: 0,
  },
  defaultBranch: {
    type: String,
    default: 'main',
  },
  owner: {
    login: {
      type: String,
      required: true,
      index: true,
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['User', 'Organization'],
    },
  },
  topics: [{
    type: String,
    index: true,
  }],
  isAnalyzed: {
    type: Boolean,
    default: false,
    index: true,
  },
  analysisProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  lastAnalyzedAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for performance
RepositorySchema.index({ fullName: 1 });
RepositorySchema.index({ language: 1, stargazersCount: -1 });
RepositorySchema.index({ 'owner.login': 1 });
RepositorySchema.index({ topics: 1 });
RepositorySchema.index({ isAnalyzed: 1, lastAnalyzedAt: -1 });
RepositorySchema.index({ createdAt: -1 });

// Text search index
RepositorySchema.index({
  name: 'text',
  fullName: 'text',
  description: 'text',
  topics: 'text',
});

export const Repository = mongoose.model<RepositoryDocument>('Repository', RepositorySchema); 