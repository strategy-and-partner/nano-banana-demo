import { getUser } from '@/lib/dal'
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is authenticated
  const user = await getUser()

  // If user is logged in, redirect to gemini-demo
  if (user) {
    redirect('/gemini-demo')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/next.svg"
                alt="Next.js logo"
                width={100}
                height={24}
                priority
                className="dark:invert"
              />
              <span className="text-xl font-bold text-gray-900">🏪 レストランデザインAI</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* <a
                href="/gemini-demo"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Gemini デモ
              </a> */}
              {user ? (
                <>
                  <span className="text-gray-600">
                    ようこそ！
                  </span>
                  <a
                    href="/profile"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    プロフィール
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/auth/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    ログイン
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            AIで理想の店舗デザインを
            <span className="block text-purple-600">瞬時に生成</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Google Gemini AIを活用し、飲食店の内装デザインを効率的に生成・編集。
            &SPICE教科書の規定に基づいた、プロフェッショナルなデザイン提案を実現。
          </p>

          {user ? (
            <div className="mt-10 max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  🎉 認証成功！
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  ログイン済みです。保護された機能にアクセスできます。
                </p>
                <div className="mt-4 space-y-2">
                  <a
                    href="/profile"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    プロフィールを見る
                  </a>
                  <a
                    href="/gemini-demo"
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    Gemini APIデモを試す
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              {/* <div className="rounded-md shadow">
                <a
                  href="/auth/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  はじめる
                </a>
              </div> */}
              <div className="rounded-md shadow">
                <a
                  href="/auth/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  ログインして開始
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    AIによる画像生成
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Google Gemini 2.5を活用し、テキストと画像から理想のレストランデザインを瞬時に生成。
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    インテリジェントな編集
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    料理ジャンル、雰囲気、要素の追加・置き換えなど、きめ細かなデザイン調整が可能。
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    プロの規定準拠
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    &SPICE教科書の51項目の規定に基づき、実務レベルの店舗設計要件に対応。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
