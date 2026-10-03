# 08. テスト仕様書（Test Specification）

テスト戦略・テストケース・カバレッジ目標を定義する。

## テスト戦略

本プロジェクトはビルド時に GitHub API からデータを取得し、静的 HTML を生成するだけの構成。ロジックは `front/src/lib/` に集約されているため、**ユニットテストを主軸**とする。

| レベル | 対象 | 方針 |
|--------|------|------|
| ユニット（自動） | `front/src/lib/*.ts` の純粋ロジック・データ整形 | Vitest で網羅。外部 I/O（`fetch`）のみスタブし、ビジネスロジックはモックしない |
| 型チェック（自動） | `.astro` / `.ts` 全体 | `npm run check`（`astro check`）でエラー 0 件を維持 |
| ビルド（自動） | サイト全体 | `npm run build` の成功 = 実 API との結合確認を兼ねる |
| 表示確認（手動） | 公開ページ | デプロイ後に PC・モバイルで目視確認 |

- `.astro` コンポーネントは表示のみでロジックを持たないため、ユニットテストの対象外とする。
- E2E テストは、ページ 1 枚の静的サイトでは費用対効果が低いため導入しない。

## テストケース

分類の定義は `.claude/rules/testing.md` に従う（正常系 / 準正常系 / 異常系）。

### `pickCategory()`（`front/src/lib/categories.test.ts`）

| ID | 分類 | ケース概要 | 期待結果 |
|----|------|-----------|---------|
| T-01 | 正常系 | 定義済み topic が 1 つ一致 | そのカテゴリ |
| T-02 | 正常系 | 複数一致（`game` / `ai` / `personal-project`） | 定義順で先の `personal-project` |
| T-03 | 正常系 | `other` を明示 | `other` |
| T-04 | 準正常系 | topics が空 | `added` |
| T-05 | 準正常系 | 定義外の topic のみ | `added` |
| T-06 | 準正常系 | `added` topic + `game` | `game`（`added` は走査対象外） |
| T-07 | 準正常系 | 大文字の `AI` | `added`（大文字小文字を区別） |

### `groupByCategory()`（`front/src/lib/github.test.ts`）

| ID | 分類 | ケース概要 | 期待結果 |
|----|------|-----------|---------|
| T-08 | 正常系 | 複数カテゴリのリポ | `CATEGORIES` の定義順でグループ化 |
| T-09 | 準正常系 | リポ 0 件のカテゴリがある | そのカテゴリは結果に含めない |
| T-10 | 準正常系 | 入力が空 | `[]` |

### `getDisplayRepos()`（`front/src/lib/github.test.ts`、`fetch` をスタブ）

| ID | 分類 | ケース概要 | 期待結果 |
|----|------|-----------|---------|
| T-11 | 正常系 | 通常のレスポンス | name / description / url / category の 4 フィールドに整形 |
| T-12 | 正常系 | 1 ページ目が 100 件ちょうど | 2 ページ目も取得し結合 |
| T-13 | 準正常系 | fork / archived を含む | 除外される |
| T-14 | 準正常系 | `description: null` | `""` に変換 |
| T-15 | 準正常系 | `topics` が欠落 | `added` に分類 |
| T-16 | 準正常系 | `GITHUB_TOKEN` の有無 | ある時だけ `Authorization: Bearer` を付与 |
| T-17 | 異常系 | HTTP 403 | ステータスを含む例外（= ビルド失敗） |
| T-18 | 異常系 | 全ページが 100 件で返り続ける | 50 ページで打ち切り例外 |

比率: 正常系 6 : 準正常系 + 異常系 12（目安 1:2 を満たす）。

## カバレッジ目標

- 数値目標は設けない。`front/src/lib/` の**全 export 関数**について、正常系と主要な分岐（フォールバック・除外・エラー）をテストで押さえることを基準とする。
- 新しいロジックを `lib/` に追加する際は、同一 PR でテストケースを追加し、本書の表も更新する。

## テストツール

| 項目 | 採用 | 備考 |
|------|------|------|
| テストフレームワーク | Vitest | `npm test`（= `vitest run`）。設定ファイルなし |
| モック | Vitest 組み込み（`vi.stubGlobal` / `vi.stubEnv`） | `fetch` と環境変数のみ差し替える |
| 型定義 | `@types/node` | `process.env` の型解決用 |
| CI 統合 | GitHub Actions（`.github/workflows/ci.yml`） | `main` 向け PR ごとに check / test / build を実行。詳細は docs/09「CI（PR 時の品質ゲート）」 |
