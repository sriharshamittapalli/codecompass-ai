import Joi from 'joi';

// Repository URL validation
export const validateRepository = (repoUrl: string) => {
  if (!repoUrl || typeof repoUrl !== 'string') {
    return { valid: false, error: 'Repository URL is required' };
  }

  // GitHub URL patterns
  const githubPatterns = [
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/,
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\.git$/,
    /^git@github\.com:[\w.-]+\/[\w.-]+\.git$/,
  ];

  const isValidGitHub = githubPatterns.some(pattern => pattern.test(repoUrl));
  
  if (!isValidGitHub) {
    return { 
      valid: false, 
      error: 'Invalid GitHub repository URL. Please provide a valid GitHub repository URL.' 
    };
  }

  return { valid: true, error: null };
};

// Search query validation schema
export const searchQuerySchema = Joi.object({
  query: Joi.string().required().min(1).max(500),
  type: Joi.string().valid('semantic', 'exact', 'similarity').default('semantic'),
  filters: Joi.object({
    language: Joi.string().optional(),
    fileType: Joi.string().optional(),
    complexity: Joi.string().valid('low', 'medium', 'high').optional(),
    repository: Joi.string().optional(),
  }).optional(),
  limit: Joi.number().min(1).max(50).default(10),
  threshold: Joi.number().min(0).max(1).default(0.7),
});

// Repository query parameters validation
export const repositoryQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  language: Joi.string().optional(),
  sort: Joi.string().valid('createdAt', 'updatedAt', 'name', 'stargazersCount').default('createdAt'),
});

// Analyze repository request validation
export const analyzeRepositorySchema = Joi.object({
  repoUrl: Joi.string().required(),
});

// Vector search validation
export const vectorSearchSchema = Joi.object({
  embedding: Joi.array().items(Joi.number()).required(),
  limit: Joi.number().min(1).max(100).default(10),
  threshold: Joi.number().min(0).max(1).default(0.7),
  filter: Joi.object().optional(),
});

// File path validation
export const validateFilePath = (path: string) => {
  if (!path || typeof path !== 'string') {
    return { valid: false, error: 'File path is required' };
  }

  // Check for directory traversal attempts
  if (path.includes('..') || path.includes('//') || path.startsWith('/')) {
    return { valid: false, error: 'Invalid file path' };
  }

  return { valid: true, error: null };
};

// Language validation
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'swift',
  'kotlin',
  'scala',
  'html',
  'css',
  'scss',
  'sass',
  'less',
  'json',
  'yaml',
  'yml',
  'xml',
  'markdown',
  'md',
];

export const validateLanguage = (language: string) => {
  if (!language || typeof language !== 'string') {
    return { valid: false, error: 'Language is required' };
  }

  const normalizedLanguage = language.toLowerCase();
  if (!SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
    return { 
      valid: false, 
      error: `Unsupported language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}` 
    };
  }

  return { valid: true, error: null };
};

// Request validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
          code: 'VALIDATION_ERROR',
          details: error.details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
          code: 'VALIDATION_ERROR',
          details: error.details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    // Set validated values
    req.query = value;
    next();
  };
}; 