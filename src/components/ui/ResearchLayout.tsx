/**
 * Research Layout Component
 *
 * Main workspace layout for research mentoring with academic styling.
 * Provides organized structure for research activities and memory integration.
 *
 * Features:
 * - Clean academic header with user controls
 * - Collapsible sidebar for research phases
 * - Flexible main content area
 * - Memory hints panel with context awareness
 * - Responsive design for academic workflows
 *
 * @location src/components/ui/ResearchLayout.tsx
 */

'use client';

import React, { useState, ReactNode } from 'react';
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  User,
  Brain,
  BookOpen,
  Target,
  PenTool,
  CheckCircle,
  BarChart3,
  HelpCircle,
  Lightbulb,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Database,
} from 'lucide-react';

/**
 * Research phase configuration
 */
export interface ResearchPhaseConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  isActive: boolean;
  isCompleted: boolean;
  href: string;
}

/**
 * Memory hint interface
 */
export interface MemoryHint {
  id: string;
  type: 'context' | 'suggestion' | 'reminder' | 'insight';
  title: string;
  content: string;
  confidence: number;
  timestamp: Date;
  actionable: boolean;
  action?: string;
}

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'researcher' | 'faculty';
  institution?: string;
}

/**
 * Props for the ResearchLayout component
 */
export interface ResearchLayoutProps {
  user: User;
  currentPhase?: string;
  phases: ResearchPhaseConfig[];
  memoryHints: MemoryHint[];
  children: ReactNode;
  showMemoryPanel?: boolean;
  onPhaseChange?: (phaseId: string) => void;
  onMemoryHintAction?: (hintId: string, action: string) => void;
  className?: string;
}

/**
 * ResearchLayout component for main workspace structure
 */
