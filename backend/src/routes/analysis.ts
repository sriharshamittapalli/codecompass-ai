import { Router } from 'express';
import { asyncHandler } from '@/utils/errorHandler';
import { analysisRateLimit } from '@/utils/rateLimiter';
import { AnalysisService } from '@/services/AnalysisService';
import { AIService } from '@/services/AIService';

const router = Router();

// POST /api/analysis/explain - Get AI explanation for code snippet
router.post('/explain', asyncHandler(async (req, res) => {
  const { code, language, context } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Code snippet is required',
        code: 'MISSING_CODE',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  const explanation = await AIService.explainCode(code, language, context);

  res.json({
    success: true,
    data: {
      explanation,
      code,
      language,
      timestamp: new Date().toISOString(),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// POST /api/analysis/generate-docs - Generate documentation for code
router.post('/generate-docs', analysisRateLimit, asyncHandler(async (req, res) => {
  const { repositoryId, filePath, functionName, className } = req.body;

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

  const documentation = await AnalysisService.generateDocumentation({
    repositoryId,
    filePath,
    functionName,
    className,
  });

  res.json({
    success: true,
    data: documentation,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// POST /api/analysis/complexity - Analyze code complexity
router.post('/complexity', asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Code snippet is required',
        code: 'MISSING_CODE',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  const complexityAnalysis = await AnalysisService.analyzeComplexity(code, language);

  res.json({
    success: true,
    data: complexityAnalysis,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// POST /api/analysis/suggestions - Get improvement suggestions
router.post('/suggestions', asyncHandler(async (req, res) => {
  const { code, language, context } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Code snippet is required',
        code: 'MISSING_CODE',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  const suggestions = await AIService.generateSuggestions(code, language, context);

  res.json({
    success: true,
    data: {
      suggestions,
      code,
      language,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// GET /api/analysis/repository/:id/summary - Get repository analysis summary
router.get('/repository/:id/summary', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const summary = await AnalysisService.getRepositorySummary(id);

  if (!summary) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Repository analysis not found',
        code: 'ANALYSIS_NOT_FOUND',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  res.json({
    success: true,
    data: summary,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// GET /api/analysis/repository/:id/insights - Get detailed insights
router.get('/repository/:id/insights', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const insights = await AnalysisService.getRepositoryInsights(id);

  if (!insights) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Repository insights not found',
        code: 'INSIGHTS_NOT_FOUND',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  res.json({
    success: true,
    data: insights,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// POST /api/analysis/patterns - Detect architectural patterns
router.post('/patterns', analysisRateLimit, asyncHandler(async (req, res) => {
  const { repositoryId } = req.body;

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

  const patterns = await AnalysisService.detectArchitecturalPatterns(repositoryId);

  res.json({
    success: true,
    data: {
      patterns,
      repositoryId,
      analysisType: 'architectural_patterns',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

export default router; 