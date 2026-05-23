# 02. 要件仕様書（Requirements Specification）

「何を満たせば完成と言えるか」を機能単位で定義する。

## 機能要件一覧

| ID | 機能名 | 概要 | 優先度 |
|----|--------|------|--------|
| F-01 | リポジトリ一覧表示 | public リポジトリを一覧で表示（リポ名・概要・URL） | High |
| F-02 | リポジトリリンク | 一覧の各リポをクリックで GitHub の該当リポへ遷移 | High |
| F-03 | 定期再ビルド | GitHub Actions の cron で定期的にデータ再取得・再デプロイ | High |
| F-04 | レスポンシブ表示 | PC・モバイル両対応のレイアウト | Mid |

## 受け入れ条件（Acceptance Criteria）

### F-01: リポジトリ一覧表示

- 自分の public リポジトリが全件表示される
- 各リポジトリについて以下が表示される
  - リポ名
  - 概要（description が空の場合は空欄表示でよい）
  - リポ URL（または URL をクリック先として保持）
- **fork リポジトリは除外**（GitHub API レスポンスの `fork: true` を除外、または `type=owner` を使用）
- **archived リポジトリは除外**（GitHub API レスポンスの `archived: true` を除外）

### F-02: リポジトリリンク

- リポ名またはカード全体クリックで GitHub のリポページへ遷移
- 新規タブで開く（`target="_blank"` + `rel="noopener noreferrer"`）

### F-03: 定期再ビルド

- 毎日 **JST 01:00**（UTC 16:00）に GitHub Actions が起動
- GitHub API からリポジトリ一覧を取得 → 静的 HTML を生成 → Pages に反映される
- 失敗時は GitHub Actions のログで検知できる
- `workflow_dispatch` による手動実行も可能

### F-04: レスポンシブ表示

- スマホ（375px〜）でレイアウト崩れがない
- PC（1280px〜）でも読みやすい

## 優先度・MVP 定義

**MVP**: F-01, F-02, F-03

- まずは「自分の public リポが一覧で見える + リンクで飛べる + 自動更新される」を最短で達成する
- F-04（レスポンシブ）は MVP リリース後に必要に応じて追加
- 検索機能は本プロジェクトのスコープ外とする（リポ件数が少ないため不要と判断）
