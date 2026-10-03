# 11. タスク（Tasks）

開発タスク・マイルストーン・スケジュール・進捗管理を行う。

## マイルストーン

| マイルストーン | 目標 | ステータス |
|---------------|------|----------|
| M1: 設計完了 | docs/01〜09 のレビュー完了 | 完了 |
| M2: ローカル動作 | Astro + Tailwind で API データを表示できる | 完了 |
| M3: CI デプロイ | GitHub Actions cron で Pages に自動デプロイされる | 完了 |
| M4: MVP リリース | `kojikawazu.github.io/my-github-index/` で公開 | 完了 |

## タスク一覧

### Phase 1: プロジェクト初期化（M2 準備）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-01 | Astro プロジェクト初期化（`npm create astro@latest`） | 完了 | 09 |
| TSK-02 | Tailwind CSS integration 追加（`npx astro add tailwind`） | 完了 | 09 |
| TSK-03 | TypeScript strict 設定確認 | 完了 | 09 |
| TSK-04 | `astro.config.mjs` に `base: '/my-github-index/'` 設定 | 完了 | 09 |
| TSK-05 | `.gitignore` に `node_modules`, `dist`, `.env` 追加 | 完了 | 06 |

### Phase 2: データ取得層（M2）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-06 | `src/lib/github.ts` 作成：GitHub API 呼び出し関数 | 完了 | 03, 09 |
| TSK-07 | `GitHubRepo` 型定義（API レスポンス用） | 完了 | 05 |
| TSK-08 | `DisplayRepo` 型定義（表示用）+ フィルタ関数 | 完了 | 03 |
| TSK-09 | エラーハンドリング（API 失敗時はビルドを失敗させる） | 完了 | 06 |

### Phase 3: UI 実装（M2）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-10 | `Layout.astro` 作成（HTML 全体構造・メタタグ） | 完了 | 03 |
| TSK-11 | `Header.astro` 作成 | 完了 | 03 |
| TSK-12 | `RepoCard.astro` 作成（リポ 1 件分） | 完了 | 03 |
| TSK-13 | `Footer.astro` 作成（最終ビルド時刻・プロフィールリンク） | 完了 | 03 |
| TSK-14 | `pages/index.astro` でデータ取得 → カード一覧描画 | 完了 | 03 |
| TSK-15 | レスポンシブレイアウト（モバイル 1 カラム / PC 2〜3 カラム） | 完了 | 03 |
| TSK-16 | 外部リンクに `rel="noopener noreferrer"` を付与 | 完了 | 06 |

### Phase 4: CI / デプロイ（M3）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-17 | `.github/workflows/deploy.yml` 作成 | 完了 | 09 |
| TSK-18 | cron 設定（`'0 16 * * *'`）+ push + workflow_dispatch | 完了 | 02, 09 |
| TSK-19 | `permissions:` 最小権限設定（contents:read / pages:write / id-token:write） | 完了 | 06 |
| TSK-20 | `actions/deploy-pages` でデプロイステップ追加 | 完了 | 09 |
| TSK-21 | GitHub リポ設定で「Pages > Source: GitHub Actions」を有効化 | 完了 | 09 |
| TSK-22 | Dependabot 設定ファイル `.github/dependabot.yml` 追加 | 完了 | 06 |

### Phase 5: 検証・MVP リリース（M4）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-23 | ローカルで `npm run dev` 動作確認 | 完了 | 08 |
| TSK-24 | ローカルで `npm run build` 成功確認 | 完了 | 08 |
| TSK-25 | main にマージ → GitHub Actions 成功確認 | 完了 | 08 |
| TSK-26 | `kojikawazu.github.io/my-github-index/` で表示確認（PC・モバイル） | 完了 | 08 |
| TSK-27 | リポ更新後 → 翌日 01:00 の cron で反映されること確認 | 完了 | 08 |

### Phase 6: カテゴリ分類機能（追加要件 F-06）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-31 | `src/lib/categories.ts` 作成（カテゴリ定義 + 表示名） | 完了 | 02 |
| TSK-32 | `GitHubRepo` 型に `topics: string[]` 追加 | 完了 | 03 |
| TSK-33 | `DisplayRepo` に `category` 追加 + `pickCategory()` 実装 | 完了 | 03 |
| TSK-34 | `groupByCategory()` 実装 | 完了 | 03 |
| TSK-35 | `CategorySection.astro` 作成 | 完了 | 03 |
| TSK-36 | `index.astro` をセクション分割表示にリファクタ | 完了 | 03 |
| TSK-37 | 「Topic 付与」運用ガイドを README に追記（`gh repo edit` 例） | 完了 | - |

### Phase 7（任意・後回し）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-28 | CSP メタタグ追加 | 未着手 | 06 |
| TSK-29 | ダークモード対応（Tailwind `dark:` バリアント） | 未着手 | 03 |
| TSK-30 | OGP メタタグ（SNS シェア時の見た目） | 未着手 | - |

### Phase 8: 品質改善

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-38 | `astro check` の既存エラー解消（`@types/node` 追加、`process` 型未解決） | 完了 | 09 |
| TSK-39 | ユニットテスト導入（`pickCategory()` / `groupByCategory()` 等の純粋ロジック） | 完了 | 08 |
| TSK-40 | CI に `check` / テスト実行ステップを追加 | 完了 | 08, 09 |

## スケジュール

- 個人プロジェクトのためタイムボックスは設けない
- Phase 順に着手し、Phase 完了ごとに動作確認する

## 進捗管理

- このファイルの「状態」列を `未着手 → 進行中 → 完了` で更新していく
- 大きな仕様変更があれば `docs/01〜09` を先に更新し、それからタスクを再編する
