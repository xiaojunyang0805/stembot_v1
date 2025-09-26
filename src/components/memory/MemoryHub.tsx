/**
 * Memory Hub Component
 * Central component for managing project memory and context
 */

'use client'

import { useState, useEffect } from 'react'

import { Brain, Clock, Lightbulb, Search, BookOpen } from 'lucide-react'

import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { MemoryContext, MemoryRecall } from '../../types/memory'

interface MemoryHubProps {
  projectId: string
  currentStage: string
  className?: string
}

export function MemoryHub({ projectId, currentStage, className = '' }: MemoryHubProps) {
  const [memoryContext, setMemoryContext] = useState<MemoryContext | null>(null)
  const [recentRecalls, setRecentRecalls] = useState<MemoryRecall[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMemoryContext()
    fetchRecentRecalls()
  }, [projectId])

  const fetchMemoryContext = async () => {
    try {
      // TODO: Implement API call to fetch memory context
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch memory context:', error)
      setLoading(false)
    }
  }

  const fetchRecentRecalls = async () => {
    try {
      // TODO: Implement API call to fetch recent memory recalls
    } catch (error) {
      console.error('Failed to fetch recent recalls:', error)
    }
  }

  const handleMemorySearch = async () => {
    if (!searchQuery.trim()) {
return
}

    try {
      // TODO: Implement memory search functionality
      const response = await fetch(`/api/memory/recall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          query: searchQuery,
          context: currentStage
        })
      })

      if (response.ok) {
        const recall = await response.json()
        setRecentRecalls(prev => [recall, ...prev.slice(0, 4)])
      }
    } catch (error) {
      console.error('Memory search failed:', error)
    }
  }

  const getMemoryStats = () => {
    if (!memoryContext) {
return { total: 0, factual: 0, procedural: 0, contextual: 0 }
}

    return {
      total: memoryContext.totalMemories,
      factual: memoryContext.factualMemory.length,
      procedural: memoryContext.proceduralMemory.length,
      contextual: memoryContext.contextualMemory.length
    }
  }

  const stats = getMemoryStats()

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-4 h-6 rounded bg-gray-200"></div>
          <div className="space-y-3">
            <div className="h-4 rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-100 p-2">
          <Brain className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Memory</h3>
          <p className="text-sm text-gray-600">
            AI-powered context and continuity across sessions
          </p>
        </div>
      </div>

      {/* Memory Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-700">Total Memories</div>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <div className="text-2xl font-bold text-green-600">{stats.factual}</div>
          <div className="text-sm text-green-700">Facts & Data</div>
        </div>
        <div className="rounded-lg bg-orange-50 p-3">
          <div className="text-2xl font-bold text-orange-600">{stats.procedural}</div>
          <div className="text-sm text-orange-700">Procedures</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-3">
          <div className="text-2xl font-bold text-purple-600">{stats.contextual}</div>
          <div className="text-sm text-purple-700">Context</div>
        </div>
      </div>

      {/* Memory Search */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Search Project Memory
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to remember about this project?"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && handleMemorySearch()}
          />
          <Button
            onClick={handleMemorySearch}
            disabled={!searchQuery.trim()}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Recent Recalls */}
      {recentRecalls.length > 0 && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4" />
            Recent Memory Recalls
          </h4>
          <div className="space-y-2">
            {recentRecalls.slice(0, 3).map((recall, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="mb-1 text-sm font-medium text-gray-900">
                  {recall.searchQuery}
                </div>
                <div className="text-xs text-gray-600">
                  Found {recall.totalFound} memories • Avg relevance {
                    Math.round(recall.relevanceScores.reduce((a, b) => a + b, 0) / recall.relevanceScores.length * 100)
                  }%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Insights */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Lightbulb className="h-4 w-4" />
          Memory Insights
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3 w-3" />
            Most active memory category: {
              stats.factual >= stats.procedural && stats.factual >= stats.contextual
                ? 'Factual Knowledge'
                : stats.procedural >= stats.contextual
                ? 'Procedures'
                : 'Context'
            }
          </div>
          <div className="text-xs text-gray-500">
            Memory system is learning your research patterns and will provide better context suggestions over time.
          </div>
        </div>
      </div>
    </Card>
  )
}