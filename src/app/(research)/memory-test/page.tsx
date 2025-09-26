/**
 * Vector Memory Test Page
 * Test and monitor vector memory system
 */

import { MemoryHealthCheck } from '../../../components/memory/MemoryHealthCheck';

export default function MemoryTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vector Memory System Test
          </h1>
          <p className="text-gray-600">
            Test and monitor the Pinecone vector database integration for document storage
            and semantic search. This page verifies that embeddings and vector operations
            are working correctly.
          </p>
        </div>

        <MemoryHealthCheck />

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Development Notice</h3>
          <p className="text-sm text-yellow-700">
            This is a development page for testing vector memory infrastructure. It will be
            removed or restricted in production. Use this page to verify that your Pinecone
            setup is working correctly before using document processing features.
          </p>
        </div>
      </div>
    </div>
  );
}