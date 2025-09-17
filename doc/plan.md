Supabase + Next.js 15 ログイン機能実装計画                                                                                                                                       │ │
│ │                                                                                                                                                                                  │ │
│ │ 📋 実装概要                                                                                                                                                                      │ │
│ │                                                                                                                                                                                  │ │
│ │ 最新のベストプラクティス（2025）に基づいて、セキュアなログイン機能を実装します。Cookie-based認証とRow Level                                                                      │ │
│ │ Security（RLS）を使用したエンタープライズレベルのセキュリティを提供します。                                                                                                      │ │
│ │                                                                                                                                                                                  │ │
│ │ 🎯 あなたが設定する必要がある項目                                                                                                                                                │ │
│ │                                                                                                                                                                                  │ │
│ │ 1. Supabaseプロジェクトの作成                                                                                                                                                    │ │
│ │                                                                                                                                                                                  │ │
│ │ - https://supabase.com でアカウント作成                                                                                                                                          │ │
│ │ - 新しいプロジェクトを作成                                                                                                                                                       │ │
│ │ - プロジェクトURL と Anon Key を取得                                                                                                                                             │ │
│ │                                                                                                                                                                                  │ │
│ │ 2. Supabase認証設定                                                                                                                                                              │ │
│ │                                                                                                                                                                                  │ │
│ │ - Authentication > Settings で Site URL を http://localhost:3000 に設定                                                                                                          │ │
│ │ - Email templates で確認メール設定を調整：                                                                                                                                       │ │
│ │   - "Confirm signup" テンプレートの {{ .ConfirmationURL }} を {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email に変更                                          │ │
│ │                                                                                                                                                                                  │ │
│ │ 3. Row Level Security (RLS) の設定                                                                                                                                               │ │
│ │                                                                                                                                                                                  │ │
│ │ - Database > Tables で profiles テーブル作成後                                                                                                                                   │ │
│ │ - RLS ポリシーを手動で設定（SQL エディターで実行）                                                                                                                               │ │
│ │                                                                                                                                                                                  │ │
│ │ 4. 環境変数の設定                                                                                                                                                                │ │
│ │                                                                                                                                                                                  │ │
│ │ - .env.local ファイルに Supabase の認証情報を設定                                                                                                                                │ │
│ │                                                                                                                                                                                  │ │
│ │ 🚀 実装ステップ                                                                                                                                                                  │ │
│ │                                                                                                                                                                                  │ │
│ │ Phase 1: パッケージとクライアント設定                                                                                                                                            │ │
│ │                                                                                                                                                                                  │ │
│ │ - @supabase/supabase-js と @supabase/ssr パッケージをインストール                                                                                                                │ │
│ │ - Browser Client と Server Client を作成                                                                                                                                         │ │
│ │ - Cookie管理の設定（HTTPOnly、セキュア）                                                                                                                                         │ │
│ │                                                                                                                                                                                  │ │
│ │ Phase 2: 認証インフラストラクチャ                                                                                                                                                │ │
│ │                                                                                                                                                                                  │ │
│ │ - /auth/confirm Route Handler 作成（メール確認用）                                                                                                                               │ │
│ │ - Data Access Layer (DAL) パターンでセキュリティを実装                                                                                                                           │ │
│ │ - Server Actions for ログイン/サインアップ                                                                                                                                       │ │
│ │                                                                                                                                                                                  │ │
│ │ Phase 3: データベーススキーマ                                                                                                                                                    │ │
│ │                                                                                                                                                                                  │ │
│ │ - profiles テーブル作成（user_id, email, created_at等）                                                                                                                          │ │
│ │ - RLS ポリシー設定：                                                                                                                                                             │ │
│ │ -- ユーザーは自分のプロフィールのみアクセス可能                                                                                                                                  │ │
│ │ CREATE POLICY "Users can view own profile" ON profiles                                                                                                                           │ │
│ │   FOR SELECT USING (auth.uid() = user_id);                                                                                                                                       │ │
│ │                                                                                                                                                                                  │ │
│ │ Phase 4: UIコンポーネント                                                                                                                                                        │ │
│ │                                                                                                                                                                                  │ │
│ │ - ログインフォーム（メール/パスワード）                                                                                                                                          │ │
│ │ - サインアップフォーム                                                                                                                                                           │ │
│ │ - パスワードリセット機能                                                                                                                                                         │ │
│ │ - ユーザープロフィール表示                                                                                                                                                       │ │
│ │                                                                                                                                                                                  │ │
│ │ Phase 5: 認証保護                                                                                                                                                                │ │
│ │                                                                                                                                                                                  │ │
│ │ - Server Components での認証チェック                                                                                                                                             │ │
│ │ - 保護されたページの実装                                                                                                                                                         │ │
│ │ - ログアウト機能                                                                                                                                                                 │ │
│ │                                                                                                                                                                                  │ │
│ │ Phase 6: セキュリティ強化                                                                                                                                                        │ │
│ │                                                                                                                                                                                  │ │
│ │ - CSRF保護の実装                                                                                                                                                                 │ │
│ │ - Rate limiting（必要に応じて）                                                                                                                                                  │ │
│ │ - 入力検証とサニタイゼーション                                                                                                                                                   │ │
│ │                                                                                                                                                                                  │ │
│ │ 🛡️ セキュリティ特徴                                                                                                                                                             │ │
│ │                                                                                                                                                                                  │ │
│ │ - Cookie-based認証：XSS攻撃に対してLocalStorageより安全                                                                                                                          │ │
│ │ - Row Level Security：データベースレベルでのアクセス制御                                                                                                                         │ │
│ │ - Server-side認証：SEO・パフォーマンス・セキュリティの向上                                                                                                                       │ │
│ │ - 多層セキュリティ：データ層・ルート層・UI層での保護                                                                                                                             │ │
│ │                                                                                                                                                                                  │ │
│ │ 📁 作成されるファイル構造                                                                                                                                                        │ │
│ │                                                                                                                                                                                  │ │
│ │ ├── lib/                                                                                                                                                                         │ │
│ │ │   ├── supabase/                                                                                                                                                                │ │
│ │ │   │   ├── client.ts     # ブラウザ用クライアント                                                                                                                               │ │
│ │ │   │   └── server.ts     # サーバー用クライアント                                                                                                                               │ │
│ │ │   └── dal.ts           # Data Access Layer                                                                                                                                     │ │
│ │ ├── app/                                                                                                                                                                         │ │
│ │ │   ├── auth/                                                                                                                                                                    │ │
│ │ │   │   ├── confirm/route.ts                                                                                                                                                     │ │
│ │ │   │   ├── login/                                                                                                                                                               │ │
│ │ │   │   │   └── page.tsx                                                                                                                                                         │ │
│ │ │   │   └── signup/                                                                                                                                                              │ │
│ │ │   │       └── page.tsx                                                                                                                                                         │ │
│ │ │   ├── profile/                                                                                                                                                                 │ │
│ │ │   │   └── page.tsx     # 保護されたページ                                                                                                                                      │ │
│ │ │   └── actions/         # Server Actions                                                                                                                                        │ │
│ │ │       └── auth.ts                                                                                                                                                              │ │
│ │ └── components/                                                                                                                                                                  │ │
│ │     ├── LoginForm.tsx                                                                                                                                                            │ │
│ │     ├── SignupForm.tsx                                                                                                                                                           │ │
│ │     └── UserProfile.tsx                                                                                                                                                          │ │
│ │                                                                                                                                                                                  │ │
│ │ ⚡ 推定実装時間                                                                                                                                                                   │ │
│ │                                                                                                                                                                                  │ │
│ │ - Phase 1-2: 30分（設定・インフラ）                                                                                                                                              │ │
│ │ - Phase 3: 20分（データベース）                                                                                                                                                  │ │
│ │ - Phase 4: 45分（UI実装）                                                                                                                                                        │ │
│ │ - Phase 5-6: 30分（保護・テスト）                                                                                                                                                │ │
│ │                                                                                                                                                                                  │ │
│ │ 総時間：約2時間                                                                                                                                                                  │ │
│ │                                                                                                                                                                                  │ │
│ │ この計画は2025年のベストプラクティスに基づいており、本番環境でも安心して使用できるエンタープライズレベルのセキュリティを提供します。                 