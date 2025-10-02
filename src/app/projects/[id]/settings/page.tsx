'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { getProject, updateProject, deleteProject } from '../../../../lib/database/projects';
import type { Project } from '../../../../types/database';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSubject, setProjectSubject] = useState('');
  const [projectDueDate, setProjectDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await getProject(params.id);

        if (error) {
          setError('Failed to load project');
        } else if (data) {
          setProject(data);
          setProjectTitle(data.title);
          setProjectSubject(data.subject || '');
          setProjectDueDate(data.due_date || '');
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user, params.id]);

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!project || !projectTitle.trim()) return;

    try {
      setSaving(true);

      const { error } = await updateProject(params.id, {
        title: projectTitle.trim(),
        subject: projectSubject.trim(),
        due_date: projectDueDate || null,
        updated_at: new Date().toISOString()
      });

      if (error) {
        alert('Failed to save changes. Please try again.');
      } else {
        alert('✅ Project settings saved successfully!');
        // Refresh project data
        const { data } = await getProject(params.id);
        if (data) setProject(data);
      }
    } catch (err) {
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!project || deleteConfirmText !== project.title) {
      alert('Project name does not match. Please type the exact project name to confirm deletion.');
      return;
    }

    try {
      setDeleting(true);

      const { error } = await deleteProject(params.id);

      if (error) {
        alert('Failed to delete project. Please try again.');
        setDeleting(false);
      } else {
        alert('🗑️ Project deleted successfully. Redirecting to dashboard...');
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      alert('Error deleting project. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading settings...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>
            {error || 'Project not found'}
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => router.push(`/projects/${params.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              color: '#374151',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            ← Back to Project
          </button>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>
            ⚙️ Project Settings
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '0 2rem'
      }}>

        {/* General Settings Section */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            📝 General Settings
          </h2>

          {/* Project Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Project Title *
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Enter project title..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Subject
            </label>
            <select
              value={projectSubject}
              onChange={(e) => setProjectSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select subject...</option>
              <option value="biology">Biology</option>
              <option value="chemistry">Chemistry</option>
              <option value="physics">Physics</option>
              <option value="psychology">Psychology</option>
              <option value="computer science">Computer Science</option>
              <option value="mathematics">Mathematics</option>
              <option value="environmental science">Environmental Science</option>
              <option value="engineering">Engineering</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={projectDueDate}
              onChange={(e) => setProjectDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveChanges}
            disabled={saving || !projectTitle.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: saving || !projectTitle.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: saving || !projectTitle.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : '✅ Save Changes'}
          </button>
        </div>

        {/* Danger Zone Section */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '0.5rem'
          }}>
            ⚠️ Danger Zone
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#7f1d1d',
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            Once you delete a project, there is no going back. This will permanently delete your project, all conversations, documents, sources, and analysis results.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete This Project
            </button>
          ) : (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              padding: '1rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#991b1b',
                marginBottom: '0.75rem'
              }}>
                ⚠️ Confirm Project Deletion
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#7f1d1d',
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                This action <strong>cannot be undone</strong>. To confirm, please type the exact project name below:
              </p>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#991b1b',
                marginBottom: '0.5rem',
                fontFamily: 'monospace',
                backgroundColor: '#fef2f2',
                padding: '0.5rem',
                borderRadius: '0.25rem'
              }}>
                {project.title}
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type project name to confirm..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #dc2626',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  marginBottom: '1rem'
                }}
              />
              <div style={{
                display: 'flex',
                gap: '0.75rem'
              }}>
                <button
                  onClick={handleDeleteProject}
                  disabled={deleting || deleteConfirmText !== project.title}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: deleting || deleteConfirmText !== project.title ? '#9ca3af' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: deleting || deleteConfirmText !== project.title ? 'not-allowed' : 'pointer'
                  }}
                >
                  {deleting ? 'Deleting...' : '🗑️ Permanently Delete Project'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={deleting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: deleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
