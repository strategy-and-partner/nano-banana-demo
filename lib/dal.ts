import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { redirect } from 'next/navigation'

// Cache the user for the duration of the request
export const getUser = cache(async () => {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error in getUser:', error)
    return null
  }
})

// Verify user is authenticated, redirect if not
export const verifySession = cache(async () => {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return user
})

// Get user profile with authentication check
export const getUserProfile = cache(async () => {
  const user = await verifySession()
  const supabase = await createClient()

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error getting profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
})

// Check if user is authenticated (non-redirecting)
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getUser()
  return !!user
}

// Get session information
export const getSession = cache(async () => {
  const supabase = await createClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Error in getSession:', error)
    return null
  }
})