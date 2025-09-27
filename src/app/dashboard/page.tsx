'use client';

import { useState, useRef } from 'react';

import { DocumentAnalysis } from '../../types/document';

import { useAuth } from '../../providers/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'search' | 'cross-analysis'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
      setAnalysisResult(null);
    }
  };

  const processDocument = async () => {
    if (!uploadedFile) {
return;
}

    setIsProcessing(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Try to call the document processing API
      const response = await fetch('/api/document/analyze', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result.summary || 'Document processed successfully');
        setDocumentAnalysis(result.analysis);
        if (result.analysis) {
          setDocuments(prev => [...prev, result.analysis]);
        }
      } else {
        // If API is not available, show mock response
        setTimeout(() => {
          setAnalysisResult(`Mock AI Analysis for "${uploadedFile.name}":

📄 Document Overview:
- File type: ${uploadedFile.type}
- Size: ${(uploadedFile.size / 1024).toFixed(1)} KB
- Upload time: ${new Date().toLocaleString()}

🤖 AI Analysis (Demo Mode):
This is a mock analysis response since this is the UI-only repository. In the full implementation, Ollama would process your document and provide:

• Key concepts and topics identified
• Research insights and connections
• Suggested next steps for your research
• Related literature recommendations
• Methodology suggestions based on document content

To see real AI processing, you would need:
1. The full repository with backend API routes
2. Ollama running locally or on a server
3. Proper document processing pipeline
4. AI model integration for analysis

Current Status: UI components working ✅
Backend integration: Needs full repository setup ⚠️`);
          setIsProcessing(false);
        }, 2000);
        return;
      }
    } catch (error: any) {
      // Mock AI response for demo
      setTimeout(() => {
        setAnalysisResult(`🔧 Demo Mode Active - Mock AI Analysis

Since this is the UI-only repository, the document upload is working but there's no backend processing available.

Your file "${uploadedFile.name}" would normally be processed by:
• Ollama AI model for content analysis
• OCR for text extraction (if image/PDF)
• Research context analysis
• Citation and reference extraction

To enable real AI processing, you need the full stembot-mvp-core repository with:
• API routes (/api/document/analyze)
• Ollama integration
• Document processing pipeline
• Vector embeddings for semantic search

Current UI Status: ✅ Working
Backend Status: ⚠️ Not available in UI-only repo`);
        setIsProcessing(false);
      }, 2000);
    }
  };

  const performSemanticSearch = async () => {
    if (!searchQuery.trim()) {
return;
}

    try {
      const response = await fetch('/api/document/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          topK: 10
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const performCrossDocumentAnalysis = async () => {
    if (documents.length < 2) {
return;
}

    try {
      const response = await fetch('/api/document/cross-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: documents.map(d => d.id),
          analysisType: 'full'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Cross-analysis result:', result);
      }
    } catch (error) {
      console.error('Cross-analysis error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Research Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user?.profile?.display_name || user?.email || 'Researcher'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                Demo Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: '📄 Document Upload', icon: '📄' },
              { id: 'analysis', label: '🧠 AI Analysis', icon: '🧠' },
              { id: 'search', label: '🔍 Semantic Search', icon: '🔍' },
              { id: 'cross-analysis', label: '🔗 Cross-Analysis', icon: '🔗' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'upload' && (
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  📄 Document Upload & AI Analysis
                </h2>

                {/* Upload Area */}
                <div className="mb-6">
                  <div
                    className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-400"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                      Upload Research Document
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Upload PDF papers, research documents, or images for AI analysis
                    </p>
                    <button className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                      Choose File
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Uploaded File Info */}
                {uploadedFile && (
                  <div className="mb-6 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={processDocument}
                        disabled={isProcessing}
                        className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                            Processing...
                          </div>
                        ) : (
                          '🤖 Analyze with AI'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Analysis Results */}
                {analysisResult && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="mb-3 font-semibold text-blue-900">AI Analysis Results</h3>
                    <div className="whitespace-pre-line text-sm text-blue-800">
                      {analysisResult}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h3 className="mb-2 font-semibold text-red-900">Error</h3>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {activeTab === 'analysis' && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    🧠 Advanced Document Intelligence
                  </h2>

                  {documentAnalysis ? (
                    <div className="space-y-6">
                      {/* Document Overview */}
                      <div className="rounded-lg bg-blue-50 p-4">
                        <h3 className="mb-2 font-semibold text-blue-900">Document Overview</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Title:</strong> {documentAnalysis.content.structure.title || 'Not detected'}</div>
                          <div><strong>Type:</strong> {documentAnalysis.research ? 'Research Paper' : documentAnalysis.experimental ? 'Experimental Data' : 'General'}</div>
                          <div><strong>Status:</strong> <span className="rounded bg-green-100 px-2 py-1 text-green-800">{documentAnalysis.status}</span></div>
                          <div><strong>Processed:</strong> {new Date(documentAnalysis.processedAt).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Research Paper Intelligence */}
                      {documentAnalysis.research && (
                        <div className="rounded-lg bg-green-50 p-4">
                          <h3 className="mb-3 font-semibold text-green-900">🔬 Research Paper Analysis</h3>

                          {documentAnalysis.research.researchQuestions.length > 0 && (
                            <div className="mb-4">
                              <h4 className="mb-2 font-medium text-green-800">Research Questions:</h4>
                              <ul className="list-inside list-disc space-y-1 text-sm">
                                {documentAnalysis.research.researchQuestions.slice(0, 3).map((q, i) => (
                                  <li key={i}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {documentAnalysis.research.keyFindings.length > 0 && (
                            <div className="mb-4">
                              <h4 className="mb-2 font-medium text-green-800">Key Findings:</h4>
                              <div className="space-y-2">
                                {documentAnalysis.research.keyFindings.slice(0, 3).map((finding, i) => (
                                  <div key={i} className="flex items-start space-x-2">
                                    <span className={`rounded px-2 py-1 text-xs ${
                                      finding.significance === 'high' ? 'bg-red-100 text-red-800' :
                                      finding.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {finding.significance}
                                    </span>
                                    <span className="text-sm">{finding.statement}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="mb-1 font-medium text-green-800">Novelty Score</h4>
                              <div className="text-2xl font-bold text-green-600">{documentAnalysis.research.novelty.score}/10</div>
                            </div>
                            <div>
                              <h4 className="mb-1 font-medium text-green-800">Methodology Score</h4>
                              <div className="text-2xl font-bold text-green-600">{documentAnalysis.research.methodology_critique.score}/10</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Experimental Data Intelligence */}
                      {documentAnalysis.experimental && (
                        <div className="rounded-lg bg-purple-50 p-4">
                          <h3 className="mb-3 font-semibold text-purple-900">📊 Experimental Data Analysis</h3>

                          <div className="mb-4 grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{documentAnalysis.experimental.dataQuality.score}/10</div>
                              <div className="text-sm text-purple-700">Data Quality</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{documentAnalysis.experimental.statisticalSignificance.confidence}%</div>
                              <div className="text-sm text-purple-700">Confidence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{documentAnalysis.experimental.experimentalDesign.sampleSize}</div>
                              <div className="text-sm text-purple-700">Sample Size</div>
                            </div>
                          </div>

                          {documentAnalysis.experimental.hypotheses.length > 0 && (
                            <div>
                              <h4 className="mb-2 font-medium text-purple-800">Generated Hypotheses:</h4>
                              <div className="space-y-2">
                                {documentAnalysis.experimental.hypotheses.slice(0, 2).map((hyp, i) => (
                                  <div key={i} className="rounded bg-white p-3">
                                    <div className="font-medium">{hyp.statement}</div>
                                    <div className="mt-1 text-sm text-gray-600">{hyp.rationale}</div>
                                    <div className="mt-1 text-xs text-purple-600">Testability: {hyp.testability}/10</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Document Relationships */}
                      {documentAnalysis.relationships && documentAnalysis.relationships.length > 0 && (
                        <div className="rounded-lg bg-orange-50 p-4">
                          <h3 className="mb-3 font-semibold text-orange-900">🔗 Document Relationships</h3>
                          <div className="space-y-2">
                            {documentAnalysis.relationships.slice(0, 3).map((rel, i) => (
                              <div key={i} className="flex items-center justify-between rounded bg-white p-3">
                                <div>
                                  <div className="font-medium">{rel.type.replace('_', ' ')}</div>
                                  <div className="text-sm text-gray-600">{rel.description}</div>
                                </div>
                                <div className="text-lg font-bold text-orange-600">
                                  {Math.round(rel.similarity * 100)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mb-2 text-lg text-gray-400">📄</div>
                      <p className="text-gray-500">Upload and analyze a document to see detailed intelligence here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    🔍 Semantic Search Across Documents
                  </h2>

                  <div className="mb-6">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search across all uploaded documents..."
                        className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
                      />
                      <button
                        onClick={performSemanticSearch}
                        className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Search Results ({searchResults.length})</h3>
                      {searchResults.map((result, i) => (
                        <div key={i} className="rounded-lg border p-4 hover:bg-gray-50">
                          <div className="mb-2 flex items-start justify-between">
                            <h4 className="font-medium text-gray-900">{result.metadata?.title || `Result ${i + 1}`}</h4>
                            <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                              {Math.round(result.similarity * 100)}% match
                            </span>
                          </div>
                          <p className="mb-2 text-sm text-gray-600">{result.content}</p>
                          {result.relevanceExplanation && (
                            <p className="text-xs text-blue-600">{result.relevanceExplanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mb-2 text-lg text-gray-400">🔍</div>
                      <p className="text-gray-500">Enter a search query to find relevant content across all documents.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'cross-analysis' && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    🔗 Cross-Document Analysis
                  </h2>

                  {documents.length >= 2 ? (
                    <div className="space-y-6">
                      <div className="rounded-lg bg-blue-50 p-4">
                        <h3 className="mb-2 font-semibold text-blue-900">Documents for Analysis</h3>
                        <div className="space-y-2">
                          {documents.map((doc, i) => (
                            <div key={doc.id} className="flex items-center space-x-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                                {i + 1}
                              </div>
                              <div>
                                <div className="font-medium">{doc.content.structure.title || doc.filename}</div>
                                <div className="text-sm text-gray-500">{doc.fileType} • {(doc.size / 1024).toFixed(1)} KB</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <button
                          onClick={() => performCrossDocumentAnalysis()}
                          className="rounded-lg bg-green-600 p-4 text-center text-white transition-colors hover:bg-green-700"
                        >
                          <div className="mb-2 text-2xl">🔍</div>
                          <div className="font-medium">Find Contradictions</div>
                          <div className="text-sm opacity-90">Identify conflicting claims</div>
                        </button>

                        <button
                          onClick={() => performCrossDocumentAnalysis()}
                          className="rounded-lg bg-purple-600 p-4 text-center text-white transition-colors hover:bg-purple-700"
                        >
                          <div className="mb-2 text-2xl">⚡</div>
                          <div className="font-medium">Methodological Gaps</div>
                          <div className="text-sm opacity-90">Find missing methodologies</div>
                        </button>

                        <button
                          onClick={() => performCrossDocumentAnalysis()}
                          className="rounded-lg bg-orange-600 p-4 text-center text-white transition-colors hover:bg-orange-700"
                        >
                          <div className="mb-2 text-2xl">🎯</div>
                          <div className="font-medium">Consensus Findings</div>
                          <div className="text-sm opacity-90">Identify agreements</div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mb-2 text-lg text-gray-400">📚</div>
                      <p className="mb-4 text-gray-500">Upload at least 2 documents to enable cross-document analysis.</p>
                      <p className="text-sm text-gray-400">Current documents: {documents.length}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Integration Status */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">🔧 Integration Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">UI Components</span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File Upload</span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Working</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backend API</span>
                  <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Mock</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ollama AI</span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pinecone Vector DB</span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Document Intelligence</span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">🚀 Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">📄 Upload Document</div>
                  <div className="text-sm text-gray-500">Analyze with AI intelligence</div>
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className="w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">🔍 Semantic Search</div>
                  <div className="text-sm text-gray-500">Find insights across documents</div>
                </button>
                <button
                  onClick={() => setActiveTab('cross-analysis')}
                  className="w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">🔗 Cross-Analysis</div>
                  <div className="text-sm text-gray-500">Compare multiple documents</div>
                </button>
                <button className="w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
                  <div className="font-medium text-gray-900">💬 AI Research Chat</div>
                  <div className="text-sm text-gray-500">Ask questions about findings</div>
                </button>
              </div>
            </div>

            {/* Advanced Features */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-900">🤖 AI Features Available</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Research Paper Intelligence
                </div>
                <div className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Experimental Data Analysis
                </div>
                <div className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Cross-Document Comparison
                </div>
                <div className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Memory-Based Insights
                </div>
                <div className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Semantic Search
                </div>
              </div>
            </div>

            {/* Document Statistics */}
            {documents.length > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h4 className="mb-2 font-semibold text-green-900">📊 Document Library</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{documents.length}</div>
                    <div className="text-green-700">Documents</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {documents.filter(d => d.research).length}
                    </div>
                    <div className="text-green-700">Research Papers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {documents.filter(d => d.experimental).length}
                    </div>
                    <div className="text-green-700">Experimental Data</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {documents.reduce((acc, d) => acc + (d.relationships?.length || 0), 0)}
                    </div>
                    <div className="text-green-700">Relationships</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}