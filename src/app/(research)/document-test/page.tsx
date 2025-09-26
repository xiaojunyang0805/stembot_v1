/**
 * Document Processing Test Page
 * Test real document processing with AI analysis
 */

import { DocumentUploader } from '../../../components/documents/DocumentUploader';

export default function DocumentTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Processing System Test
          </h1>
          <p className="text-gray-600">
            Test the real document processing pipeline with multi-format support,
            AI analysis using Ollama, statistical insights, and vector storage in Pinecone.
            Upload research documents to see the full processing workflow.
          </p>
        </div>

        <DocumentUploader />

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🧪 Testing Instructions</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• <strong>PDF files:</strong> Upload academic papers to test structure detection and AI insights</p>
            <p>• <strong>Excel/CSV:</strong> Upload data files to test statistical analysis and outlier detection</p>
            <p>• <strong>Processing time:</strong> Depends on file size and AI analysis complexity</p>
            <p>• <strong>Vector storage:</strong> Enable embeddings to test Pinecone integration</p>
            <p>• <strong>Real AI:</strong> Uses actual Ollama models for analysis (not mocked)</p>
          </div>
        </div>
      </div>
    </div>
  );
}