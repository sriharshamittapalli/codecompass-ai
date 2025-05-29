import { Router } from 'express';
import { asyncHandler } from '@/utils/errorHandler';
import { analysisRateLimit } from '@/utils/rateLimiter';
import { RepositoryService } from '@/services/RepositoryService';
import { GitHubService } from '@/services/GitHubService';
import { validateRepository } from '@/utils/validation';

const router = Router();

// GET /api/repositories - Get all repositories
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, language, sort = 'createdAt' } = req.query;
  
  const repositories = await RepositoryService.getRepositories({
    page: Number(page),
    limit: Number(limit),
    language: language as string,
    sort: sort as string,
  });

  res.json({
    success: true,
    data: repositories,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// GET /api/repositories/:id - Get repository by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const repository = await RepositoryService.getRepositoryById(req.params.id);
  
  if (!repository) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Repository not found',
        code: 'REPOSITORY_NOT_FOUND',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  res.json({
    success: true,
    data: repository,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// POST /api/repositories/analyze - Analyze a GitHub repository
router.post('/analyze', analysisRateLimit, asyncHandler(async (req, res) => {
  const { repoUrl } = req.body;
  
  // Validate repository URL
  const validation = validateRepository(repoUrl);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: {
        message: validation.error,
        code: 'INVALID_REPOSITORY_URL',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  // Parse GitHub URL
  const repoInfo = GitHubService.parseGitHubUrl(repoUrl);
  if (!repoInfo) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid GitHub repository URL',
        code: 'INVALID_GITHUB_URL',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  // Check if repository already exists
  const fullName = `${repoInfo.owner}/${repoInfo.repo}`;
  let repository = await RepositoryService.getRepositoryByFullName(fullName);

  if (!repository) {
    // Fetch repository data from GitHub
    const githubRepo = await GitHubService.getRepository(repoInfo.owner, repoInfo.repo);
    
    // Save repository to database
    repository = await RepositoryService.createRepository(githubRepo);
  }

  // Start analysis process (async)
  RepositoryService.analyzeRepository(repository.id)
    .catch(error => {
      console.error('Repository analysis failed:', error);
    });

  res.status(202).json({
    success: true,
    data: {
      repository,
      message: 'Repository analysis started',
      status: 'processing',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// GET /api/repositories/:id/analysis - Get analysis results
router.get('/:id/analysis', asyncHandler(async (req, res) => {
  const analysis = await RepositoryService.getAnalysisResult(req.params.id);
  
  if (!analysis) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Analysis not found or not completed',
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
    data: analysis,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// GET /api/repositories/:id/files - Get repository files
router.get('/:id/files', asyncHandler(async (req, res) => {
  const { path = '', type } = req.query;
  
  const files = await RepositoryService.getRepositoryFiles(req.params.id, {
    path: path as string,
    type: type as string,
  });

  res.json({
    success: true,
    data: files,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

// DELETE /api/repositories/:id - Delete repository
router.delete('/:id', asyncHandler(async (req, res) => {
  await RepositoryService.deleteRepository(req.params.id);

  res.json({
    success: true,
    data: {
      message: 'Repository deleted successfully',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
}));

export default router; 