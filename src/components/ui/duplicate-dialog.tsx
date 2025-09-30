'use client'

import React, { useState } from 'react'

export interface DuplicateMatch {
  id: string;
  filename: string;
  originalName: string;
  similarity: number;
  matchType: 'exact' | 'similar_name' | 'similar_content' | 'version';
  uploadDate: string;
  fileSize: number;
}

export interface DuplicateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: DuplicateChoice) => void;
  newFileName: string;
  matches: DuplicateMatch[];
  confidence: number;
  recommendation: 'overwrite' | 'keep_both' | 'merge' | 'skip';
}

export interface DuplicateChoice {
  action: 'overwrite' | 'keep_both' | 'rename' | 'cancel';
  newName?: string;
  replaceDocumentId?: string;
}

export function DuplicateDialog({
  isOpen,
  onClose,
  onChoice,
  newFileName,
  matches,
  confidence,
  recommendation
}: DuplicateDialogProps) {
  const [selectedAction, setSelectedAction] = useState<string>(recommendation);
  const [customName, setCustomName] = useState<string>('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(matches[0]?.id || '');

  if (!isOpen) return null;

  console.log('🔘 DIALOG: Dialog is open with matches:', matches.length);
  console.log('🔘 DIALOG: Initial selected action:', selectedAction);
  console.log('🔘 DIALOG: Initial selected document ID:', selectedDocumentId);

  const topMatch = matches[0];

  const handleConfirm = () => {
    console.log('🔘 DIALOG: Confirm button clicked');
    console.log('🔘 DIALOG: Selected action:', selectedAction);
    console.log('🔘 DIALOG: Selected document ID:', selectedDocumentId);

    let choice: DuplicateChoice;

    switch (selectedAction) {
      case 'overwrite':
        choice = {
          action: 'overwrite',
          replaceDocumentId: selectedDocumentId
        };
        break;
      case 'rename':
        choice = {
          action: 'rename',
          newName: customName || `${newFileName}_new`
        };
        break;
      case 'keep_both':
        choice = {
          action: 'keep_both'
        };
        break;
      default:
        choice = { action: 'cancel' };
    }

    console.log('🔘 DIALOG: Calling onChoice with:', choice);
    onChoice(choice);
    console.log('🔘 DIALOG: onChoice called successfully');
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity > 85) return '#ef4444'; // red
    if (similarity > 70) return '#f59e0b'; // amber
    return '#10b981'; // green
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'exact': return '🎯';
      case 'version': return '📝';
      case 'similar_content': return '📄';
      case 'similar_name': return '📋';
      default: return '📄';
    }
  };

  const getMatchTypeDescription = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'Exact match (same file)';
      case 'version': return 'Different version';
      case 'similar_content': return 'Similar content';
      case 'similar_name': return 'Similar filename';
      default: return 'Similar document';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            🔍 Duplicate Document Detected
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            We found {matches.length} similar document{matches.length > 1 ? 's' : ''} in your project
          </p>
        </div>

        {/* New File Info */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            📤 New File
          </h3>
          <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>{newFileName}</p>
        </div>

        {/* Existing Files */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
            📂 Similar Files Found
          </h3>

          {matches.slice(0, 3).map((match, index) => (
            <div key={match.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '0.5rem',
              backgroundColor: index === 0 ? '#f0f9ff' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span>{getMatchTypeIcon(match.matchType)}</span>
                    <span style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      {match.originalName}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    {getMatchTypeDescription(match.matchType)}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Uploaded: {new Date(match.uploadDate).toLocaleDateString()} •
                    Size: {(match.fileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <div style={{
                  backgroundColor: getSimilarityColor(match.similarity),
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {match.similarity}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
            🤔 What would you like to do?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Keep Both */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem',
              border: '2px solid',
              borderColor: selectedAction === 'keep_both' ? '#3b82f6' : '#e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: selectedAction === 'keep_both' ? '#eff6ff' : 'white'
            }}>
              <input
                type="radio"
                name="action"
                value="keep_both"
                checked={selectedAction === 'keep_both'}
                onChange={(e) => setSelectedAction(e.target.value)}
                style={{ marginTop: '0.125rem' }}
              />
              <div>
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  📚 Keep Both Files
                  {recommendation === 'keep_both' && <span style={{ color: '#059669', fontSize: '0.75rem', marginLeft: '0.5rem' }}>✨ Recommended</span>}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Upload the new file alongside the existing one. Good for different versions or related documents.
                </div>
              </div>
            </label>

            {/* Overwrite */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem',
              border: '2px solid',
              borderColor: selectedAction === 'overwrite' ? '#3b82f6' : '#e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: selectedAction === 'overwrite' ? '#eff6ff' : 'white'
            }}>
              <input
                type="radio"
                name="action"
                value="overwrite"
                checked={selectedAction === 'overwrite'}
                onChange={(e) => {
                  console.log('🔘 DIALOG: Overwrite action selected');
                  setSelectedAction(e.target.value);
                }}
                style={{ marginTop: '0.125rem' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  🔄 Replace Existing File
                  {recommendation === 'overwrite' && <span style={{ color: '#059669', fontSize: '0.75rem', marginLeft: '0.5rem' }}>✨ Recommended</span>}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Replace the existing file with the new one. Use this for updated versions of the same document.
                </div>
                {selectedAction === 'overwrite' && matches.length > 1 && (
                  <select
                    value={selectedDocumentId}
                    onChange={(e) => setSelectedDocumentId(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      width: '100%'
                    }}
                  >
                    {matches.map(match => (
                      <option key={match.id} value={match.id}>
                        Replace: {match.originalName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>

            {/* Rename */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem',
              border: '2px solid',
              borderColor: selectedAction === 'rename' ? '#3b82f6' : '#e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: selectedAction === 'rename' ? '#eff6ff' : 'white'
            }}>
              <input
                type="radio"
                name="action"
                value="rename"
                checked={selectedAction === 'rename'}
                onChange={(e) => setSelectedAction(e.target.value)}
                style={{ marginTop: '0.125rem' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  ✏️ Rename and Keep
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Give the new file a different name to avoid confusion.
                </div>
                {selectedAction === 'rename' && (
                  <input
                    type="text"
                    placeholder={`${newFileName.replace(/\.[^/.]+$/, '')}_v2`}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      width: '100%'
                    }}
                  />
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onChoice({ action: 'cancel' })}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedAction === 'rename' && !customName.trim()}
            style={{
              padding: '0.5rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              opacity: selectedAction === 'rename' && !customName.trim() ? 0.5 : 1
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}