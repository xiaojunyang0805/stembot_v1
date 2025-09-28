'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Calendar, CreditCard, Users, Zap } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

interface Subscription {
  id: string
  status: string
  tier: string
  planId: string
  current_period_start: number
  current_period_end: number
  trial_end?: number
  cancel_at_period_end: boolean
  customer: {
    id: string
    email: string
  }
  plan: {
    id: string
    name: string
    price: number
    currency: string
    interval: string
    features: Record<string, any>
  }
  usage: {
    projects: number
    aiInteractions: number
    monthlyAiInteractions: number
  }
  mock?: boolean
}

interface Usage {
  userId: string
  period: {
    start: string
    end: string
  }
  projects: {
    count: number
    limit: number
    percentage: number
  }
  aiInteractions: {
    count: number
    limit: number
    percentage: number
    remaining: number
  }
  memory: {
    used: number
    limit: number
    percentage: number
  }
  exports: {
    count: number
    limit: number
    percentage: number
  }
  currentPlan: {
    name: string
    price: number
    currency: string
  }
  warnings: Array<{
    type: string
    message: string
    severity: string
  }>
  mock?: boolean
}

export function SubscriptionPortal() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
      fetchUsageData()
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/billing/subscription')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription')
      }

      setSubscription(data.subscription)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/billing/usage')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage')
      }

      setUsage(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionAction = async (action: string, planId?: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, planId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription')
      }

      // Refresh data after successful action
      await fetchSubscriptionData()
      await fetchUsageData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'trialing':
        return 'secondary'
      case 'past_due':
        return 'destructive'
      case 'cancelled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading subscription data: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Subscription</span>
            {subscription?.mock && (
              <Badge variant="outline" className="text-xs">
                Demo Mode
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage your StemBot subscription and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                  <p className="text-sm text-gray-600">
                    {subscription.plan.price > 0 ? (
                      <>€{subscription.plan.price}/{subscription.plan.interval}</>
                    ) : (
                      'Free Plan'
                    )}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(subscription.status)}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Current period: {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span>{subscription.customer.email}</span>
                </div>
              </div>

              {subscription.trial_end && subscription.trial_end > Date.now() / 1000 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    🎉 You're currently in your free trial period until {formatDate(subscription.trial_end)}
                  </p>
                </div>
              )}

              {subscription.cancel_at_period_end && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Your subscription will cancel at the end of the current period ({formatDate(subscription.current_period_end)})
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => handleSubscriptionAction('reactivate')}
                  >
                    Reactivate Subscription
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600">No active subscription found.</p>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Your current usage for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Projects */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Projects</span>
                <span className="text-sm text-gray-600">
                  {usage.projects.count} / {usage.projects.limit === -1 ? '∞' : usage.projects.limit}
                </span>
              </div>
              <Progress value={usage.projects.percentage} className="h-2" />
            </div>

            {/* AI Interactions */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span>AI Interactions</span>
                </span>
                <span className="text-sm text-gray-600">
                  {usage.aiInteractions.count} / {usage.aiInteractions.limit === -1 ? '∞' : usage.aiInteractions.limit}
                </span>
              </div>
              <Progress value={usage.aiInteractions.percentage} className="h-2" />
              {usage.aiInteractions.remaining > 0 && usage.aiInteractions.remaining <= 10 && (
                <p className="text-xs text-yellow-600">
                  Only {usage.aiInteractions.remaining} interactions remaining this month
                </p>
              )}
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Memory Storage</span>
                <span className="text-sm text-gray-600">
                  {usage.memory.used.toFixed(1)} MB / {usage.memory.limit} MB
                </span>
              </div>
              <Progress value={usage.memory.percentage} className="h-2" />
            </div>

            {/* Exports */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Exports</span>
                <span className="text-sm text-gray-600">
                  {usage.exports.count} / {usage.exports.limit}
                </span>
              </div>
              <Progress value={usage.exports.percentage} className="h-2" />
            </div>

            {/* Warnings */}
            {usage.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-700">Usage Alerts</h4>
                {usage.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg text-xs ${
                      warning.severity === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    {warning.message}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Subscription</CardTitle>
          <CardDescription>
            Upgrade, downgrade, or cancel your subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSubscriptionAction('upgrade', 'pro_monthly')}
              disabled={subscription?.planId === 'pro_monthly'}
            >
              <Users className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSubscriptionAction('downgrade', 'free')}
              disabled={subscription?.planId === 'free'}
            >
              Downgrade to Free
            </Button>
          </div>

          {subscription?.planId !== 'free' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleSubscriptionAction('cancel')}
              disabled={subscription?.cancel_at_period_end}
            >
              Cancel Subscription
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}