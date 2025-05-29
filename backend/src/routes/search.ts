import { Router } from 'express';
import { asyncHandler } from '@/utils/errorHandler';
import { validateRequest, searchQuerySchema } from '@/utils/validation';
import { SearchService } from '@/services/SearchService';
import { VectorService } from '@/services/VectorService';

const router = Router();

// POST /api/search/code - Search for code using semantic, exact, or similarity search
router.post('/code', validateRequest(searchQuerySchema), asyncHandler(async (req, res) => {
  const { query, type, filters, limit, threshold } = req.body;

  let results;

  switch (type) {
    case 'semantic':
      results = await SearchService.semanticSearch(query, { filters, limit });
      break;
    case 'exact':
      results = await SearchService.exactSearch(query, { filters, limit });
      break;
    case 'similarity':
      // Generate embedding for the query
      const queryEmbedding = await VectorService.generateEmbedding(query);
      results = await SearchService.vectorSimilaritySearch(queryEmbedding, { 
        filters, 
        limit, 
        threshold 
      });
      break;
    default:
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid search type',
          code: 'INVALID_SEARCH_TYPE',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
  }

  res.json({
    success: true,
    data: {
      results,
      searchType: type,
      query,
      totalResults: results.length,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// POST /api/search/similar - Find similar code using vector embeddings
router.post('/similar', asyncHandler(async (req, res) => {
  const { repositoryId, filePath, functionName, className, threshold = 0.7, limit = 10 } = req.body;

  if (!repositoryId && !filePath) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Either repositoryId or filePath is required',
        code: 'MISSING_SEARCH_CRITERIA',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  const results = await SearchService.findSimilarCode({
    repositoryId,
    filePath,
    functionName,
    className,
    threshold,
    limit,
  });

  res.json({
    success: true,
    data: {
      results,
      criteria: {
        repositoryId,
        filePath,
        functionName,
        className,
      },
      totalResults: results.length,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// GET /api/search/suggestions - Get search suggestions based on repository content
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { repositoryId, query } = req.query;

  if (!repositoryId) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Repository ID is required',
        code: 'MISSING_REPOSITORY_ID',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  const suggestions = await SearchService.getSearchSuggestions(
    repositoryId as string,
    query as string
  );

  res.json({
    success: true,
    data: {
      suggestions,
      repositoryId,
      query: query || '',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// POST /api/search/vector - Direct vector search (for advanced users)
router.post('/vector', asyncHandler(async (req, res) => {
  const { embedding, limit = 10, threshold = 0.7, filter } = req.body;

  if (!embedding || !Array.isArray(embedding)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Valid embedding array is required',
        code: 'INVALID_EMBEDDING',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  const results = await VectorService.vectorSearch({
    embedding,
    limit,
    threshold,
    filter,
  });

  res.json({
    success: true,
    data: {
      results,
      embeddingDimensions: embedding.length,
      totalResults: results.length,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// GET /api/search/languages - Get available programming languages
router.get('/languages', asyncHandler(async (req, res) => {
  const languages = await SearchService.getAvailableLanguages();

  res.json({
    success: true,
    data: {
      languages,
      total: languages.length,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// GET /api/search/stats - Get search statistics and insights
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await SearchService.getSearchStats();

  res.json({
    success: true,
    data: stats,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

export default router; 