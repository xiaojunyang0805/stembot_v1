'use client'

import { useState, useEffect } from 'react'
import { calculateUserStorageUsage, formatStorageSize, getStorageWarningMessage, getStorageCleanupSuggestions } from '../../lib/storage/monitoring'
import type { StorageUsage } from '../../lib/storage/monitoring'

interface StorageIndicatorProps {
  showDetails?: boolean
  className?: string
}

export default function StorageIndicator({ showDetails = false, className = '' }: StorageIndicatorProps) {
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCleanup, setShowCleanup] = useState(false)
  const [cleanupSuggestions, setCleanupSuggestions] = useState<any[]>([])

  useEffect(() => {
    loadStorageUsage()
  }, [])

  const loadStorageUsage = async () => {
    try {
      setLoading(true)
      const { data, error } = await calculateUserStorageUsage()

      if (error) {
        console.error('Error loading storage usage:', error)
      } else {
        setUsage(data)
      }
    } catch (error) {
      console.error('Error in loadStorageUsage:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCleanupSuggestions = async () => {
    try {
      const { suggestions, error } = await getStorageCleanupSuggestions()
      if (error) {
        console.error('Error loading cleanup suggestions:', error)
      } else {
        setCleanupSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error loading cleanup suggestions:', error)
    }
  }

  const handleShowCleanup = () => {
    setShowCleanup(!showCleanup)
    if (!showCleanup) {
      loadCleanupSuggestions()
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '16px', height: '16px', backgroundColor: '#e5e7eb', borderRadius: '50%' }}></div>
        <div style={{ width: '80px', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '0.25rem' }}></div>
      </div>
    )
  }

  if (!usage) {
    return null
  }

  const warningMessage = getStorageWarningMessage(usage)

  // Determine colors based on warning level
  const getStatusColors = () => {
    switch (usage.warningLevel) {
      case 'red':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#dc2626',
          progress: '#dc2626'
        }
      case 'orange':
        return {
          bg: '#fffbeb',
          border: '#fed7aa',
          text: '#ea580c',
          progress: '#ea580c'
        }
      case 'yellow':
        return {
          bg: '#fefce8',
          border: '#fde047',
          text: '#ca8a04',
          progress: '#ca8a04'
        }
      default:
        return {
          bg: '#f0f9ff',
          border: '#bae6fd',
          text: '#0369a1',
          progress: '#0369a1'
        }
    }
  }

  const colors = getStatusColors()

  // Compact indicator for headers/nav
  if (!showDetails) {
    return (
      <div
        className={`cursor-pointer ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.5rem',
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          color: colors.text
        }}
        onClick={handleShowCleanup}
        title={`Storage: ${formatStorageSize(usage.totalUsedMB)} / ${formatStorageSize(usage.limitMB)} (${usage.percentageUsed}%)`}
      >
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: colors.progress
        }} />
        <span style={{ fontWeight: '500' }}>
          {usage.percentageUsed}%
        </span>
      </div>
    )
  }

  // Detailed storage breakdown
  return (
    <div className={className} style={{ width: '100%' }}>
      {/* Warning message */}
      {warningMessage && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: colors.text
        }}>
          {warningMessage}
        </div>
      )}

      {/* Storage usage bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Storage Usage
          </span>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {formatStorageSize(usage.totalUsedMB)} / {formatStorageSize(usage.limitMB)}
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.25rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(usage.percentageUsed, 100)}%`,
            height: '100%',
            backgroundColor: colors.progress,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Storage breakdown */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
          Storage Breakdown
        </h4>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          {Object.entries(usage.breakdown).map(([key, value]) => (
            value > 0 && (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                <span>{formatStorageSize(value)}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Cleanup suggestions toggle */}
      {usage.warningLevel !== 'safe' && (
        <button
          onClick={handleShowCleanup}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            color: colors.text,
            cursor: 'pointer',
            marginBottom: showCleanup ? '1rem' : '0'
          }}
        >
          {showCleanup ? 'Hide' : 'Show'} Cleanup Suggestions
        </button>
      )}

      {/* Cleanup suggestions */}
      {showCleanup && cleanupSuggestions.length > 0 && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          fontSize: '0.75rem'
        }}>
          <h5 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            💡 Cleanup Suggestions
          </h5>
          {cleanupSuggestions.map((suggestion, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.5rem',
              paddingBottom: '0.5rem',
              borderBottom: index < cleanupSuggestions.length - 1 ? '1px solid #e5e7eb' : 'none'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#374151', fontWeight: '500' }}>
                  {suggestion.description}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                  Potential savings: {formatStorageSize(suggestion.potentialSavingMB)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}