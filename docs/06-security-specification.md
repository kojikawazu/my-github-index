# 06. セキュリティ仕様書（Security Specification）

認証・認可・データ保護・脆弱性対策を定義する。

## 脅威モデル

本プロジェクトは **静的サイト + ビルド時 API 取得** という構成のため、攻撃面は小さい。
主に意識すべきは以下：

| 脅威 | 影響 | 対策 |
|------|------|------|
| API トークン漏洩 | レート制限突破・将来 private 版での情報漏洩 | クライアントコードに一切含めない（build-time のみ使用） |
| XSS（リポ説明文経由） | 訪問者ブラウザでの任意 JS 実行 | Astro のデフォルトエスケープを信頼・`set:html` は禁止 |
| 悪意ある外部リンク（tabnabbing） | リンクから親ウィンドウ操作 | `target="_blank"` には `rel="noopener noreferrer"` 必須 |
| 依存パッケージの脆弱性 | サプライチェーン攻撃 | Dependabot 有効化・lockfile コミット |
| GitHub Actions の権限過多 | ワークフロー乗っ取り時の被害拡大 | `permissions:` で最小権限のみ付与 |
| Actions の third-party action 改ざん | ビルド中の任意コード実行 | 公式 action のみ使用・major version でピン留め |

## 認証（Authentication）

- 本プロジェクト（public リポのみ）では **認証なし**
- GitHub REST API は無認証で 60 req/hr 利用可能。ビルド時のみ・1 ユーザーぶん取得なので十分
- ビルド時に GitHub Actions のデフォルト `GITHUB_TOKEN` を使う場合も可（5000 req/hr に拡張）。ただしリポ作成者の権限で動作するためスコープに注意

### 将来の private リポ版（別プロジェクト）について

- private リポ取得には **PAT（Personal Access Token）** が必須
- PAT は **GitHub Secrets** に格納（`${{ secrets.GH_PAT }}` で参照）
- PAT を JS バンドルに含めない・コミット履歴に残さない・ログに出力しない
- スコープは **最小限**：`repo` の中でも必要な権限だけ（Fine-grained PAT 推奨）

## 認可（Authorization）

- 訪問者は全員「閲覧のみ」（書き込み操作なし）
- 管理者操作は GitHub Actions の `workflow_dispatch` 経由のみ → GitHub の権限管理に委譲

## 暗号化

- 通信：GitHub Pages はデフォルトで HTTPS（TLS 1.2+）
- 保存データ：表示するデータはすべて public な GitHub リポ情報のため、追加の暗号化は不要

## シークレット管理

- 本プロジェクト（public 版）では **シークレット不要**（無認証 API 利用）
- もし将来 PAT を使う場合：
  - `Settings > Secrets and variables > Actions` で登録
  - `.env` ファイルは `.gitignore` で除外（誤コミット防止）
  - ローテーション：PAT は **90 日ごと** に再発行
  - Fine-grained PAT を優先（リポ単位・スコープ単位で絞れる）

## 脆弱性対策

### OWASP Top 10 対策（静的サイトに該当する範囲）

| 項目 | 対策 |
|------|------|
| A03: Injection（XSS） | Astro デフォルトエスケープ・`set:html` 禁止 |
| A05: Security Misconfiguration | GitHub Actions の `permissions:` 最小化・Pages 設定の確認 |
| A06: Vulnerable Components | Dependabot alerts / security updates 有効化（リポジトリ設定）・lockfile commit・定期的に `npm audit` |
| A08: Software and Data Integrity | Actions は major version ピン留め（または SHA pinning） |
| A09: Logging Failures | Actions のログを定期確認、cron 失敗時は通知（要検討） |

### GitHub Actions のセキュリティ設定

```yaml
# deploy.yml
permissions:
  contents: read       # リポ読み取り
  pages: write         # Pages デプロイに必要
  id-token: write      # OIDC でのデプロイに必要

# ci.yml（PR 時の secret scan / check / test / build）
permissions:
  contents: read       # 読み取りのみ
```

- 不要な権限は付与しない（書き込み権限はデフォルトで OFF にする）
- third-party action は使用しない（公式 `actions/*` のみ）
- `ci.yml` は `pull_request` トリガー（`pull_request_target` は使わない）。fork からの PR にはシークレットが渡らず、トークンも読み取り専用になる

### リポジトリ設定（Rulesets / Secret scanning）

GitHub 側の設定で「マージ前に止める」を強制する。

| 設定 | 内容 |
|------|------|
| Ruleset `main`（Active・bypass なし） | ブランチ削除禁止 / force push 禁止 / PR 必須 |
| └ 必須ステータスチェック | `Secret scan` / `Check / Test / Build`（GitHub Actions）。`strict`（最新化必須）は OFF |
| Secret scanning / Push protection | 有効。ファイル**内容**のトークン形式を push 時に検出（`secret-scan` ジョブのファイル**名**検出と相互補完） |

- 必須チェック名は `ci.yml` のジョブ `name:` と一致させる。ジョブ名を変更する場合は Ruleset も同時に更新する（不一致だと `pending` のままマージ不能になる）。
- `ci.yml` を `paths` / `paths-ignore` で絞らない（同上の理由）。

### 秘匿ファイルの混入検出（Secret scan）

`.gitignore` は未追跡ファイルにしか効かず（`git add -f` や書き漏れは止められない）、一度 push した秘匿情報は履歴に残り続ける。公開リポジトリでは対処が鍵・トークンの**ローテーションしかない**ため、`ci.yml` の `secret-scan` ジョブで「追跡された時点で落とす」。

