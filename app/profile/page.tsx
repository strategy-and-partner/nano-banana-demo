import { verifySession, getUserProfile } from '@/lib/dal'
import UserProfile from '@/components/UserProfile'

export default async function ProfilePage() {
  // This will automatically redirect to login if not authenticated
  const user = await verifySession()

  // Get user profile data
  const profile = await getUserProfile()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <UserProfile user={user} profile={profile} />
      </div>
    </div>
  )
}