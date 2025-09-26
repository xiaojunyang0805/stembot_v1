'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../../providers/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        setAnalysisResult(result.analysis || 'Document processed successfully');
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Document Upload Section */}
          <div className="lg:col-span-2">
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
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Not Connected</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">New Research Project</div>
                  <div className="text-sm text-gray-500">Start a new research project</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Literature Review</div>
                  <div className="text-sm text-gray-500">Search and analyze papers</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">AI Chat</div>
                  <div className="text-sm text-gray-500">Ask research questions</div>
                </button>
              </div>
            </div>

            {/* Repository Info */}
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
              <h4 className="font-semibold text-amber-900 mb-2">ℹ️ Repository Info</h4>
              <p className="text-sm text-amber-800">
                This is the UI-only repository. For full AI functionality, you need the stembot-mvp-core repository with Ollama integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}