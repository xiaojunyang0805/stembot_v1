/**
 * Research Dashboard Page - Complete Design Implementation
 * Main dashboard with all components: Header, Memory Recall, Project Grid, Quick Actions
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '../../../providers/AuthProvider'

// Import our new components
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader'
import { MemoryRecallCard } from '../../../components/dashboard/MemoryRecallCard'
import ProjectCard from '../../../components/dashboard/ProjectCard'

interface Project {
  id: string
  title: string
  subject: string
  subjectEmoji: string
  currentPhase: 'question' | 'literature' | 'methodology' | 'writing' | 'export'
  progress: number
  dueDate?: Date
  nextSteps: string[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export default function ResearchDashboard() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [recentProject, setRecentProject] = useState<Project | null>(null)
  const { user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')

      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }

      const data = await response.json()

      // Transform Supabase projects to our UI format
      const transformedProjects: Project[] = (data.projects || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        subject: project.subject || 'Research',
        subjectEmoji: project.subject_emoji || '📚',
        currentPhase: project.current_phase || 'question',
        progress: Math.floor(Math.random() * 100), // TODO: Calculate actual progress
        dueDate: project.due_date ? new Date(project.due_date) : undefined,
        nextSteps: ['Continue research', 'Analyze data', 'Write findings'], // TODO: Get from AI
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        isActive: project.status === 'active',
      }))

      setProjects(transformedProjects)

      // Set the most recent project for memory recall
      if (transformedProjects.length > 0) {
        const mostRecent = transformedProjects.reduce((latest, current) =>
          current.updatedAt > latest.updatedAt ? current : latest
        )
        setRecentProject(mostRecent)
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }


  const handleOpenProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleCreateProject = () => {
    router.push('/projects/create')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid #e2e8f0',
            borderTopColor: '#2563eb',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>Loading your research dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ color: '#dc2626', fontSize: '16px', marginBottom: '12px' }}>
            Failed to load dashboard
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
          <button
            onClick={fetchProjects}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Global Header */}
      <DashboardHeader
        currentProject={recentProject?.title || "My Research"}
        userName={user?.email?.split('@')[0] || "Researcher"}
      />

      {/* Main Content Area */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>
            Welcome back, {user?.email?.split('@')[0] || "Researcher"}! 👋
          </div>
        </div>

        {/* Memory Recall Card - Only show if there are projects */}
        {recentProject && (
          <MemoryRecallCard
            lastSession={`You were working on "${recentProject.title}" in the ${recentProject.currentPhase} phase.`}
            nextStep={`Continue working on your ${recentProject.subject} research project`}
            projectId={recentProject.id}
          />
        )}

        {/* Projects Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
            Your Research Projects
          </div>

          {/* Projects Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth > 1024
              ? 'repeat(3, 1fr)'
              : typeof window !== 'undefined' && window.innerWidth > 768
                ? 'repeat(2, 1fr)'
                : '1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenProject={handleOpenProject}
              />
            ))}

            {/* Create New Card */}
            <ProjectCard
              project={{} as Project}
              onOpenProject={handleOpenProject}
              isCreateNew={true}
              onCreate={handleCreateProject}
            />
          </div>
        </div>

      </div>

      {/* Add keyframe animation for loading spinner */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}