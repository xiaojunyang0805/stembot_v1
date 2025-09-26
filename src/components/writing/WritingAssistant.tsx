/**
 * Writing Assistant Component
 *
 * AI-powered academic writing assistant with real-time suggestions and feedback.
 * Provides structure guidance, style improvement, and citation management.
 *
 * Features:
 * - Real-time writing assistance and suggestions
 * - Academic structure and organization guidance
 * - Citation formatting and management
 * - Writing analytics and progress tracking
 * - Collaborative editing and peer review
 *
 * @location src/components/writing/WritingAssistant.tsx
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Brain,
  FileText,
  Quote,
  BarChart3,
  Users,
  Save,
  Download,
  Settings,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { WritingProject, WritingSuggestion, WritingAnalytics } from '../../types/writing';

/**
 * Props for the WritingAssistant component
 */
export interface WritingAssistantProps {
  projectId: string;
  writingProject?: WritingProject;
  onSave?: (content: string) => void;
  onExport?: (format: string) => void;
  className?: string;
}

/**
 * WritingAssistant component for academic writing support
 */
export const WritingAssistant: React.FC<WritingAssistantProps> = ({
  projectId,
  writingProject,
  onSave,
  onExport,
  className,
}) => {
  const [content, setContent] = useState(writingProject?.content || '');
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<WritingAnalytics | null>(null);
  const [activeSection, setActiveSection] = useState('introduction');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate analytics
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    setAnalytics({
      id: 'analytics-1',
      projectId: writingProject?.id ?? 'unknown',
      totalWords: wordCount,
      totalSessions: 3,
      averageWordsPerSession: 150,
      writingVelocity: 50, // words per hour
      productiveHours: ['09:00', '14:00', '19:00'],
      dailyProgress: [],
      readabilityScore: 7.2,
      grammarScore: 8.5,
      styleConsistency: 7.8,
      citationAccuracy: 9.0,
      overallQuality: 8.1,
      trends: [],
      generatedAt: new Date(),
      // Optional compatibility properties
      wordCount,
      citationCount: (content.match(/\[\d+\]/g) || []).length,
      completionPercentage: Math.min((content.length / 5000) * 100, 100),
      timeSpent: 45,
      sessionsCount: 3,
      targetWordCount: 5000,
    });

    // Simulate suggestions
    if (content.length > 100) {
      setSuggestions([
        {
          id: '1',
          type: 'style',
          severity: 'warning',
          message: 'Consider using more active voice in this paragraph',
          suggestion: 'Replace passive constructions with active ones',
          location: { start: 50, end: 100 },
          confidence: 0.8,
          category: 'style',
        },
        {
          id: '2',
          type: 'citation',
          severity: 'error',
          message: 'This claim needs a citation',
          suggestion: 'Add a reference to support this statement',
          location: { start: 200, end: 250 },
          confidence: 0.95,
          category: 'citation',
        },
      ]);
    }
  }, [content]);

  const sections = [
    { key: 'title', label: 'Title & Abstract', icon: FileText },
    { key: 'introduction', label: 'Introduction', icon: Target },
    { key: 'literature', label: 'Literature Review', icon: Quote },
    { key: 'methodology', label: 'Methodology', icon: Settings },
    { key: 'results', label: 'Results', icon: BarChart3 },
    { key: 'discussion', label: 'Discussion', icon: Brain },
    { key: 'conclusion', label: 'Conclusion', icon: CheckCircle },
    { key: 'references', label: 'References', icon: Quote },
  ];

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (autoSave) {
      // Debounced auto-save
      setTimeout(() => onSave?.(newContent), 1000);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            Academic Writing Assistant
          </h2>
          <p className="text-gray-600">
            AI-powered writing support for your research paper
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button variant="outline" onClick={() => onExport?.('pdf')}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button onClick={() => onSave?.(content)}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Writing Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{analytics.wordCount}</div>
            <div className="text-sm text-gray-600">Words</div>
            <ProgressBar
              value={analytics.wordCount}
              max={analytics.targetWordCount}
              size="sm"
              className="mt-2"
            />
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{analytics.readabilityScore}</div>
            <div className="text-sm text-gray-600">Readability</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">{analytics.citationCount}</div>
            <div className="text-sm text-gray-600">Citations</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{analytics.completionPercentage?.toFixed(0) ?? 0}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Document Structure</h3>
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      activeSection === section.key
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">AI Suggestions</h4>
                <div className="space-y-2">
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`p-2 rounded-lg border text-xs ${
                        suggestion.severity === 'error'
                          ? 'border-red-200 bg-red-50 text-red-800'
                          : suggestion.severity === 'warning'
                          ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                          : 'border-blue-200 bg-blue-50 text-blue-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {suggestion.severity === 'error' ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <Lightbulb className="h-3 w-3" />
                        )}
                        <span className="font-medium capitalize">{suggestion.type}</span>
                      </div>
                      <p>{suggestion.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">
                {activeSection.replace('-', ' ')}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant={autoSave ? 'success' : 'secondary'}>
                  {autoSave ? 'Auto-save on' : 'Auto-save off'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoSave(!autoSave)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={`Start writing your ${activeSection}...`}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{content.split(' ').filter(w => w.length > 0).length} words</span>
                <span>{content.length} characters</span>
                <span>Last saved: {new Date().toLocaleTimeString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnalyzing(true)}
                  disabled={isAnalyzing}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  {isAnalyzing ? 'Analyzing...' : 'AI Feedback'}
                </Button>
                <Button variant="outline" size="sm">
                  <Quote className="h-4 w-4 mr-1" />
                  Add Citation
                </Button>
              </div>
            </div>
          </Card>

          {/* Writing Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className="p-4 text-center">
              <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">AI Writing Coach</h4>
              <p className="text-sm text-gray-600">Get real-time writing suggestions</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Zap className="h-3 w-3 mr-1" />
                Activate
              </Button>
            </Card>

            <Card className="p-4 text-center">
              <Quote className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Citation Manager</h4>
              <p className="text-sm text-gray-600">Manage and format citations</p>
              <Button variant="outline" size="sm" className="mt-2">
                <FileText className="h-3 w-3 mr-1" />
                Open
              </Button>
            </Card>

            <Card className="p-4 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Collaboration</h4>
              <p className="text-sm text-gray-600">Share and get feedback</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Users className="h-3 w-3 mr-1" />
                Share
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TODO: Implementation checklist
 *
 * 1. Advanced Editor Features:
 *    - Rich text editing with formatting
 *    - Real-time collaborative editing
 *    - Version control and change tracking
 *    - Inline comments and suggestions
 *
 * 2. AI Writing Assistant:
 *    - Grammar and style checking
 *    - Clarity and readability analysis
 *    - Plagiarism detection
 *    - Structure and flow optimization
 *
 * 3. Citation Management:
 *    - Automatic citation formatting
 *    - Reference library integration
 *    - In-text citation insertion
 *    - Bibliography generation
 *
 * 4. Analytics and Insights:
 *    - Writing progress tracking
 *    - Productivity analytics
 *    - Quality metrics and scoring
 *    - Goal setting and achievement
 *
 * 5. Export and Publishing:
 *    - Multiple format support (PDF, DOCX, LaTeX)
 *    - Journal template formatting
 *    - Submission ready exports
 *    - Presentation slide generation
 */