# Nano Banana Demo プロジェクト仕様書

## プロジェクト概要
Next.js 15とSupabaseを使用した認証機能付きMVPテンプレートプロジェクトです。
最新のWeb開発技術スタックとエンタープライズグレードのセキュリティを採用しています。

## 技術スタック

### フロントエンド
- **Next.js 15.5.3** - App Routerを採用した最新版React フレームワーク
- **React 19.1.0** - ユーザーインターフェース構築ライブラリ
- **Tailwind CSS v4** - ユーティリティファーストのCSSフレームワーク
- **TypeScript 5** - 型安全な JavaScript スーパーセット

### バックエンド/インフラ
- **Supabase** - 認証とデータベース管理を提供するBaaS
  - PostgreSQLデータベース
  - Row Level Security (RLS)による高度なアクセス制御
  - リアルタイム機能対応
- **Docker** - コンテナ化による環境の一貫性確保

## 主要機能

### 1. 認証システム
- **ユーザー登録** (`/auth/signup`)
  - メールアドレスとパスワードによる新規登録
  - メール確認によるアカウント有効化

- **ログイン** (`/auth/login`)
  - セッションベース認証
  - クッキーを使用した安全な認証状態管理

- **プロフィール管理** (`/profile`)
  - ユーザー情報の表示と編集
  - アバター画像のアップロード対応

### 2. セキュリティ機能
- **Row Level Security (RLS)**
  - ユーザーは自分のデータのみアクセス可能
  - データベースレベルでのアクセス制御

- **サーバーサイド認証**
  - Server Componentsを活用した安全な認証チェック
  - Data Access Layer (DAL)パターンの実装

## プロジェクト構造

```
nano-banana-demo/
├── app/                    # Next.js App Router
│   ├── auth/              # 認証関連ページ
│   │   ├── login/         # ログインページ
│   │   ├── signup/        # 新規登録ページ
│   │   └── confirm/       # メール確認処理
│   ├── profile/           # プロフィールページ
│   ├── actions/           # Server Actions
│   └── page.tsx           # ホームページ
├── components/            # 再利用可能なReactコンポーネント
├── lib/                   # ユーティリティとライブラリ
│   ├── supabase/         # Supabaseクライアント設定
│   └── dal.ts            # データアクセス層
├── public/               # 静的ファイル
└── doc/                  # ドキュメント
```

## データベース構造

### profilesテーブル
- `id`: UUID (主キー)
- `user_id`: UUID (auth.users への外部キー)
- `email`: テキスト
- `full_name`: テキスト
- `avatar_url`: テキスト
- `created_at`: タイムスタンプ
- `updated_at`: タイムスタンプ

## 開発環境セットアップ

### 必要な環境変数
`.env.local`に以下を設定:
```
NEXT_PUBLIC_SUPABASE_URL=<Supabase プロジェクトURL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase アノニマスキー>
```

### 起動コマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Lintチェック
npm run lint
```

### Docker起動
```bash
docker-compose up
```

## ベストプラクティス

### コード規約
- TypeScriptの厳密な型定義
- React Server Componentsの活用
- 非同期処理でのエラーハンドリング

### セキュリティ
- 環境変数による機密情報管理
- RLSによるデータアクセス制御
- サーバーサイドでの認証状態検証

### パフォーマンス
- Next.js Turbopackによる高速開発
- キャッシュ戦略の実装（React cache）
- コード分割と遅延読み込み

## 今後の開発予定
- ソーシャルログイン対応
- 多要素認証（MFA）
- パスワードリセット機能
- ユーザーダッシュボード
- API Rate Limiting
- 国際化（i18n）対応

## デプロイ
- Vercelへのワンクリックデプロイ対応
- Docker コンテナによるセルフホスティング対応
- 環境変数による設定の外部化

## 注意事項
- Supabaseプロジェクトのセットアップが必要
- `supabase-setup.sql`を実行してデータベースを初期化
- メール認証を有効にする場合はSupabaseダッシュボードで設定が必要