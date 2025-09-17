import { createClientFromRequest } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'signup' | 'recovery' | 'magiclink'
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClientFromRequest()

    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (error) {
        console.error('Error confirming auth:', error)
        return NextResponse.redirect(
          new URL('/auth/login?error=confirmation_failed', request.url)
        )
      }

      // If confirmation is successful, create or update user profile
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if profile already exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single()

        // Create profile if it doesn't exist
        if (!profile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }
        }
      }

      return NextResponse.redirect(new URL(next, request.url))
    } catch (error) {
      console.error('Unexpected error during confirmation:', error)
      return NextResponse.redirect(
        new URL('/auth/login?error=confirmation_error', request.url)
      )
    }
  }

  // If no token_hash or type, redirect to login with error
  return NextResponse.redirect(
    new URL('/auth/login?error=invalid_confirmation_link', request.url)
  )
}