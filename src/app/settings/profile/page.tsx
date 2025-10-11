'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { getUserProfile, updateUserProfile } from '../../../lib/database/users';
import ConfirmationModal from '../../../components/settings/ConfirmationModal';
import { createClientComponentClient } from '../../../lib/supabase';

// Disable Next.js caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const UNIVERSITIES = [
  'MIT', 'Stanford University', 'Harvard University', 'UC Berkeley', 'Caltech',
  'Princeton University', 'Yale University', 'Columbia University', 'University of Cambridge',
  'University of Oxford', 'ETH Zurich', 'Imperial College London', 'Other'
];

const ACADEMIC_LEVELS = [
  'Undergraduate', 'Graduate (Master\'s)', 'PhD Candidate', 'Postdoc', 'Researcher', 'Professor'
];

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [customInstitution, setCustomInstitution] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: userProfile, error } = await getUserProfile();

        if (error) {
          console.warn('Error loading profile:', error);
          // Set defaults
          setEmail(user.email || '');
          setDisplayName(user.email?.split('@')[0] || '');
        } else if (userProfile) {
          const profileData = userProfile.profile_data as any;
          setDisplayName(profileData?.name || user.email?.split('@')[0] || '');
          setEmail(userProfile.email);
          setInstitution(userProfile.university || '');
          setAcademicLevel(profileData?.academic_level || 'Undergraduate');
          setResearchInterests(userProfile.research_interests || []);
          setProfilePicture(profileData?.avatar_url || null);

          // Handle custom institution
          if (userProfile.university && !UNIVERSITIES.includes(userProfile.university)) {
            setInstitution('Other');
            setCustomInstitution(userProfile.university);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleAddInterest = () => {
    const trimmed = currentInterest.trim();
    if (trimmed && researchInterests.length < 5 && !researchInterests.includes(trimmed)) {
      setResearchInterests([...researchInterests, trimmed]);
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setResearchInterests(researchInterests.filter(i => i !== interest));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSaveError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Image must be less than 2MB');
      return;
    }

    setUploadingImage(true);
    setSaveError(null);

    try {
      const supabase = createClientComponentClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setProfilePicture(publicUrl);
      setSaveMessage('Profile picture uploaded! Remember to save changes.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setSaveError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!displayName.trim()) {
      setSaveError('Display name is required');
      return;
    }

    setIsLoading(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const finalInstitution = institution === 'Other' ? customInstitution.trim() : institution;

      const updateData = {
        university: finalInstitution || null,
        research_interests: researchInterests,
        profile_data: {
          name: displayName.trim(),
          avatar_url: profilePicture,
          academic_level: academicLevel
        }
      };

      const { error } = await updateUserProfile(updateData);

      if (error) {
        setSaveError('Failed to save profile. Please try again.');
        console.error('Error saving profile:', error);
      } else {
        setSaveMessage('Profile saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      setSaveError('An unexpected error occurred. Please try again.');
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      const supabase = createClientComponentClient();

      // Call Supabase admin API to delete user
      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        setSaveError('Failed to delete account. Please contact support.');
        console.error('Error deleting account:', error);
        setShowDeleteModal(false);
      } else {
        // Sign out and redirect to home
        await supabase.auth.signOut();
        router.push('/?deleted=true');
      }
    } catch (error) {
      setSaveError('An unexpected error occurred. Please contact support.');
      console.error('Error deleting account:', error);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '0.5rem'
      }}>
        👤 Profile Information
      </h2>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '2rem'
      }}>
        Manage your personal information and research profile.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Picture */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Profile Picture
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '50%',
              backgroundColor: profilePicture ? 'transparent' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid #e5e7eb'
            }}>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} />
              ) : (
                <span style={{
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  {displayName.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="profile-picture"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: uploadingImage ? '#9ca3af' : 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: uploadingImage ? 'not-allowed' : 'pointer'
                }}
              >
                {uploadingImage ? 'Uploading...' : 'Change Picture'}
              </label>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.5rem'
              }}>
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Display Name <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: '#f9fafb',
              color: '#6b7280'
            }}
          />
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginTop: '0.25rem'
          }}>
            Email cannot be changed. Contact support if you need to update your email.
          </p>
        </div>

        {/* Institution */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            University / Institution
          </label>
          <select
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select institution...</option>
            {UNIVERSITIES.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
          {institution === 'Other' && (
            <input
              type="text"
              value={customInstitution}
              onChange={(e) => setCustomInstitution(e.target.value)}
              placeholder="Enter your institution"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}
            />
          )}
        </div>

        {/* Academic Level */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Academic Level
          </label>
          <select
            value={academicLevel}
            onChange={(e) => setAcademicLevel(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          >
            {ACADEMIC_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Research Interests */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Research Interests (max 5)
          </label>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <input
              type="text"
              value={currentInterest}
              onChange={(e) => setCurrentInterest(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
              placeholder="Add research interest..."
              disabled={researchInterests.length >= 5}
              style={{
                flex: '1',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
            <button
              onClick={handleAddInterest}
              disabled={!currentInterest.trim() || researchInterests.length >= 5}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: (!currentInterest.trim() || researchInterests.length >= 5) ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: (!currentInterest.trim() || researchInterests.length >= 5) ? 'not-allowed' : 'pointer'
              }}
            >
              Add
            </button>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {researchInterests.map(interest => (
              <div
                key={interest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  color: '#1e40af'
                }}
              >
                {interest}
                <button
                  onClick={() => handleRemoveInterest(interest)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#1e40af',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Account Section */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '0.5rem'
          }}>
            Delete Account
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#991b1b',
            marginBottom: '1rem'
          }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
            }}
          >
            Delete My Account
          </button>
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

        {/* Save Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Saving...
              </>
            ) : (
              <>💾 Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This will permanently delete all your projects, data, and settings. This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
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
