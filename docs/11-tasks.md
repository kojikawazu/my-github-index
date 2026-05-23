# 11. タスク（Tasks）

開発タスク・マイルストーン・スケジュール・進捗管理を行う。

## マイルストーン

| マイルストーン | 目標 | ステータス |
|---------------|------|----------|
| M1: 設計完了 | docs/01〜09 のレビュー完了 | レビュー中 |
| M2: ローカル動作 | Astro + Tailwind で API データを表示できる | 未着手 |
| M3: CI デプロイ | GitHub Actions cron で Pages に自動デプロイされる | 未着手 |
| M4: MVP リリース | `kojikawazu.github.io/my-github-index/` で公開 | 未着手 |

## タスク一覧

### Phase 1: プロジェクト初期化（M2 準備）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-01 | Astro プロジェクト初期化（`npm create astro@latest`） | 未着手 | 09 |
| TSK-02 | Tailwind CSS integration 追加（`npx astro add tailwind`） | 未着手 | 09 |
| TSK-03 | TypeScript strict 設定確認 | 未着手 | 09 |
| TSK-04 | `astro.config.mjs` に `base: '/my-github-index/'` 設定 | 未着手 | 09 |
| TSK-05 | `.gitignore` に `node_modules`, `dist`, `.env` 追加 | 未着手 | 06 |

### Phase 2: データ取得層（M2）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-06 | `src/lib/github.ts` 作成：GitHub API 呼び出し関数 | 未着手 | 03, 09 |
| TSK-07 | `GitHubRepo` 型定義（API レスポンス用） | 未着手 | 05 |
| TSK-08 | `DisplayRepo` 型定義（表示用）+ フィルタ関数 | 未着手 | 03 |
| TSK-09 | エラーハンドリング（API 失敗時はビルドを失敗させる） | 未着手 | 06 |

### Phase 3: UI 実装（M2）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-10 | `Layout.astro` 作成（HTML 全体構造・メタタグ） | 未着手 | 03 |
| TSK-11 | `Header.astro` 作成 | 未着手 | 03 |
| TSK-12 | `RepoCard.astro` 作成（リポ 1 件分） | 未着手 | 03 |
| TSK-13 | `Footer.astro` 作成（最終ビルド時刻・プロフィールリンク） | 未着手 | 03 |
| TSK-14 | `pages/index.astro` でデータ取得 → カード一覧描画 | 未着手 | 03 |
| TSK-15 | レスポンシブレイアウト（モバイル 1 カラム / PC 2〜3 カラム） | 未着手 | 03 |
| TSK-16 | 外部リンクに `rel="noopener noreferrer"` を付与 | 未着手 | 06 |

### Phase 4: CI / デプロイ（M3）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-17 | `.github/workflows/deploy.yml` 作成 | 未着手 | 09 |
| TSK-18 | cron 設定（`'0 16 * * *'`）+ push + workflow_dispatch | 未着手 | 02, 09 |
| TSK-19 | `permissions:` 最小権限設定（contents:read / pages:write / id-token:write） | 未着手 | 06 |
| TSK-20 | `actions/deploy-pages` でデプロイステップ追加 | 未着手 | 09 |
| TSK-21 | GitHub リポ設定で「Pages > Source: GitHub Actions」を有効化 | 未着手 | 09 |
| TSK-22 | Dependabot 設定ファイル `.github/dependabot.yml` 追加 | 未着手 | 06 |

### Phase 5: 検証・MVP リリース（M4）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-23 | ローカルで `npm run dev` 動作確認 | 未着手 | 08 |
| TSK-24 | ローカルで `npm run build` 成功確認 | 未着手 | 08 |
| TSK-25 | main にマージ → GitHub Actions 成功確認 | 未着手 | 08 |
| TSK-26 | `kojikawazu.github.io/my-github-index/` で表示確認（PC・モバイル） | 未着手 | 08 |
| TSK-27 | リポ更新後 → 翌日 01:00 の cron で反映されること確認 | 未着手 | 08 |

### Phase 6（任意・後回し）

| ID | タスク | 状態 | 関連仕様書 |
|----|--------|------|-----------|
| TSK-28 | CSP メタタグ追加 | 未着手 | 06 |
| TSK-29 | ダークモード対応（Tailwind `dark:` バリアント） | 未着手 | 03 |
| TSK-30 | OGP メタタグ（SNS シェア時の見た目） | 未着手 | - |

## スケジュール

- 個人プロジェクトのためタイムボックスは設けない
- Phase 順に着手し、Phase 完了ごとに動作確認する

## 進捗管理

- このファイルの「状態」列を `未着手 → 進行中 → 完了` で更新していく
- 大きな仕様変更があれば `docs/01〜09` を先に更新し、それからタスクを再編する
