/**
 * UsageDisplay Component
 * Shows current usage statistics and limits with progress bars
 */

'use client';

import { useState, useEffect } from 'react';

import { AlertTriangle, TrendingUp, Calendar, Zap } from 'lucide-react';

import type { UsageStats } from '../../types/billing';

interface UsageDisplayProps {
  className?: string;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

export function UsageDisplay({ className, showUpgradePrompt, onUpgrade }: UsageDisplayProps) {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/usage');
      const data = await response.json();

      if (response.ok) {
        setUsage(data.usage);
        setError(null);
      } else {
        setError(data.error || 'Failed to load usage data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) {
return '0 Bytes';
}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) {
return 0;
} // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) {
return 'bg-red-500';
}
    if (percentage >= 80) {
return 'bg-orange-500';
}
    if (percentage >= 60) {
return 'bg-yellow-500';
}
    return 'bg-green-500';
  };

  const getWarningLevel = (percentage: number) => {
    if (percentage >= 90) {
return 'critical';
}
    if (percentage >= 80) {
return 'warning';
}
    if (percentage >= 60) {
return 'caution';
}
    return 'good';
  };

  if (loading) {
    return (
      <div className={`rounded-lg border bg-white p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-1/3 rounded bg-gray-200"></div>
                <div className="h-2 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Error loading usage data: {error}</span>
        </div>
        <button
          onClick={fetchUsage}
          className="mt-3 text-sm text-red-600 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!usage) {
return null;
}

  const resources = [
    {
      name: 'AI Interactions',
      icon: <Zap className="h-5 w-5" />,
      used: usage.aiInteractions.used,
      limit: usage.aiInteractions.limit,
      unlimited: usage.aiInteractions.unlimited,
      unit: 'interactions',
    },
    {
      name: 'Projects',
      icon: <TrendingUp className="h-5 w-5" />,
      used: usage.projects.used,
      limit: usage.projects.limit,
      unlimited: usage.projects.unlimited,
      unit: 'projects',
    },
    {
      name: 'Storage',
      icon: <Calendar className="h-5 w-5" />,
      used: usage.storage.used,
      limit: usage.storage.limit,
      unlimited: usage.storage.unlimited,
      unit: 'bytes',
      formatter: formatBytes,
    },
    {
      name: 'Exports',
      icon: <TrendingUp className="h-5 w-5" />,
      used: usage.exports.used,
      limit: usage.exports.limit,
      unlimited: usage.exports.unlimited,
      unit: 'exports',
    },
  ];

  return (
    <div className={`rounded-lg border bg-white ${className}`}>
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Usage This Month</h3>
          <div className="text-sm text-gray-500">
            {usage.tier.charAt(0).toUpperCase() + usage.tier.slice(1)} Plan
          </div>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Period: {new Date(usage.periodStart).toLocaleDateString()} - {new Date(usage.periodEnd).toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-6 p-6">
        {resources.map((resource) => {
          const percentage = getUsagePercentage(resource.used, resource.limit);
          const warningLevel = getWarningLevel(percentage);

          return (
            <div key={resource.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {resource.icon}
                  <span className="font-medium">{resource.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {resource.formatter ? resource.formatter(resource.used) : resource.used}
                  {!resource.unlimited && (
                    <span>
                      {' / '}
                      {resource.formatter ? resource.formatter(resource.limit) : resource.limit}
                      {' '}
                      {resource.unit}
                    </span>
                  )}
                  {resource.unlimited && (
                    <span className="ml-1 text-blue-600">∞</span>
                  )}
                </div>
              </div>

              {!resource.unlimited && (
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              )}

              {!resource.unlimited && percentage >= 80 && (
                <div className={`flex items-center space-x-2 text-sm ${
                  warningLevel === 'critical' ? 'text-red-600' :
                  warningLevel === 'warning' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {percentage >= 90 ? 'Critical: ' : 'Warning: '}
                    {Math.round(percentage)}% used
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showUpgradePrompt && usage.tier === 'free' && (
        <div className="border-t bg-blue-50 p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Upgrade to Pro</h4>
              <p className="mt-1 text-sm text-blue-700">
                You're approaching your usage limits. Upgrade to Pro for unlimited access to all features.
              </p>
              <button
                onClick={onUpgrade}
                className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t bg-gray-50 p-4 text-center">
        <button
          onClick={fetchUsage}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Refresh Usage Data
        </button>
      </div>
    </div>
  );
}