| 区分 | パターン |
|------|---------|
| 検出（鍵） | `*.key` / `*.pem` / `*.p12` / `*.pfx` / `*.jks` / `*.keystore` / `id_rsa` / `id_ed25519` / `id_dsa` / `credentials.json` / `serviceAccountKey.json` |
| 検出（環境変数） | `.env` / `.env.*`（`.env.local`, `.env.production` 等） |
| 除外（誤検知防止） | `*.example` / `*.sample` / `*.template` / `*.dist` / `*.env.d.ts` |

- 導入時点（2026-10）で全履歴を走査済み、実シークレットの混入は 0 件（Issue #19）。
- 検出対象はファイル名のみ。ファイル内容へのトークン直書きは `/pr-create` の差分スキャンで確認する。

### 外部リンクの安全な記述

```astro
<a href={repo.html_url} target="_blank" rel="noopener noreferrer">
  {repo.name}
</a>
```

- `noopener`: 開いた先のページから `window.opener` 経由で元ページを操作されない
- `noreferrer`: リファラ情報を送信しない

### Content Security Policy

- GitHub Pages はカスタム HTTP ヘッダを設定できないため、`<meta http-equiv="Content-Security-Policy">` で設定する（`Layout.astro`）。
- ポリシーの正本は `front/src/lib/csp.ts`。出力 HTML は **JS なし・インラインスタイルなし・自サイト CSS 1 枚のみ**のため、最も厳しく絞る。

```
default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self';
object-src 'none'; base-uri 'self'; form-action 'none'
```

| ディレクティブ | 値 | 理由 |
|---|---|---|
| `script-src` | `'none'` | JS を一切出力しない。XSS の最強の緩和策 |
| `style-src` | `'self'` | インラインスタイル 0 件のため `'unsafe-inline'` 不要 |
| `img-src` | `'self'` | 外部画像を読み込まない |
| `object-src` / `form-action` | `'none'` | プラグイン・フォーム送信なし |
| `base-uri` | `'self'` | `<base>` 注入による相対 URL 乗っ取りを防ぐ |

- **本番ビルドのみ出力**（`import.meta.env.PROD`）。dev サーバは Vite HMR のスクリプト・インラインスタイルを注入するため、CSP を効かせると開発できなくなる。
- meta CSP は `frame-ancestors` / `report-uri` / `sandbox` を指定できない（HTTP ヘッダ専用）。
- `npm run test:dist`（CI の `Dist test`）で、CSP の出力と出力 HTML のポリシー違反（`<script>`・インラインスタイル・外部リソース）がないことを検証する。
- **JS・外部フォント・外部画像等を追加する場合は `csp.ts` を見直すこと**（そのままでは読み込みがブロックされる）。

## 受容するリスク（Accepted Risks）

セキュリティ監査で検出されたが、本プロジェクトの構成上影響しないものを明示的に記録する。

**前提**: 出力は `output: 'static'` の HTML 1 枚（JS なし・画像なし）で、サーバー実行環境を持たない。ビルドは CI 上で自分の GitHub リポ情報のみを入力に実行する。

### 2026-10-03 監査（`npm audit`）

`npm audit fix`（semver 範囲内のロックファイル更新）で 16 件 → 4 件に低減。残り 4 件はいずれも修正版が **Astro 7 系（メジャー 2 段）** の依存にしかなく、以下の理由で受容する。

| 脆弱性 | 影響範囲 | 本プロジェクトへの影響 | 対応 |
|--------|---------|----------------------|------|
| `astro`（critical、10 件の advisory） | 下記の各機能 | **該当機能をすべて未使用のため影響なし** | Astro 5 系で運用継続。メジャー移行は 09「Astro 6 移行の検証記録」の再検証の目安に従う |
| └ XSS 系: `define:vars`（GHSA-j687-52p2-xcff）/ spread 属性（GHSA-jrpj-wcv7-9fh9, GHSA-f48w-9m4c-m7f5）/ `transition:*`・View Transitions（GHSA-7pw4-f3q4-r2p2, GHSA-4g3v-8h47-v7g6）/ slot 名（GHSA-8hv8-536x-4wqp） | 各ディレクティブ・spread props・名前付き slot を使うコード | `src/` で未使用（grep 確認済み）。加えて CSP `script-src 'none'` で JS 実行自体を遮断 | 同上 |
| └ SSR 系: Server Islands replay（GHSA-xr5h-phrj-8vxv）/ Host header SSRF（GHSA-2pvr-wf23-7pc7）/ base 除去の認可バイパス（GHSA-376h-93r7-7g6f） | SSR・ミドルウェア・サーバー実行時 | `output: 'static'`・アダプターなしのため該当なし | 同上 |
| └ AVIF 画像最適化の RCE（GHSA-26w7-cxv4-gfx2） | `astro:assets` で画像を最適化するコード | 画像を一切扱わない | 同上 |
| `sharp`（high） | 画像処理（`astro:assets`） | 画像処理を実行しない（依存として入るのみ） | 同上 |
| `http-cache-semantics`（high） | リモート画像・SSR のキャッシュ処理 | 該当処理なし | 同上 |
| `esbuild`（low） | **Windows** で dev サーバー起動時の任意ファイル読み取り | 開発環境は macOS、CI は Linux。dev サーバーは localhost のみ | 同上 |

- **新たに受容する場合の条件**: 本番出力（静的 HTML）にもビルド入力にも影響しないことを確認し、この表に追記する。
- **再評価のタイミング**: 該当機能（JS・画像・SSR・`define:vars` 等）を使い始める場合、またはメジャー移行時。

## 情報公開ポリシー

- このサイトには **public リポの公開情報のみ** を掲載
- 個人を特定する追加情報（メール・住所等）は載せない
- 表示するフィールドは「リポ名」「概要」「URL」のみに限定し、不必要な情報を露出させない
