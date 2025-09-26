/**
 * AI Infrastructure Test Page
 * Developer page for testing AI capabilities
 */

import { AIHealthCheck } from '../../../components/ai/AIHealthCheck';

export default function AITestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Infrastructure Test
          </h1>
          <p className="text-gray-600">
            Test and monitor the AI research mentoring capabilities. This page helps verify
            that Ollama is properly configured and the research mentoring system is operational.
          </p>
        </div>

        <AIHealthCheck />

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Development Notice</h3>
          <p className="text-sm text-yellow-700">
            This is a development page for testing AI infrastructure. It will be removed or
            restricted in production. Use this page to verify that your Ollama setup is
            working correctly before using the research mentoring features.
          </p>
        </div>
      </div>
    </div>
  );
}