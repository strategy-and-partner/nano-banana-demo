import { getUser } from '@/lib/dal'
import { redirect } from 'next/navigation'
import SignUpForm from '@/components/SignUpForm'

export default async function SignUpPage() {
  // If user is already authenticated, redirect to home
  const user = await getUser()
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6">
        <SignUpForm />
      </div>
    </div>
  )
}