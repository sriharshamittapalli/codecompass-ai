import { useState } from 'react';
import Image from "next/image";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!repoUrl) return;
    
    setIsAnalyzing(true);
    // TODO: Connect to backend API
    console.log('Analyzing repository:', repoUrl);
    
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            CodeCompass AI 🧭
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Google Maps for Code - Transform any GitHub repository into an interactive, 
            AI-powered codebase explorer. Navigate, understand, and contribute to complex codebases instantly.
          </p>
          
          {/* Repository Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Paste any GitHub repository URL..."
                className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAnalyze}
                disabled={!repoUrl || isAnalyzing}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? '🔄 Analyzing...' : '🚀 Analyze'}
              </button>
            </div>
          </div>

          {/* Sample Repository Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setRepoUrl('https://github.com/facebook/react')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Try React
            </button>
            <button
              onClick={() => setRepoUrl('https://github.com/microsoft/vscode')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Try VS Code
            </button>
            <button
              onClick={() => setRepoUrl('https://github.com/tensorflow/tensorflow')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Try TensorFlow
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-4">Smart Code Navigation</h3>
            <p className="text-gray-600">
              AI-powered exploration with semantic search across entire codebases. 
              Find what you're looking for, even if you don't know where it is.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🧬</div>
            <h3 className="text-xl font-semibold mb-4">Code DNA Matching</h3>
            <p className="text-gray-600">
              Vector similarity search finds related functions, similar patterns, 
              and architectural connections across different files and projects.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-4">Auto Documentation</h3>
            <p className="text-gray-600">
              AI-generated explanations, function documentation, and architectural 
              insights help you understand any codebase instantly.
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Powered by Cutting-Edge AI</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🍃</div>
              <h4 className="font-semibold">MongoDB</h4>
              <p className="text-sm text-gray-600">Vector Search</p>
            </div>
            <div>
              <div className="text-3xl mb-2">☁️</div>
              <h4 className="font-semibold">Google Cloud</h4>
              <p className="text-sm text-gray-600">Vertex AI</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚛️</div>
              <h4 className="font-semibold">Next.js</h4>
              <p className="text-sm text-gray-600">React Frontend</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔧</div>
              <h4 className="font-semibold">TypeScript</h4>
              <p className="text-sm text-gray-600">Full Stack</p>
            </div>
          </div>
        </div>

        {/* Demo Video Placeholder */}
        <div className="bg-gray-900 rounded-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">See CodeCompass AI in Action</h2>
          <p className="text-gray-300 mb-8">Watch how CodeCompass AI transforms code exploration</p>
          <div className="bg-gray-800 rounded-lg p-16 mb-6">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-400">Demo video coming soon...</p>
          </div>
          <div className="text-sm text-gray-400">
            Built for AI in Action Hackathon 2025 | MongoDB Track
          </div>
        </div>
      </div>
    </div>
  );
}
