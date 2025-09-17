'use server'

import { createClientFromRequest } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const supabase = await createClientFromRequest()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/confirm`,
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      throw new Error(error.message)
    }

    if (data.user && !data.user.email_confirmed_at) {
      return {
        success: true,
        message: 'Please check your email to confirm your account',
        needsConfirmation: true,
      }
    }

    return {
      success: true,
      message: 'Account created successfully',
      needsConfirmation: false,
    }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const supabase = await createClientFromRequest()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Failed to sign in')
    }

    revalidatePath('/', 'layout')
    return { success: true, message: 'Signed in successfully' }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function signOut() {
  const supabase = await createClientFromRequest()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/auth/login')
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    throw new Error('Email is required')
  }

  const supabase = await createClientFromRequest()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      console.error('Reset password error:', error)
      throw new Error(error.message)
    }

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    }
  } catch (error) {
    console.error('Reset password error:', error)
    throw error
  }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    throw new Error('Password and confirmation are required')
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match')
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long')
  }

  const supabase = await createClientFromRequest()

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error('Update password error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    return {
      success: true,
      message: 'Password updated successfully',
    }
  } catch (error) {
    console.error('Update password error:', error)
    throw error
  }
}