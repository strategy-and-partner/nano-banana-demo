# 🚀 Next.js + Supabase MVP セットアップガイド

この MVP は 2025 年のベストプラクティスに基づいて構築されており、エンタープライズレベルのセキュリティを提供します。

## 🎯 あなたが行う必要がある設定

### 1. Supabase プロジェクトの作成

1. [supabase.com](https://supabase.com) でアカウントを作成
2. 「New Project」で新しいプロジェクトを作成
3. プロジェクト名と DB パスワードを設定
4. **Project URL** と **Anon Key** をコピー

### 2. 環境変数の設定

`.env.local` ファイルを作成：

```bash
cp .env.example .env.local
```

以下を編集：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabase認証設定

#### Authentication Settings:
- Supabase Dashboard → Authentication → Settings
- **Site URL**: `http://localhost:3000` に設定

#### Email Templates:
- Authentication → Email Templates
- **Confirm signup** テンプレートで以下を変更：

変更前：
```
{{ .ConfirmationURL }}
```

変更後：
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

### 4. データベースの設定

Supabase Dashboard の **SQL Editor** で以下のスクリプトを実行：

```sql
-- プロジェクトルートの supabase-setup.sql を参照
```

または `supabase-setup.sql` の内容をコピーして実行。

### 5. アプリケーションの起動

```bash
# Docker環境で起動
docker-compose up --build

# または直接起動する場合
npm install
npm run dev
```

## ✅ 動作確認

1. http://localhost:3000 にアクセス
2. 「Sign Up」でアカウント作成
3. メール確認
4. ログインしてプロフィールページにアクセス

## 🛡️ セキュリティ機能

- **Cookie-based認証**: XSS攻撃に対してLocalStorageより安全
- **Row Level Security (RLS)**: データベースレベルでのアクセス制御
- **Data Access Layer**: 認証チェックを一元化
- **Server Components**: SEO・パフォーマンス・セキュリティの向上

## 📁 ファイル構造

```
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # ブラウザ用
│   │   └── server.ts      # サーバー用
│   └── dal.ts            # Data Access Layer
├── app/
│   ├── auth/
│   │   ├── confirm/route.ts
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── profile/page.tsx   # 保護されたページ
│   └── actions/auth.ts    # Server Actions
├── components/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── UserProfile.tsx
└── supabase-setup.sql     # DB設定スクリプト
```

## 🚨 本番環境への移行

1. **環境変数の更新**:
   - `NEXT_PUBLIC_SITE_URL` を本番URLに変更
   - Supabase の Site URL 設定も更新

2. **Vercel デプロイ**:
   - GitHub 連携でプロジェクトをインポート
   - 環境変数を設定
   - 自動デプロイを有効化

3. **セキュリティ確認**:
   - RLS ポリシーが正しく設定されているか確認
   - メール確認リンクが正常に動作するか確認

## 🔧 トラブルシューティング

### メール確認が届かない
- Supabase の Email Templates 設定を確認
- スパムフォルダをチェック

### 認証エラーが発生する
- RLS ポリシーが有効になっているか確認
- 環境変数が正しく設定されているか確認

### ログインできない
- Supabase の Site URL が正しく設定されているか確認
- Cookie の設定を確認

## 📞 サポート

実装に関する質問やトラブルが発生した場合は、Supabase の公式ドキュメントを参照してください。

---

🎉 **おめでとうございます！**

エンタープライズレベルのセキュリティを備えた MVP が完成しました。2025 年のベストプラクティスに基づいており、本番環境でも安心して使用できます。