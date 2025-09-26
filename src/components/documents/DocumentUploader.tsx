/**
 * Document Uploader Component
 * Multi-format file upload with real-time processing status
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { ProcessingJob, DocumentUpload } from '../../lib/documents/types';

interface UploadedDocument {
  jobId: string;
  document: DocumentUpload;
  estimatedProcessingTime: string;
}

interface ProcessingStatus extends ProcessingJob {
  results?: {
    hasText: boolean;
    textLength: number;
    hasStructure: boolean;
    hasInsights: boolean;
    chunksCount: number;
    embeddingsStored: number;
    summary?: string;
    keyFindings?: string[];
    topics?: string[];
    wordCount?: number;
    readingTime?: number;
    complexity?: string;
    academicLevel?: string;
    tables?: Array<{
      caption: string;
      rows: number;
      columns: number;
    }>;
    sections?: Array<{
      title: string;
      type: string;
      level: number;
    }>;
  };
}

export function DocumentUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [processingStatus, setProcessingStatus] = useState<{ [jobId: string]: ProcessingStatus }>({});
  const [dragOver, setDragOver] = useState(false);

  // Processing options
  const [options, setOptions] = useState({
    extractText: true,
    analyzeStructure: true,
    generateInsights: true,
    storeEmbeddings: true
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const uploadDocument = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', 'test-project');
      formData.append('userId', 'test-user');
      formData.append('extractText', options.extractText.toString());
      formData.append('analyzeStructure', options.analyzeStructure.toString());
      formData.append('generateInsights', options.generateInsights.toString());
      formData.append('storeEmbeddings', options.storeEmbeddings.toString());

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        const uploadedDoc: UploadedDocument = {
          jobId: result.jobId,
          document: result.document,
          estimatedProcessingTime: result.estimatedProcessingTime
        };

        setUploadedDocs(prev => [uploadedDoc, ...prev]);
        setSelectedFile(null);

        // Start polling for status
        startStatusPolling(result.jobId);

      } else {
        alert(`Upload failed: ${result.error}`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const startStatusPolling = (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/documents/status?jobId=${jobId}`);
        const status = await response.json();

        if (response.ok) {
          setProcessingStatus(prev => ({
            ...prev,
            [jobId]: status
          }));

          // Stop polling when completed or failed
          if (status.status === 'completed' || status.status === 'error') {
            clearInterval(pollInterval);
          }
        }

      } catch (error) {
        console.error('Status polling error:', error);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'xlsx':
      case 'xls': return '📊';
      case 'csv': return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'tiff': return '🖼️';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Research Documents</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <Button
                onClick={() => setSelectedFile(null)}
                variant="outline"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-gray-500">
                  Supports PDF, Excel, CSV, and images (max 50MB)
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.tiff"
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button variant="outline" className="cursor-pointer">
                  Browse Files
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Processing Options */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Processing Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.extractText}
                onChange={(e) => setOptions(prev => ({ ...prev, extractText: e.target.checked }))}
              />
              <span className="text-sm">Extract Text Content</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.analyzeStructure}
                onChange={(e) => setOptions(prev => ({ ...prev, analyzeStructure: e.target.checked }))}
              />
              <span className="text-sm">Analyze Document Structure</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.generateInsights}
                onChange={(e) => setOptions(prev => ({ ...prev, generateInsights: e.target.checked }))}
              />
              <span className="text-sm">Generate AI Insights</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.storeEmbeddings}
                onChange={(e) => setOptions(prev => ({ ...prev, storeEmbeddings: e.target.checked }))}
              />
              <span className="text-sm">Store Vector Embeddings</span>
            </label>
          </div>
        </div>

        {/* Upload Button */}
        <div className="mt-6">
          <Button
            onClick={uploadDocument}
            disabled={!selectedFile || uploading}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            {uploading ? 'Uploading...' : 'Upload and Process Document'}
          </Button>
        </div>
      </Card>

      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Processing Status</h2>

          <div className="space-y-4">
            {uploadedDocs.map((doc) => {
              const status = processingStatus[doc.jobId];

              return (
                <div key={doc.jobId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getFileIcon(doc.document.originalName)}</span>
                      <div>
                        <h3 className="font-medium">{doc.document.originalName}</h3>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.document.size)} • {doc.document.documentType}
                        </p>
                      </div>
                    </div>

                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      status ? getStatusColor(status.status) : 'text-gray-600 bg-gray-100'
                    }`}>
                      {status?.status || 'Starting...'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {status && status.status === 'processing' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{status.stage}</span>
                        <span>{status.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {status?.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <p className="text-red-600 text-sm">{status.error}</p>
                    </div>
                  )}

                  {/* Results Summary */}
                  {status?.status === 'completed' && status.results && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <h4 className="font-medium text-green-800 mb-2">Processing Complete</h4>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Text Length:</span>
                          <p className="font-medium">{status.results.textLength.toLocaleString()} chars</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Chunks Created:</span>
                          <p className="font-medium">{status.results.chunksCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Word Count:</span>
                          <p className="font-medium">{status.results.wordCount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Embeddings:</span>
                          <p className="font-medium">{status.results.embeddingsStored}</p>
                        </div>
                      </div>

                      {status.results.summary && (
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">AI Summary:</span>
                          <p className="text-sm mt-1">{status.results.summary}</p>
                        </div>
                      )}

                      {status.results.keyFindings && status.results.keyFindings.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">Key Findings:</span>
                          <ul className="text-sm mt-1 list-disc list-inside">
                            {status.results.keyFindings.map((finding, index) => (
                              <li key={index}>{finding}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {status.results.tables && status.results.tables.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">Data Tables:</span>
                          <div className="text-sm mt-1">
                            {status.results.tables.map((table, index) => (
                              <div key={index} className="inline-block mr-4">
                                {table.caption}: {table.rows} rows × {table.columns} cols
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {status.results.topics && status.results.topics.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">Topics:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {status.results.topics.map((topic, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    Job ID: {doc.jobId} • Estimated time: {doc.estimatedProcessingTime}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Real Document Processing Features</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>PDF Documents:</strong> Text extraction, structure analysis, research paper detection, citation extraction</p>
          <p><strong>Excel/CSV Files:</strong> Statistical analysis, correlation detection, outlier identification, data insights</p>
          <p><strong>AI Analysis:</strong> Real Ollama/OpenAI integration for summaries, insights, and recommendations</p>
          <p><strong>Vector Storage:</strong> Automatic chunking and embedding storage in Pinecone for semantic search</p>
          <p><strong>Supported Formats:</strong> PDF, XLSX, XLS, CSV, JPG, PNG, TIFF (up to 50MB each)</p>
        </div>
      </Card>
    </div>
  );
}