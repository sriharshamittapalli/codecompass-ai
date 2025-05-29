import { VertexAI } from '@google-cloud/vertexai';
import { CodeEmbedding } from '@/models/CodeEmbedding';
import { VectorSearchOptions, CodeEmbedding as ICodeEmbedding } from '@/types';
import { createError } from '@/utils/errorHandler';

export class VectorService {
  private static vertexAI: VertexAI;
  private static textModel: any;

  static async initialize() {
    try {
      this.vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
        location: process.env.VERTEX_AI_LOCATION || 'us-central1',
      });

      // Initialize text embedding model
      this.textModel = this.vertexAI.getGenerativeModel({
        model: 'text-embedding-004', // Use latest Google embedding model
      });

      console.log('✅ VectorService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize VectorService:', error);
      throw createError('Failed to initialize AI services', 500);
    }
  }

  /**
   * Generate embeddings for code content using Google Vertex AI
   */
  static async generateEmbedding(content: string): Promise<number[]> {
    try {
      if (!this.textModel) {
        await this.initialize();
      }

      // Preprocess code content for better embeddings
      const processedContent = this.preprocessCodeForEmbedding(content);

      const result = await this.textModel.embedContent({
        content: [{ role: 'user', parts: [{ text: processedContent }] }],
      });

      if (!result.embedding?.values) {
        throw new Error('No embedding values returned from Vertex AI');
      }

      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw createError('Failed to generate code embedding', 500);
    }
  }

  /**
   * Store code embedding in MongoDB
   */
  static async storeEmbedding(embeddingData: Omit<ICodeEmbedding, 'id' | 'createdAt'>): Promise<ICodeEmbedding> {
    try {
      const codeEmbedding = new CodeEmbedding(embeddingData);
      const saved = await codeEmbedding.save();
      return saved.toJSON();
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw createError('Failed to store code embedding', 500);
    }
  }

  /**
   * Perform vector similarity search using MongoDB Atlas Vector Search
   * This is the KEY FEATURE for the MongoDB challenge!
   */
  static async vectorSearch(options: VectorSearchOptions): Promise<ICodeEmbedding[]> {
    try {
      const { embedding, limit = 10, threshold = 0.7, filter = {} } = options;

      // MongoDB Vector Search aggregation pipeline
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_index', // This index needs to be created in MongoDB Atlas
            path: 'embedding',
            queryVector: embedding,
            numCandidates: Math.max(limit * 10, 100), // Search more candidates for better results
            limit: limit,
            filter: filter, // Additional filters (language, type, etc.)
          },
        },
        {
          $addFields: {
            score: { $meta: 'vectorSearchScore' }, // Add similarity score
          },
        },
        {
          $match: {
            score: { $gte: threshold }, // Filter by similarity threshold
          },
        },
        {
          $project: {
            _id: 0,
            id: { $toString: '$_id' },
            repositoryId: 1,
            filePath: 1,
            functionName: 1,
            className: 1,
            content: 1,
            embedding: 1,
            metadata: 1,
            createdAt: 1,
            score: 1,
          },
        },
      ];

      const results = await CodeEmbedding.aggregate(pipeline);
      return results;
    } catch (error) {
      console.error('Error performing vector search:', error);
      throw createError('Vector search failed', 500);
    }
  }

  /**
   * Find similar code based on existing code embedding
   */
  static async findSimilarCode(
    repositoryId: string,
    filePath?: string,
    functionName?: string,
    className?: string,
    threshold = 0.7,
    limit = 10
  ): Promise<ICodeEmbedding[]> {
    try {
      // Find the reference embedding
      const query: any = { repositoryId };
      if (filePath) query.filePath = filePath;
      if (functionName) query.functionName = functionName;
      if (className) query.className = className;

      const referenceEmbedding = await CodeEmbedding.findOne(query);
      if (!referenceEmbedding) {
        throw createError('Reference code not found', 404);
      }

      // Perform vector search excluding the reference itself
      const results = await this.vectorSearch({
        embedding: referenceEmbedding.embedding,
        limit: limit + 1, // Get one extra to exclude self
        threshold,
        filter: {
          _id: { $ne: referenceEmbedding._id }, // Exclude self
        },
      });

      return results.slice(0, limit); // Remove the extra result
    } catch (error) {
      console.error('Error finding similar code:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for entire repository (batch processing)
   */
  static async generateRepositoryEmbeddings(repositoryId: string, files: any[]): Promise<void> {
    try {
      const batchSize = 10; // Process in batches to avoid rate limits
      
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (file) => {
            try {
              // Generate embedding for the entire file
              const fileEmbedding = await this.generateEmbedding(file.content);
              
              await this.storeEmbedding({
                repositoryId,
                filePath: file.path,
                content: file.content,
                embedding: fileEmbedding,
                metadata: {
                  language: file.language,
                  type: 'file',
                  complexity: file.complexity,
                },
              });

              // Generate embeddings for individual functions
              for (const func of file.functions || []) {
                const functionEmbedding = await this.generateEmbedding(func.content);
                
                await this.storeEmbedding({
                  repositoryId,
                  filePath: file.path,
                  functionName: func.name,
                  content: func.content,
                  embedding: functionEmbedding,
                  metadata: {
                    language: file.language,
                    type: 'function',
                    startLine: func.startLine,
                    endLine: func.endLine,
                    complexity: func.complexity,
                  },
                });
              }

              // Generate embeddings for classes
              for (const cls of file.classes || []) {
                const classEmbedding = await this.generateEmbedding(cls.content);
                
                await this.storeEmbedding({
                  repositoryId,
                  filePath: file.path,
                  className: cls.name,
                  content: cls.content,
                  embedding: classEmbedding,
                  metadata: {
                    language: file.language,
                    type: 'class',
                    startLine: cls.startLine,
                    endLine: cls.endLine,
                  },
                });
              }
            } catch (error) {
              console.error(`Error processing file ${file.path}:`, error);
            }
          })
        );

        // Add delay between batches to respect rate limits
        if (i + batchSize < files.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error generating repository embeddings:', error);
      throw createError('Failed to generate repository embeddings', 500);
    }
  }

  /**
   * Preprocess code content for better embeddings
   */
  private static preprocessCodeForEmbedding(content: string): string {
    // Remove excessive whitespace and normalize
    let processed = content
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .trim();

    // Truncate if too long (embedding models have token limits)
    if (processed.length > 8000) {
      processed = processed.substring(0, 8000) + '...';
    }

    return processed;
  }

  /**
   * Get embedding statistics for a repository
   */
  static async getEmbeddingStats(repositoryId: string) {
    try {
      const stats = await CodeEmbedding.aggregate([
        { $match: { repositoryId } },
        {
          $group: {
            _id: '$metadata.type',
            count: { $sum: 1 },
            avgComplexity: { $avg: '$metadata.complexity' },
            languages: { $addToSet: '$metadata.language' },
          },
        },
      ]);

      const totalEmbeddings = await CodeEmbedding.countDocuments({ repositoryId });

      return {
        totalEmbeddings,
        breakdown: stats,
        repositoryId,
      };
    } catch (error) {
      console.error('Error getting embedding stats:', error);
      throw createError('Failed to get embedding statistics', 500);
    }
  }
}

// Initialize the service
VectorService.initialize().catch(console.error); 