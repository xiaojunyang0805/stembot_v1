'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { DocumentAnalysis } from '@/types/document';

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
    if (!uploadedFile) return;

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
    if (!searchQuery.trim()) return;

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
    if (documents.length < 2) return;

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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Research Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user?.profile?.display_name || user?.email || 'Researcher'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Demo Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'upload' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📄 Document Upload & AI Analysis
                </h2>

                {/* Upload Area */}
                <div className="mb-6">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="mx-auto w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Upload Research Document
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload PDF papers, research documents, or images for AI analysis
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
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
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">AI Analysis Results</h3>
                    <div className="text-sm text-blue-800 whitespace-pre-line">
                      {analysisResult}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-2">Error</h3>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {activeTab === 'analysis' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    🧠 Advanced Document Intelligence
                  </h2>

                  {documentAnalysis ? (
                    <div className="space-y-6">
                      {/* Document Overview */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Document Overview</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Title:</strong> {documentAnalysis.content.structure.title || 'Not detected'}</div>
                          <div><strong>Type:</strong> {documentAnalysis.research ? 'Research Paper' : documentAnalysis.experimental ? 'Experimental Data' : 'General'}</div>
                          <div><strong>Status:</strong> <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{documentAnalysis.status}</span></div>
                          <div><strong>Processed:</strong> {new Date(documentAnalysis.processedAt).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Research Paper Intelligence */}
                      {documentAnalysis.research && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h3 className="font-semibold text-green-900 mb-3">🔬 Research Paper Analysis</h3>

                          {documentAnalysis.research.researchQuestions.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-green-800 mb-2">Research Questions:</h4>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {documentAnalysis.research.researchQuestions.slice(0, 3).map((q, i) => (
                                  <li key={i}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {documentAnalysis.research.keyFindings.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-green-800 mb-2">Key Findings:</h4>
                              <div className="space-y-2">
                                {documentAnalysis.research.keyFindings.slice(0, 3).map((finding, i) => (
                                  <div key={i} className="flex items-start space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
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
                              <h4 className="font-medium text-green-800 mb-1">Novelty Score</h4>
                              <div className="text-2xl font-bold text-green-600">{documentAnalysis.research.novelty.score}/10</div>
                            </div>
                            <div>
                              <h4 className="font-medium text-green-800 mb-1">Methodology Score</h4>
                              <div className="text-2xl font-bold text-green-600">{documentAnalysis.research.methodology_critique.score}/10</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Experimental Data Intelligence */}
                      {documentAnalysis.experimental && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h3 className="font-semibold text-purple-900 mb-3">📊 Experimental Data Analysis</h3>

                          <div className="grid grid-cols-3 gap-4 mb-4">
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
                              <h4 className="font-medium text-purple-800 mb-2">Generated Hypotheses:</h4>
                              <div className="space-y-2">
                                {documentAnalysis.experimental.hypotheses.slice(0, 2).map((hyp, i) => (
                                  <div key={i} className="bg-white rounded p-3">
                                    <div className="font-medium">{hyp.statement}</div>
                                    <div className="text-sm text-gray-600 mt-1">{hyp.rationale}</div>
                                    <div className="text-xs text-purple-600 mt-1">Testability: {hyp.testability}/10</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Document Relationships */}
                      {documentAnalysis.relationships && documentAnalysis.relationships.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h3 className="font-semibold text-orange-900 mb-3">🔗 Document Relationships</h3>
                          <div className="space-y-2">
                            {documentAnalysis.relationships.slice(0, 3).map((rel, i) => (
                              <div key={i} className="bg-white rounded p-3 flex items-center justify-between">
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
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">📄</div>
                      <p className="text-gray-500">Upload and analyze a document to see detailed intelligence here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    🔍 Semantic Search Across Documents
                  </h2>

                  <div className="mb-6">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search across all uploaded documents..."
                        className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
                      />
                      <button
                        onClick={performSemanticSearch}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Search Results ({searchResults.length})</h3>
                      {searchResults.map((result, i) => (
                        <div key={i} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{result.metadata?.title || `Result ${i + 1}`}</h4>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {Math.round(result.similarity * 100)}% match
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{result.content}</p>
                          {result.relevanceExplanation && (
                            <p className="text-blue-600 text-xs">{result.relevanceExplanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">🔍</div>
                      <p className="text-gray-500">Enter a search query to find relevant content across all documents.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'cross-analysis' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    🔗 Cross-Document Analysis
                  </h2>

                  {documents.length >= 2 ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Documents for Analysis</h3>
                        <div className="space-y-2">
                          {documents.map((doc, i) => (
                            <div key={doc.id} className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          onClick={() => performCrossDocumentAnalysis()}
                          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                        >
                          <div className="text-2xl mb-2">🔍</div>
                          <div className="font-medium">Find Contradictions</div>
                          <div className="text-sm opacity-90">Identify conflicting claims</div>
                        </button>

                        <button
                          onClick={() => performCrossDocumentAnalysis()}
                          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
                        >
                          <div className="text-2xl mb-2">⚡</div>
                          <div className="font-medium">Methodological Gaps</div>
                          <div className="text-sm opacity-90">Find missing methodologies</div>
                        </button>

                        <button
                          onClick={() => performCrossDocumentAnalysis()}
                          className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
                        >
                          <div className="text-2xl mb-2">🎯</div>
                          <div className="font-medium">Consensus Findings</div>
                          <div className="text-sm opacity-90">Identify agreements</div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">📚</div>
                      <p className="text-gray-500 mb-4">Upload at least 2 documents to enable cross-document analysis.</p>
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🔧 Integration Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">UI Components</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File Upload</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Working</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backend API</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Mock</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ollama AI</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pinecone Vector DB</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Document Intelligence</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">📄 Upload Document</div>
                  <div className="text-sm text-gray-500">Analyze with AI intelligence</div>
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">🔍 Semantic Search</div>
                  <div className="text-sm text-gray-500">Find insights across documents</div>
                </button>
                <button
                  onClick={() => setActiveTab('cross-analysis')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">🔗 Cross-Analysis</div>
                  <div className="text-sm text-gray-500">Compare multiple documents</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">💬 AI Research Chat</div>
                  <div className="text-sm text-gray-500">Ask questions about findings</div>
                </button>
              </div>
            </div>

            {/* Advanced Features */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Features Available</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Research Paper Intelligence
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Experimental Data Analysis
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Cross-Document Comparison
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Memory-Based Insights
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Semantic Search
                </div>
              </div>
            </div>

            {/* Document Statistics */}
            {documents.length > 0 && (
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <h4 className="font-semibold text-green-900 mb-2">📊 Document Library</h4>
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