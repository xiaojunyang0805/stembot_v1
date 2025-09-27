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
    <div className={`bg-academic-primary min-h-screen ${className}`}>
      {/* Header */}
      <header className="border-academic-primary border-b bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hover:bg-academic-primary rounded-lg p-2 transition-colors"
              >
                <Menu className="text-academic-primary h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="bg-academic-blue rounded-lg p-2">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-academic-primary font-serif text-xl font-bold">
                    Research Mentor
                  </h1>
                  <p className="text-academic-muted text-xs">
                    AI-Powered Academic Research
                  </p>
                </div>
              </div>
            </div>

            {/* Center section - Search */}
            <div className="mx-8 max-w-lg flex-1">
              <div className="relative">
                <Search className="text-academic-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                <input
                  type="text"
                  placeholder="Search research, literature, or ask AI..."
                  className="border-academic-primary focus:ring-academic-blue w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {/* Memory Panel Toggle */}
              {showMemoryPanel && (
                <button
                  onClick={() => setMemoryPanelCollapsed(!memoryPanelCollapsed)}
                  className="hover:bg-academic-primary relative rounded-lg p-2 transition-colors"
                >
                  <Brain className="text-memory-purple h-5 w-5" />
                  {activeMemoryHints.length > 0 && (
                    <span className="bg-memory-purple absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                      {activeMemoryHints.length}
                    </span>
                  )}
                </button>
              )}

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="hover:bg-academic-primary relative rounded-lg p-2 transition-colors"
              >
                <Bell className="text-academic-primary h-5 w-5" />
                {notifications > 0 && (
                  <span className="bg-semantic-error absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Settings */}
              <button className="hover:bg-academic-primary rounded-lg p-2 transition-colors">
                <Settings className="text-academic-primary h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hover:bg-academic-primary flex items-center gap-2 rounded-lg p-2 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="bg-academic-blue flex h-8 w-8 items-center justify-center rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="hidden text-left sm:block">
                    <p className="text-academic-primary text-sm font-medium">
                      {user.name}
                    </p>
                    <p className="text-academic-muted text-xs">
                      {user.role}
                    </p>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="border-academic-primary absolute right-0 z-50 mt-2 w-48 rounded-lg border bg-white shadow-lg">
                    <div className="py-1">
                      <div className="border-academic-primary border-b px-4 py-2">
                        <p className="text-academic-primary text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="text-academic-muted text-xs">
                          {user.email}
                        </p>
                      </div>
                      <button className="hover:bg-academic-primary w-full px-4 py-2 text-left text-sm">
                        Profile Settings
                      </button>
                      <button className="hover:bg-academic-primary w-full px-4 py-2 text-left text-sm">
                        Research Preferences
                      </button>
                      <button className="hover:bg-academic-primary w-full px-4 py-2 text-left text-sm">
                        Help & Support
                      </button>
                      <div className="border-academic-primary border-t">
                        <button className="text-semantic-error hover:bg-academic-primary w-full px-4 py-2 text-left text-sm">
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
        <aside className={`border-academic-primary border-r bg-white transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4">
            {/* Navigation */}
            <nav className="space-y-2">
              {/* Quick Navigation */}
              <div className={`mb-6 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
                <h3 className="text-academic-muted mb-2 text-xs font-semibold uppercase tracking-wide">
                  Quick Access
                </h3>
                <div className="space-y-1">
                  <a href="/dashboard" className="hover:bg-academic-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-colors">
                    <Home className="text-academic-primary h-4 w-4" />
                    <span className="text-academic-primary text-sm font-medium">Dashboard</span>
                  </a>
                  <a href="/projects" className="hover:bg-academic-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-colors">
                    <FileText className="text-academic-primary h-4 w-4" />
                    <span className="text-academic-primary text-sm font-medium">Projects</span>
                  </a>
                  <a href="/library" className="hover:bg-academic-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-colors">
                    <Database className="text-academic-primary h-4 w-4" />
                    <span className="text-academic-primary text-sm font-medium">Library</span>
                  </a>
                </div>
              </div>

              {/* Research Phases */}
              <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
                <h3 className="text-academic-muted mb-2 text-xs font-semibold uppercase tracking-wide">
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
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
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
                            <CheckCircle className="text-semantic-success ml-2 inline h-3 w-3" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Help Section */}
              {!sidebarCollapsed && (
                <div className="border-academic-primary mt-8 border-t pt-4">
                  <button className="hover:bg-academic-primary flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors">
                    <HelpCircle className="text-academic-primary h-4 w-4" />
                    <span className="text-academic-primary text-sm font-medium">
                      Help & Tutorials
                    </span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1">
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
            <aside className={`border-academic-primary border-l bg-white transition-all duration-300 ${
              memoryPanelCollapsed ? 'w-0 overflow-hidden' : 'w-80'
            }`}>
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="text-memory-purple h-5 w-5" />
                    <h3 className="text-academic-primary font-medium">
                      Memory Context
                    </h3>
                  </div>
                  <button
                    onClick={() => setMemoryPanelCollapsed(true)}
                    className="hover:bg-academic-primary rounded p-1"
                  >
                    <ChevronRight className="text-academic-muted h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {activeMemoryHints.map((hint) => (
                    <div
                      key={hint.id}
                      className="bg-memory-purple border-memory-purple rounded-lg border p-3"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="text-memory-purple h-4 w-4" />
                          <span className="text-memory-purple text-sm font-medium">
                            {hint.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${
                            hint.confidence > 0.8 ? 'bg-semantic-success' :
                            hint.confidence > 0.6 ? 'bg-semantic-warning' : 'bg-semantic-error'
                          }`} />
                          <span className="text-academic-muted text-xs">
                            {Math.round(hint.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      <p className="text-academic-primary mb-3 text-sm">
                        {hint.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="text-academic-muted h-3 w-3" />
                          <span className="text-academic-muted text-xs">
                            {hint.timestamp.toLocaleTimeString()}
                          </span>
                        </div>

                        {hint.actionable && hint.action && (
                          <button
                            onClick={() => onMemoryHintAction?.(hint.id, hint.action!)}
                            className="text-memory-purple hover:text-memory-purple flex items-center gap-1 text-xs font-medium"
                          >
                            <ArrowRight className="h-3 w-3" />
                            {hint.action}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {activeMemoryHints.length === 0 && (
                    <div className="py-8 text-center">
                      <Brain className="text-academic-muted mx-auto mb-2 h-12 w-12" />
                      <p className="text-academic-muted text-sm">
                        No active memory hints
                      </p>
                      <p className="text-academic-muted mt-1 text-xs">
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
          className="bg-memory-purple hover:bg-memory-purple fixed right-4 top-1/2 z-40 -translate-y-1/2 transform rounded-l-lg p-3 text-white shadow-lg transition-colors"
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