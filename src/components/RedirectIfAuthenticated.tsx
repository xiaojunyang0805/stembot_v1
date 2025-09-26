'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useAuth } from '../providers/AuthProvider'

interface RedirectIfAuthenticatedProps {
  to: string
}

export function RedirectIfAuthenticated({ to }: RedirectIfAuthenticatedProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push(to)
    }
  }, [user, loading, to, router])

  // Return null since this is just a redirect component
  return null
}