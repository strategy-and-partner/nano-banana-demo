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

// Check image generation quota (JST timezone-based)
export const checkGenerationQuota = cache(async (): Promise<{
  allowed: boolean
  remaining: number
  resetAt?: Date
}> => {
  const user = await verifySession()
  const supabase = await createClient()

  try {
    // Get current JST date
    const { data: todayJST, error: dateError } = await supabase.rpc('get_jst_current_date')

    if (dateError) {
      console.error('Error getting JST date:', dateError)
      return { allowed: false, remaining: 0 }
    }

    // Get user profile with quota info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('daily_generation_count, last_generation_date')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error getting profile:', profileError)
      return { allowed: false, remaining: 0 }
    }

    // Check if date has changed
    const isDifferentDay = profile.last_generation_date !== todayJST

    // Calculate current count (reset to 0 if it's a new day)
    const currentCount = isDifferentDay ? 0 : (profile.daily_generation_count || 0)

    // Calculate remaining quota
    const remaining = Math.max(0, 20 - currentCount)
    const allowed = remaining > 0

    // Calculate next reset time (tomorrow at JST 00:00)
    const resetAt = new Date(todayJST + 'T00:00:00+09:00')
    resetAt.setDate(resetAt.getDate() + 1)

    return {
      allowed,
      remaining,
      resetAt,
    }
  } catch (error) {
    console.error('Error in checkGenerationQuota:', error)
    return { allowed: false, remaining: 0 }
  }
})

// Increment generation count after successful image generation
export const incrementGenerationCount = async (): Promise<void> => {
  const user = await verifySession()
  const supabase = await createClient()

  try {
    const { error } = await supabase.rpc('increment_generation_count', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error incrementing generation count:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in incrementGenerationCount:', error)
    throw error
  }
}