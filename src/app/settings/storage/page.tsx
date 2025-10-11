'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { calculateUserStorageUsage, formatStorageSize, type StorageUsage } from '../../../lib/storage/monitoring';
import { createClientComponentClient } from '../../../lib/supabase';
import ConfirmationModal from '../../../components/settings/ConfirmationModal';

// Disable Next.js caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface ProjectStorage {
  id: string;
  title: string;
  storage_mb: number;
  created_at: string;
}

export default function StorageSettingsPage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [projectsStorage, setProjectsStorage] = useState<ProjectStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load storage data
  useEffect(() => {
    const loadStorageData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Load overall storage usage
        const { data: usageData, error: usageError } = await calculateUserStorageUsage();
        if (usageError) {
          console.error('Error loading storage usage:', usageError);
        } else {
          setUsage(usageData);
        }

        // Load per-project storage breakdown
        const supabase = createClientComponentClient();
        const { data: projects, error: projectsError } = await supabase
          .from('research_projects')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Error loading projects:', projectsError);
        } else if (projects) {
          // Calculate storage per project
          const projectsWithStorage = await Promise.all(
            projects.map(async (project: any) => {
              // Count documents
              const { data: docs } = await supabase
                .from('project_documents')
                .select('file_size')
                .eq('project_id', project.id);

              const docsSize = docs?.reduce((sum: number, doc: any) => sum + (doc.file_size || 0), 0) || 0;

              // Estimate metadata size (rough estimate: 10KB per project)
              const metadataSize = 10 * 1024; // 10KB in bytes

              const totalBytes = docsSize + metadataSize;
              const totalMB = totalBytes / (1024 * 1024);

              return {
                id: project.id,
                title: project.title,
                storage_mb: totalMB,
                created_at: project.created_at
              };
            })
          );

          setProjectsStorage(projectsWithStorage);
        }
      } catch (error) {
        console.error('Error loading storage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, [user]);

  const toggleProjectExpand = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleExportAllData = async () => {
    if (!user) return;

    setIsExporting(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const supabase = createClientComponentClient();

      // Fetch all user data
      const { data: projects, error: projectsError } = await supabase
        .from('research_projects')
        .select('*')
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      const { data: documents, error: docsError } = await supabase
        .from('project_documents')
        .select('*')
        .in('project_id', projects?.map((p: any) => p.id) || []);

      if (docsError) throw docsError;

      const { data: conversations, error: convsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id);

      if (convsError) throw convsError;

      // Create export object
      const exportData = {
        export_date: new Date().toISOString(),
        user_id: user.id,
        projects,
        documents,
        conversations
      };

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stembot-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveMessage('Data exported successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveError('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearOldData = async () => {
    if (!user) return;

    setIsClearing(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const supabase = createClientComponentClient();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Find old projects
      const { data: oldProjects, error: fetchError } = await supabase
        .from('research_projects')
        .select('id')
        .eq('user_id', user.id)
        .lt('created_at', sixMonthsAgo.toISOString());

      if (fetchError) throw fetchError;

      if (!oldProjects || oldProjects.length === 0) {
        setSaveMessage('No old data to clear. All projects are recent.');
        setShowClearModal(false);
        setIsClearing(false);
        return;
      }

      // Delete old projects (cascade will delete related data)
      const { error: deleteError } = await supabase
        .from('research_projects')
        .delete()
        .in('id', oldProjects.map((p: any) => p.id));

      if (deleteError) throw deleteError;

      setSaveMessage(`Successfully deleted ${oldProjects.length} project(s) older than 6 months.`);
      setShowClearModal(false);

      // Reload storage data
      window.location.reload();
    } catch (error) {
      console.error('Error clearing old data:', error);
      setSaveError('Failed to clear old data. Please try again.');
      setShowClearModal(false);
    } finally {
      setIsClearing(false);
    }
  };

  const getStorageTier = () => {
    if (!usage) return 'Free';
    if (usage.limitMB >= 5000) return 'Researcher';
    if (usage.limitMB >= 1000) return 'Student Pro';
    return 'Free';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{
          marginTop: '1rem',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          Loading storage data...
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '0.5rem'
      }}>
        💾 Storage & Usage
      </h2>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        Monitor your storage usage and manage your research data.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Storage Overview */}
        {usage && (
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Storage Overview
            </h3>

            {/* Storage Progress Bar */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {formatStorageSize(usage.totalUsedMB)} used of {formatStorageSize(usage.limitMB)}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: usage.percentageUsed > 80 ? '#dc2626' : '#2563eb'
                }}>
                  {usage.percentageUsed}%
                </span>
              </div>

              <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(usage.percentageUsed, 100)}%`,
                  height: '100%',
                  backgroundColor: usage.percentageUsed > 80 ? '#dc2626' : '#2563eb',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              <div style={{
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Documents
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {formatStorageSize(usage.breakdown.attachments || 0)}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Projects Data
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {formatStorageSize(usage.breakdown.projects || 0)}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Storage Tier
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {getStorageTier()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Storage by Project */}
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            Storage by Project
          </h3>

          {projectsStorage.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              No projects yet. Create your first research project to get started!
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {projectsStorage.map((project) => (
                <div
                  key={project.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                >
                  <div
                    onClick={() => toggleProjectExpand(project.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ flex: '1' }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '0.25rem'
                      }}>
                        {project.title}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#2563eb'
                      }}>
                        {formatStorageSize(project.storage_mb)}
                      </span>
                      <span style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        transform: expandedProjects.has(project.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {expandedProjects.has(project.id) && (
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e5e7eb',
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      Detailed breakdown will show document count and metadata size.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Management Actions */}
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            Data Management
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button
              onClick={handleExportAllData}
              disabled={isExporting}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: isExporting ? '#9ca3af' : 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExporting) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                }
              }}
            >
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  📥 Download All Data
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Export all your projects and data as JSON
                </div>
              </div>
              {isExporting && (
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </button>

            <button
              onClick={() => setShowClearModal(true)}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2';
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                🗑️ Clear Old Data
              </div>
              <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>
                Delete projects older than 6 months (with confirmation)
              </div>
            </button>
          </div>
        </div>

        {/* Storage Tiers Info */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.5rem'
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '0.75rem'
          }}>
            Storage Limits by Tier
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#1e40af'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Free</div>
              <div>100 MB</div>
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Student Pro</div>
              <div>1 GB</div>
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Researcher</div>
              <div>5 GB</div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(saveMessage || saveError) && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: saveMessage ? '#d1fae5' : '#fee2e2',
            color: saveMessage ? '#065f46' : '#991b1b',
            border: `1px solid ${saveMessage ? '#a7f3d0' : '#fecaca'}`
          }}>
            {saveMessage ? '✅ ' + saveMessage : '❌ ' + saveError}
          </div>
        )}
      </div>

      {/* Clear Data Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        title="Clear Old Data"
        message="This will permanently delete all projects created more than 6 months ago, along with their associated documents and data. This action cannot be undone. Are you sure you want to continue?"
        confirmText="Delete Old Projects"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        onConfirm={handleClearOldData}
        onCancel={() => setShowClearModal(false)}
        isLoading={isClearing}
      />

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
