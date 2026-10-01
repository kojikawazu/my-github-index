---
description: ドキュメント更新・設計書管理ルール（影響マップ + opt-out の完了条件）
globs:
---

# ドキュメント

コード変更がドキュメント（CLAUDE.md / README.md / docs/）と乖離しないことを構造的に担保する。

## 完了条件（opt-out）

変更は、下記「影響マップ」の対応ドキュメントを**同一 PR 内で更新する**ことを完了条件とする。

- 更新不要と判断した場合は、**PR 説明にその理由を明記する**（省略＝未対応とみなす）。
- この乖離チェックは `/self-review` と `/pr-create` の確認対象に含まれる。

## 影響マップ（変更種別 → 更新必須ドキュメント）

「どのドキュメントだっけ？」を考えさせないための逆引き表。本プロジェクトは Astro 製の静的サイト（`front/`）を GitHub Pages へデプロイする構成。

| 変更種別 | 更新必須ドキュメント |
|---|---|
| 画面・UI コンポーネント・表示項目の追加/変更 | docs/03-functional-specification.md（必要に応じ docs/02-requirements-specification.md） |
| 機能要件・スコープの変更 | docs/02-requirements-specification.md / docs/03-functional-specification.md |
| GitHub API など外部データ取得・連携の変更 | docs/07-api-specification.md / docs/05-data-specification.md |
| データ構造・スキーマ・データフローの変更 | docs/05-data-specification.md |
| 技術スタック・ビルド/デプロイ（Astro 設定・GitHub Pages・CI）の変更 | docs/09-architecture-specification.md |
| パフォーマンス・可用性など非機能要件の変更 | docs/04-non-functional-specification.md |
| セキュリティ方針・公開範囲・依存更新方針（Dependabot 等）の変更 | docs/06-security-specification.md |
| テスト方針・テストケースの追加/変更 | docs/08-test-specification.md |
| タスク・進捗状況の変更 | docs/11-tasks.md |
| ディレクトリ構成・セットアップ手順・公開 URL などの変更 | README.md |
| ルール・開発フロー・運用ルールの追加/変更 | CLAUDE.md（ルールテーブル）/ 該当 `.claude/rules/*.md` |

該当する変更がない場合はスキップする。

## 補足

- **設計書の管理**: タスクごとに設計書を新規作成しない。既存の仕様書ドキュメント（docs/01〜11-*.md）に追記・更新する。
- 影響マップに当てはまらない雑多な変更は docs/10-miscellaneous-specification.md に記載する。
