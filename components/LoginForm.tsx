'use client'

import { signIn } from '@/app/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(formData)
      router.push(redirectTo || '/')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const errorFromUrl = searchParams.get('error')
  const displayError = error || (errorFromUrl && getErrorMessage(errorFromUrl))

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-black">ログイン</h1>
        <p className="text-black">
          アカウントにアクセスするには認証情報を入力してください
        </p>
      </div>

      {displayError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {displayError}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-black">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="メールアドレスを入力"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-black">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="パスワードを入力"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>ログイン中...</span>
            </div>
          ) : (
            'ログイン'
          )}
        </button>
      </form>

    </div>
  )
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'confirmation_failed':
      return 'メール確認が失敗しました。もう一度お試しください。'
    case 'confirmation_error':
      return '確認中にエラーが発生しました。'
    case 'invalid_confirmation_link':
      return '無効な確認リンクです。新しいものをリクエストしてください。'
    default:
      return 'エラーが発生しました。もう一度お試しください。'
  }
}