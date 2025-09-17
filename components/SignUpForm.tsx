'use client'

import { signUp } from '@/app/actions/auth'
import { useState } from 'react'

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Client-side validation
    if (password !== confirmPassword) {
      setPasswordsMatch(false)
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上である必要があります')
      setIsLoading(false)
      return
    }

    setPasswordsMatch(true)

    try {
      const result = await signUp(formData)

      if (result.needsConfirmation) {
        setSuccess('アカウントを確認するためにメールをご確認ください。')
      } else {
        setSuccess('アカウントが正常に作成されました！ログインできます。')
      }

      // Reset form
      const form = document.getElementById('signup-form') as HTMLFormElement
      form?.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = () => {
    const form = document.getElementById('signup-form') as HTMLFormElement
    if (!form) return

    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement)?.value

    if (password && confirmPassword) {
      const match = password === confirmPassword
      setPasswordsMatch(match)
      if (!match) {
        setError('パスワードが一致しません')
      } else if (error === 'パスワードが一致しません') {
        setError(null)
      }
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-black">アカウント作成</h1>
        <p className="text-black">
          アカウントを作成するために情報を入力してください
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {success}
        </div>
      )}

      <form id="signup-form" action={handleSubmit} className="space-y-4">
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
            autoComplete="new-password"
            required
            minLength={6}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="パスワードを作成（6文字以上）"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-black">
            パスワード確認
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            onChange={handlePasswordChange}
            className={`w-full px-3 py-2 text-black border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-500 ${
              passwordsMatch
                ? 'border-gray-300 focus:ring-blue-500'
                : 'border-red-300 focus:ring-red-500'
            }`}
            placeholder="パスワードを確認"
          />
          {!passwordsMatch && (
            <p className="text-sm text-red-600">パスワードが一致しません</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !passwordsMatch}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>アカウント作成中...</span>
            </div>
          ) : (
            'アカウント作成'
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-black">
          既にアカウントをお持ちですか？{' '}
          <a
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ログイン
          </a>
        </p>
      </div>

      <div className="text-xs text-black text-center">
        アカウントを作成することで、利用規約とプライバシーポリシーに同意したことになります。
      </div>
    </div>
  )
}