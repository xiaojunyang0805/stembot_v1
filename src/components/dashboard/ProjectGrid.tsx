/**
 * Project Grid Component
 * Container for project cards with responsive grid layout
 */

'use client'

import { useState } from 'react'
import { Filter, Grid, List } from 'lucide-react'
import { Project } from '../../types/dashboard'
import ProjectCard from './ProjectCard'

interface ProjectGridProps {
  projects: Project[]
  onOpenProject: (projectId: string) => void
  onCreateProject: () => void
  title?: string
}

export default function ProjectGrid({
  projects,
  onOpenProject,
  onCreateProject,
  title = 'Your Research Projects'
}: ProjectGridProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'progress' | 'dueDate'>('updated')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (filter === 'active') return project.isActive
    if (filter === 'inactive') return !project.isActive
    return true
  })

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'progress':
        return b.progress - a.progress
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.getTime() - b.dueDate.getTime()
      default: // 'updated'
        return b.updatedAt.getTime() - a.updatedAt.getTime()
    }
  })

  return (
    <section style={{ marginBottom: '32px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>{title}</h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` (${filter})`}
          </p>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
            style={{
              padding: '6px 8px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374051',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Projects</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'progress' | 'dueDate')}
            style={{
              padding: '6px 8px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374051',
              cursor: 'pointer'
            }}
          >
            <option value="updated">Last Updated</option>
            <option value="created">Recently Created</option>
            <option value="progress">Progress</option>
            <option value="dueDate">Due Date</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '4px 8px',
                backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? '#1f2937' : '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px'
              }}
            >
              <Grid style={{ width: '14px', height: '14px' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '4px 8px',
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? '#1f2937' : '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px'
              }}
            >
              <List style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'grid'
          ? 'repeat(auto-fill, minmax(320px, 1fr))'
          : '1fr',
        gap: '20px',
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr'
        }
      } as React.CSSProperties}>

        {/* Create New Project Card */}
        <ProjectCard
          project={{} as Project}
          onOpenProject={() => {}}
          isCreateNew={true}
          onCreate={onCreateProject}
        />

        {/* Project Cards */}
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpenProject={onOpenProject}
          />
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Filter style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>No Projects Yet</h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0 0 20px 0',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Get started by creating your first research project. Our AI mentor will guide you through every step of the research process.
          </p>
          <button
            onClick={onCreateProject}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
          >
            Create Your First Project
          </button>
        </div>
      )}

      {/* Filtered Empty State */}
      {projects.length > 0 && filteredProjects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '32px 24px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>No projects match your filter</h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Try adjusting your filter criteria to see more projects.
          </p>
        </div>
      )}
    </section>
  )
}