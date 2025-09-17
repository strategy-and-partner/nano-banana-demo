'use client'

import { signOut } from '@/app/actions/auth'
import { useState } from 'react'

interface UserProfileProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
  profile?: {
    full_name?: string
    avatar_url?: string
    created_at: string
  }
}

export default function UserProfile({ user, profile }: UserProfileProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoading(false)
    }
  }

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User'

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-black">プロフィール</h1>

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="プロフィール"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-gray-600">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            表示名
          </label>
          <p className="mt-1 text-sm text-gray-900">{displayName}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ユーザーID
          </label>
          <p className="mt-1 text-sm text-gray-500 font-mono break-all">
            {user.id}
          </p>
        </div>

        {profile?.created_at && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              登録日
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(profile.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>ログアウト中...</span>
            </div>
          ) : (
            'ログアウト'
          )}
        </button>

        <div className="text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ホームに戻る
          </a>
        </div>
      </div>

      {/* Development Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <p className="font-semibold">🔐 認証ステータス</p>
        <p>Supabaseで正常に認証されています！</p>
        <p className="mt-1">このプロフィールデータはRLS（行レベルセキュリティ）で保護されています。</p>
      </div>
    </div>
  )
}