export const ResearchLayout: React.FC<ResearchLayoutProps> = ({
  user,
  currentPhase,
  phases,
  memoryHints,
  children,
  showMemoryPanel = true,
  onPhaseChange,
  onMemoryHintAction,
  className,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [memoryPanelCollapsed, setMemoryPanelCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeMemoryHints = memoryHints.filter(hint => hint.confidence > 0.6);
  const notifications = memoryHints.filter(hint => hint.type === 'reminder').length;

  return (
    <div className={`min-h-screen bg-academic-primary ${className}`}>
      {/* Header */}
      <header className="bg-white border-b border-academic-primary shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-academic-primary rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-academic-primary" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-academic-blue rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-serif font-bold text-xl text-academic-primary">
                    Research Mentor
                  </h1>
                  <p className="text-xs text-academic-muted">
                    AI-Powered Academic Research
                  </p>
                </div>
              </div>
            </div>

            {/* Center section - Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-academic-muted" />
                <input
                  type="text"
                  placeholder="Search research, literature, or ask AI..."
                  className="w-full pl-10 pr-4 py-2 border border-academic-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-blue focus:border-transparent"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {/* Memory Panel Toggle */}
              {showMemoryPanel && (
                <button
                  onClick={() => setMemoryPanelCollapsed(!memoryPanelCollapsed)}
                  className="p-2 hover:bg-academic-primary rounded-lg transition-colors relative"
                >
                  <Brain className="h-5 w-5 text-memory-purple" />
                  {activeMemoryHints.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-memory-purple text-white text-xs rounded-full flex items-center justify-center">
                      {activeMemoryHints.length}
                    </span>
                  )}
                </button>
              )}

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-academic-primary rounded-lg transition-colors relative"
              >
                <Bell className="h-5 w-5 text-academic-primary" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-semantic-error text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Settings */}
              <button className="p-2 hover:bg-academic-primary rounded-lg transition-colors">
                <Settings className="h-5 w-5 text-academic-primary" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-academic-primary rounded-lg transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-academic-blue rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-academic-primary">
                      {user.name}
                    </p>
                    <p className="text-xs text-academic-muted">
                      {user.role}
                    </p>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-academic-primary z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-academic-primary">
                        <p className="text-sm font-medium text-academic-primary">
                          {user.name}
                        </p>
                        <p className="text-xs text-academic-muted">
                          {user.email}
                        </p>
                      </div>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-academic-primary">
                        Profile Settings
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-academic-primary">
                        Research Preferences
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-academic-primary">
                        Help & Support
                      </button>
                      <div className="border-t border-academic-primary">
                        <button className="w-full px-4 py-2 text-left text-sm text-semantic-error hover:bg-academic-primary">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`bg-white border-r border-academic-primary transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4">
            {/* Navigation */}
            <nav className="space-y-2">
              {/* Quick Navigation */}
              <div className={`mb-6 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
                <h3 className="text-xs font-semibold text-academic-muted uppercase tracking-wide mb-2">
                  Quick Access
                </h3>
                <div className="space-y-1">
                  <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-academic-primary transition-colors">
                    <Home className="h-4 w-4 text-academic-primary" />
                    <span className="text-sm font-medium text-academic-primary">Dashboard</span>
                  </a>
                  <a href="/projects" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-academic-primary transition-colors">
                    <FileText className="h-4 w-4 text-academic-primary" />
                    <span className="text-sm font-medium text-academic-primary">Projects</span>
                  </a>
                  <a href="/library" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-academic-primary transition-colors">
                    <Database className="h-4 w-4 text-academic-primary" />
                    <span className="text-sm font-medium text-academic-primary">Library</span>
                  </a>
                </div>
              </div>

              {/* Research Phases */}
              <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
                <h3 className="text-xs font-semibold text-academic-muted uppercase tracking-wide mb-2">
                  Research Phases
                </h3>
              </div>

              <div className="space-y-1">
                {phases.map((phase) => {
                  const Icon = phase.icon;
                  const isActive = currentPhase === phase.id;

                  return (
                    <button
                      key={phase.id}
                      onClick={() => onPhaseChange?.(phase.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-academic-blue text-white'
                          : 'hover:bg-academic-primary text-academic-primary'
                      }`}
                      title={sidebarCollapsed ? phase.name : undefined}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : phase.color}`} />
                      {!sidebarCollapsed && (
                        <div className="flex-1 text-left">
                          <span className="text-sm font-medium">
                            {phase.name}
                          </span>
                          {phase.isCompleted && (
                            <CheckCircle className="h-3 w-3 ml-2 inline text-semantic-success" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Help Section */}
              {!sidebarCollapsed && (
                <div className="mt-8 pt-4 border-t border-academic-primary">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-academic-primary transition-colors">
                    <HelpCircle className="h-4 w-4 text-academic-primary" />
                    <span className="text-sm font-medium text-academic-primary">
                      Help & Tutorials
                    </span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          {/* Content Area */}
          <div className={`flex-1 transition-all duration-300 ${
            showMemoryPanel && !memoryPanelCollapsed ? 'mr-80' : ''
          }`}>
            <div className="p-6">
              {children}
            </div>
          </div>

          {/* Memory Hints Panel */}
          {showMemoryPanel && (
            <aside className={`bg-white border-l border-academic-primary transition-all duration-300 ${
              memoryPanelCollapsed ? 'w-0 overflow-hidden' : 'w-80'
            }`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-memory-purple" />
                    <h3 className="font-medium text-academic-primary">
                      Memory Context
                    </h3>
                  </div>
                  <button
                    onClick={() => setMemoryPanelCollapsed(true)}
                    className="p-1 hover:bg-academic-primary rounded"
                  >
                    <ChevronRight className="h-4 w-4 text-academic-muted" />
                  </button>
                </div>

                <div className="space-y-4">
                  {activeMemoryHints.map((hint) => (
                    <div
                      key={hint.id}
                      className="p-3 bg-memory-purple rounded-lg border border-memory-purple"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-memory-purple" />
                          <span className="text-sm font-medium text-memory-purple">
                            {hint.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${
                            hint.confidence > 0.8 ? 'bg-semantic-success' :
                            hint.confidence > 0.6 ? 'bg-semantic-warning' : 'bg-semantic-error'
                          }`} />
                          <span className="text-xs text-academic-muted">
                            {Math.round(hint.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-academic-primary mb-3">
                        {hint.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-academic-muted" />
                          <span className="text-xs text-academic-muted">
                            {hint.timestamp.toLocaleTimeString()}
                          </span>
                        </div>

                        {hint.actionable && hint.action && (
                          <button
                            onClick={() => onMemoryHintAction?.(hint.id, hint.action!)}
                            className="flex items-center gap-1 text-xs text-memory-purple hover:text-memory-purple font-medium"
                          >
                            <ArrowRight className="h-3 w-3" />
                            {hint.action}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {activeMemoryHints.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-academic-muted mx-auto mb-2" />
                      <p className="text-sm text-academic-muted">
                        No active memory hints
                      </p>
                      <p className="text-xs text-academic-muted mt-1">
                        Continue working to build context
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>

      {/* Collapsed Memory Panel Toggle */}
      {showMemoryPanel && memoryPanelCollapsed && (
        <button
          onClick={() => setMemoryPanelCollapsed(false)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 p-3 bg-memory-purple text-white rounded-l-lg shadow-lg hover:bg-memory-purple transition-colors z-40"
        >
          <div className="flex flex-col items-center gap-1">
            <Brain className="h-4 w-4" />
            <ChevronLeft className="h-3 w-3" />
            {activeMemoryHints.length > 0 && (
              <span className="text-xs">
                {activeMemoryHints.length}
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
};

export default ResearchLayout;