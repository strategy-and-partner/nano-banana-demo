import { getUser } from '@/lib/dal'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  // If user is already authenticated, redirect to home
  const user = await getUser()
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6">
        <LoginForm />
      </div>
    </div>
  )
}