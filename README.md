# My GitHub Index

自分の GitHub リポジトリを一覧表示・検索できるインデックスサイト。

## 概要

GitHub には自分のリポジトリ全体を俯瞰できる「インデックス」がない。そのため、GitHub の中にどこに何があるか把握しづらい。
本プロジェクトは GitHub Pages（github.io）を活用し、「まずはここを見に行けば良い」という入り口となるインデックスサイトを提供する。

公開 URL: <https://kojikawazu.github.io/my-github-index/>

## ディレクトリ構成

```
my-github-index/
├── front/          # Astro フロントエンド（ビルド・開発はこの中で実行）
│   ├── src/
│   ├── public/
│   ├── astro.config.mjs
│   └── package.json
├── docs/           # 仕様書（01〜11）
├── .github/        # GitHub Actions ワークフロー
└── .claude/        # Claude Code 用ルール
```

## セットアップ

```bash
cd front
npm install
```

Node.js 22 以上推奨。

## 使い方

すべてのコマンドは `front/` ディレクトリで実行します。

```bash
cd front

# 開発サーバ（http://localhost:4321/my-github-index/）
npm run dev

# 本番ビルド（front/dist/ に出力）
npm run build

# 型チェック
npx astro check
```

ビルド時に GitHub REST API から `kojikawazu` の public リポを取得し、fork と archived を除外して静的 HTML に焼き込みます。

### Rate limit 対策

GitHub REST API は無認証だと 60 req/hr。連続ビルドや `gh` CLI と併用すると枯渇するため、ローカルでは認証トークンを env var で渡すことを推奨：

```bash
cd front && GITHUB_TOKEN=$(gh auth token) npm run build
```

CI（GitHub Actions）では `secrets.GITHUB_TOKEN` を自動で `env.GITHUB_TOKEN` として渡しているため、追加設定不要で 5000 req/hr が使えます。

## カテゴリ分類

各リポは GitHub の **Topics** をもとに以下のカテゴリへ振り分けられます。

| Topic 名 | 表示名 |
|----------|--------|
| `profile` | プロフィール |
| （未付与） | 追加分（新規・未トリアージ・自動振り分け） |
| `personal-project` | 個人開発 |
| `info-tool` | 情報集約用 |
| `tech-article` | 技術記事 |
| `learning` | 学習 |
| `ai` | AI |
| `ai-experiment` | AI検証用 |
| `algorithm` | アルゴリズム |
| `game` | ゲーム |
| `pending` | 保留 |
| `other` | その他（明示的に分類対象外と確定） |

複数 topic が付いている場合、上記表の順で最初に一致したものを採用します。

### Topic の付与方法

GitHub UI のリポ設定ページから付与するほか、`gh` CLI で一括処理も可能：

```bash
# 1 リポにトピックを追加
gh repo edit kojikawazu/REPO_NAME --add-topic personal-project

# 複数同時に追加
gh repo edit kojikawazu/REPO_NAME --add-topic ai --add-topic learning

# トピック削除
gh repo edit kojikawazu/REPO_NAME --remove-topic learning
```

Topic 変更後、次回 cron（毎日 JST 01:00）または `workflow_dispatch` でサイトが更新されます。

## デプロイ

`main` ブランチへの push、毎日 JST 01:00 の cron、または手動実行（`workflow_dispatch`）で GitHub Actions が走り、GitHub Pages へ自動デプロイされます。

設定の詳細は `docs/09-architecture-specification.md` を参照。
