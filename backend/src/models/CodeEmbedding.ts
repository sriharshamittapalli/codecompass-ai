import mongoose, { Schema, Document } from 'mongoose';
import { CodeEmbedding as ICodeEmbedding } from '@/types';

export interface CodeEmbeddingDocument extends Omit<ICodeEmbedding, 'id'>, Document {
  _id: string;
}

const CodeEmbeddingSchema = new Schema<CodeEmbeddingDocument>({
  repositoryId: {
    type: String,
    required: true,
    index: true,
  },
  filePath: {
    type: String,
    required: true,
    index: true,
  },
  functionName: {
    type: String,
    index: true,
  },
  className: {
    type: String,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
    // This field will be used for vector search
    validate: {
      validator: function(v: number[]) {
        return v && v.length > 0;
      },
      message: 'Embedding must be a non-empty array of numbers',
    },
  },
  metadata: {
    language: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['file', 'function', 'class'],
      index: true,
    },
    startLine: {
      type: Number,
    },
    endLine: {
      type: Number,
    },
    complexity: {
      type: Number,
      min: 1,
      max: 100,
    },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Compound indexes for efficient queries
CodeEmbeddingSchema.index({ repositoryId: 1, filePath: 1 });
CodeEmbeddingSchema.index({ repositoryId: 1, 'metadata.type': 1 });
CodeEmbeddingSchema.index({ 'metadata.language': 1, 'metadata.type': 1 });
CodeEmbeddingSchema.index({ functionName: 1, 'metadata.language': 1 });
CodeEmbeddingSchema.index({ className: 1, 'metadata.language': 1 });

// Vector search index - This is the key feature for MongoDB challenge!
// Note: This needs to be created via MongoDB Atlas UI or MongoDB Compass
// Index name: 'vector_index'
// Field: 'embedding'
// Type: 'vectorSearch'
// Dimensions: 768 (for typical embeddings like text-embedding-ada-002)
// Similarity: 'cosine' or 'euclidean'

export const CodeEmbedding = mongoose.model<CodeEmbeddingDocument>('CodeEmbedding', CodeEmbeddingSchema); 