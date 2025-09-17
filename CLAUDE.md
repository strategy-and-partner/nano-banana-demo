# Next.js + Supabase MVP デモプロジェクト

## 🎯 プロジェクト概要
このプロジェクトは、Next.js 15とSupabaseを使用した本番環境対応のMVPテンプレートです。エンタープライズグレードのセキュリティと2025年のベストプラクティスに基づいて構築されています。

## 📦 技術スタック

### フロントエンド
- **Next.js 15.5.3** - App Router使用、Turbopack対応
- **React 19.1.0** - 最新の安定版
- **TypeScript 5** - 型安全性の確保
- **Tailwind CSS v4** - モダンなスタイリング

### バックエンド/認証
- **Supabase** - 認証とデータベース
  - Cookie-based認証
  - Row Level Security (RLS)
  - PostgreSQLデータベース

### 開発環境
- **Docker** - コンテナ化対応
- **ESLint** - コード品質チェック
- **npm** - パッケージ管理

## 🏗️ プロジェクト構造

```
nano-banana-demo/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   │   └── auth.ts       # 認証関連のアクション
│   ├── auth/             # 認証ページ
│   │   ├── confirm/      # メール確認
│   │   ├── login/        # ログインページ
│   │   └── signup/       # 新規登録ページ
│   ├── profile/          # プロフィールページ（保護）
│   ├── page.tsx          # ホームページ
│   ├── layout.tsx        # ルートレイアウト
│   └── globals.css       # グローバルスタイル
├── components/           # Reactコンポーネント
│   ├── LoginForm.tsx    # ログインフォーム
│   ├── SignUpForm.tsx   # 新規登録フォーム
│   └── UserProfile.tsx  # ユーザープロフィール表示
├── lib/                  # ライブラリ/ユーティリティ
│   ├── supabase/        # Supabase設定
│   │   ├── client.ts    # クライアント用
│   │   ├── server.ts    # サーバー用
│   │   └── middleware.ts # ミドルウェア用
│   └── dal.ts           # Data Access Layer
├── doc/                  # ドキュメント
├── public/              # 静的ファイル
├── .env.local           # 環境変数（Supabase設定）
├── docker-compose.yml   # Docker設定
├── Dockerfile          # Dockerイメージ設定
├── package.json        # プロジェクト依存関係
├── supabase-setup.sql  # データベース初期設定
```

## 🔑 主要機能

### 認証システム
- **メール/パスワード認証** - Supabase Auth使用
- **メール確認機能** - 新規登録時のメール確認
- **Cookie-based認証** - XSS攻撃に対してLocalStorageより安全
- **保護されたルート** - 認証が必要なページの自動リダイレクト

### セキュリティ機能
- **Row Level Security (RLS)** - データベースレベルでのアクセス制御
- **Data Access Layer (DAL)** - 認証チェックの一元化
- **Server Components** - サーバーサイドレンダリング
- **環境変数による設定管理** - セキュアな設定管理

### データベース構造
```sql
profiles テーブル:
- id: UUID (主キー)
- user_id: UUID (auth.usersへの外部キー)
- email: TEXT
- full_name: TEXT
- avatar_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🚀 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# Lintチェック
npm run lint

# Docker環境で起動
docker-compose up --build
```

## 🔧 環境変数

必要な環境変数（`.env.local`）:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📝 API構造

### Server Actions (`app/actions/auth.ts`)
- `login(email, password)` - ログイン処理
- `signup(email, password, fullName)` - 新規登録処理
- `logout()` - ログアウト処理

### Data Access Layer (`lib/dal.ts`)
- `getUser()` - 現在のユーザー取得（キャッシュ付き）
- `verifySession()` - セッション検証（リダイレクト付き）
- `getUserProfile()` - プロフィール取得
- `isAuthenticated()` - 認証状態確認
- `getSession()` - セッション情報取得

## 🎨 UIコンポーネント

### ページ
- **ホームページ** (`app/page.tsx`) - ランディングページ、認証状態で表示切替
- **ログイン** (`app/auth/login/page.tsx`) - ログインフォーム
- **新規登録** (`app/auth/signup/page.tsx`) - 登録フォーム
- **プロフィール** (`app/profile/page.tsx`) - 認証必須のプロフィールページ

### コンポーネント
- **LoginForm** - メール/パスワードログイン
- **SignUpForm** - 新規登録フォーム
- **UserProfile** - ユーザー情報表示とログアウト

## 🐳 Docker設定

### Dockerfile
- Node.js 18-alpine使用
- マルチステージビルド
- 本番環境最適化

### docker-compose.yml
- ポート3000でアクセス
- 環境変数の自動読み込み
- ボリュームマウント対応

## 📊 現在のSupabase設定

- **プロジェクトURL**: https://wvehraqjkvigdjhhrnre.supabase.co
- **認証方式**: Email/Password
- **RLSポリシー**: 有効（ユーザーは自分のデータのみアクセス可能）

## 🚦 開発状況

現在、3つの開発サーバーがバックグラウンドで実行中:
- Background Bash a87779 (npm run dev)
- Background Bash fc34bc (npm run dev)
- Background Bash b97f12 (npm run dev)

## 📌 注意事項

1. **Supabase設定**
   - メールテンプレートの確認URLパスを正しく設定する必要がある
   - RLSポリシーが有効になっていることを確認

2. **セキュリティ**
   - `.env.local`をGitにコミットしない
   - Service Role Keyは本番環境でのみ使用

3. **開発時の注意**
   - Turbopackを使用（高速な開発ビルド）
   - Server Componentsを優先的に使用
   - クライアントコンポーネントは必要最小限に

## 🔄 今後の拡張可能性

- ソーシャルログイン対応
- ユーザープロフィール編集機能
- ファイルアップロード機能
- リアルタイム機能（Supabase Realtime）
- 多言語対応
- テスト環境の構築

## 📚 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)