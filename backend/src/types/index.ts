export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  cloneUrl: string;
  language: string;
  size: number;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  defaultBranch: string;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    login: string;
    avatarUrl: string;
    type: string;
  };
  topics: string[];
  isAnalyzed: boolean;
  analysisProgress?: number;
  lastAnalyzedAt?: Date;
}

export interface CodeFile {
  id: string;
  repositoryId: string;
  path: string;
  name: string;
  extension: string;
  language: string;
  content: string;
  size: number;
  linesOfCode: number;
  complexity?: number;
  embedding?: number[];
  functions: CodeFunction[];
  classes: CodeClass[];
  imports: string[];
  exports: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeFunction {
  name: string;
  startLine: number;
  endLine: number;
  parameters: Parameter[];
  returnType?: string;
  complexity: number;
  description?: string;
  embedding?: number[];
}

export interface CodeClass {
  name: string;
  startLine: number;
  endLine: number;
  methods: CodeFunction[];
  properties: Property[];
  extends?: string;
  implements?: string[];
  description?: string;
}

export interface Parameter {
  name: string;
  type?: string;
  isOptional: boolean;
  defaultValue?: string;
}

export interface Property {
  name: string;
  type?: string;
  isPrivate: boolean;
  isStatic: boolean;
}

export interface AnalysisResult {
  repositoryId: string;
  summary: {
    totalFiles: number;
    totalLinesOfCode: number;
    languages: LanguageStats[];
    complexity: {
      average: number;
      highest: number;
      distribution: ComplexityDistribution;
    };
    architecture: ArchitectureInsights;
  };
  insights: {
    codeQuality: CodeQualityMetrics;
    patterns: ArchitecturalPattern[];
    dependencies: DependencyInfo[];
    suggestions: Suggestion[];
  };
  createdAt: Date;
}

export interface LanguageStats {
  language: string;
  fileCount: number;
  linesOfCode: number;
  percentage: number;
}

export interface ComplexityDistribution {
  low: number;    // 1-5
  medium: number; // 6-10
  high: number;   // 11-20
  veryHigh: number; // 21+
}

export interface ArchitectureInsights {
  patterns: string[];
  frameworks: string[];
  designPatterns: string[];
  layeredArchitecture?: {
    layers: string[];
    dependencies: LayerDependency[];
  };
}

export interface LayerDependency {
  from: string;
  to: string;
  strength: number;
}

export interface CodeQualityMetrics {
  maintainabilityIndex: number;
  technicalDebt: number;
  duplicateCodePercentage: number;
  testCoverage?: number;
  documentationCoverage: number;
}

export interface ArchitecturalPattern {
  name: string;
  confidence: number;
  description: string;
  files: string[];
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'direct' | 'transitive';
  category: 'production' | 'development' | 'optional';
  vulnerabilities?: Vulnerability[];
}

export interface Vulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cve?: string;
}

export interface Suggestion {
  type: 'performance' | 'security' | 'maintainability' | 'architecture';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion: string;
}

export interface SearchQuery {
  query: string;
  type: 'semantic' | 'exact' | 'similarity';
  filters?: {
    language?: string;
    fileType?: string;
    complexity?: 'low' | 'medium' | 'high';
    repository?: string;
  };
  limit?: number;
  threshold?: number; // For similarity search
}

export interface SearchResult {
  type: 'file' | 'function' | 'class' | 'variable';
  relevanceScore: number;
  file: {
    path: string;
    name: string;
    language: string;
    repositoryId: string;
    repositoryName: string;
  };
  match: {
    content: string;
    startLine: number;
    endLine: number;
    context: string;
  };
  explanation?: string;
}

export interface VectorSearchOptions {
  embedding: number[];
  limit?: number;
  threshold?: number;
  filter?: Record<string, any>;
}

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

export interface CodeEmbedding {
  id: string;
  repositoryId: string;
  filePath: string;
  functionName?: string;
  className?: string;
  content: string;
  embedding: number[];
  metadata: {
    language: string;
    type: 'file' | 'function' | 'class';
    startLine?: number;
    endLine?: number;
    complexity?: number;
  };
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
} 