/**
 * Context Recall Component
 * Displays relevant memories based on current context
 */

'use client'

import { useState, useEffect } from 'react'

import { Clock, FileText, Cog, MapPin, ChevronRight } from 'lucide-react'

import { Card } from '../ui/Card'
import { FactualMemory, ProceduralMemory, ContextualMemory } from '../../types/memory'

interface ContextRecallProps {
  projectId: string
  currentContext: string
  stage: string
  maxResults?: number
  className?: string
}

type Memory = FactualMemory | ProceduralMemory | ContextualMemory

export function ContextRecall({
  projectId,
  currentContext,
  stage,
  maxResults = 5,
  className = ''
}: ContextRecallProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [relevanceScores, setRelevanceScores] = useState<number[]>([])

  useEffect(() => {
    if (projectId && currentContext) {
      fetchRelevantMemories()
    }
  }, [projectId, currentContext, stage])

  const fetchRelevantMemories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/memory/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          query: currentContext,
          context: stage,
          maxResults
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMemories(data.memories)
        setRelevanceScores(data.relevanceScores)
      }
    } catch (error) {
      console.error('Failed to fetch relevant memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMemoryIcon = (memory: Memory) => {
    if ('reliability' in memory) {
return FileText
}
    if ('effectiveness' in memory) {
return Cog
}
    return MapPin
  }

  const getMemoryColor = (memory: Memory) => {
    if ('reliability' in memory) {
return 'text-blue-600 bg-blue-100'
}
    if ('effectiveness' in memory) {
return 'text-orange-600 bg-orange-100'
}
    return 'text-purple-600 bg-purple-100'
  }

  const getMemoryType = (memory: Memory) => {
    if ('reliability' in memory) {
return 'Factual'
}
    if ('effectiveness' in memory) {
return 'Procedural'
}
    return 'Contextual'
  }

  const formatMemoryContent = (memory: Memory) => {
    if ('reliability' in memory) {
      return {
        title: `${memory.content.split('.')[0]}.`,
        detail: memory.source,
        tags: memory.tags
      }
    }
    if ('effectiveness' in memory) {
      return {
        title: memory.procedure,
        detail: `${memory.steps.length} steps • ${memory.effectiveness}% effective`,
        tags: ['procedure']
      }
    }
    return {
      title: memory.context,
      detail: `${memory.relevantFacts.length} related facts`,
      tags: memory.associations.slice(0, 3)
    }
  }

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-3 h-4 rounded bg-gray-200"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (memories.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Clock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm">No relevant memories found for current context.</p>
          <p className="mt-1 text-xs">Memories will be built as you work on your research.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Relevant Context</h3>
        <span className="text-xs text-gray-500">
          {memories.length} memories recalled
        </span>
      </div>

      <div className="space-y-3">
        {memories.map((memory, index) => {
          const Icon = getMemoryIcon(memory)
          const colorClass = getMemoryColor(memory)
          const type = getMemoryType(memory)
          const content = formatMemoryContent(memory)
          const relevance = relevanceScores[index] || 0

          return (
            <div
              key={memory.id}
              className="group cursor-pointer rounded-lg border border-gray-200 p-3 transition-all hover:border-gray-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className={`rounded p-1.5 ${colorClass} flex-shrink-0`}>
                  <Icon className="h-3 w-3" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
                      {type}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-400"
                           style={{ opacity: relevance }}></div>
                      <span className="text-xs text-gray-500">
                        {Math.round(relevance * 100)}%
                      </span>
                    </div>
                  </div>

                  <p className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">
                    {content.title}
                  </p>

                  <p className="mb-2 text-xs text-gray-600">
                    {content.detail}
                  </p>

                  {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {content.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-3">
        <p className="text-center text-xs text-gray-500">
          Memories ranked by relevance to "{currentContext}"
        </p>
      </div>
    </Card>
  )
}