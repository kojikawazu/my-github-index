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
| A06: Vulnerable Components | Dependabot alerts 有効化・lockfile commit・定期的に `npm audit` |
| A08: Software and Data Integrity | Actions は major version ピン留め（または SHA pinning） |
| A09: Logging Failures | Actions のログを定期確認、cron 失敗時は通知（要検討） |

### GitHub Actions のセキュリティ設定

```yaml
permissions:
  contents: read       # リポ読み取り
  pages: write         # Pages デプロイに必要
  id-token: write      # OIDC でのデプロイに必要
```

- 不要な権限は付与しない（書き込み権限はデフォルトで OFF にする）
- third-party action は使用しない（公式 `actions/*` のみ）

### 外部リンクの安全な記述

```astro
<a href={repo.html_url} target="_blank" rel="noopener noreferrer">
  {repo.name}
</a>
```

- `noopener`: 開いた先のページから `window.opener` 経由で元ページを操作されない
- `noreferrer`: リファラ情報を送信しない

### Content Security Policy（任意）

- GitHub Pages はカスタム HTTP ヘッダ設定ができないため、CSP は `<meta>` タグでの設定となる
- 外部 JS をロードしない設計のため CSP は緩めでも実害は少ないが、念のため設定検討

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https:; style-src 'self' 'unsafe-inline';">
```

## 受容するリスク（Accepted Risks）

セキュリティ監査で検出されたが、本プロジェクトの構成上影響しないものを明示的に記録する。

| 脆弱性 | 影響範囲 | 本プロジェクトへの影響 | 対応 |
|--------|---------|----------------------|------|
| Astro `define:vars` XSS（GHSA-j687-52p2-xcff） | `define:vars` を使うコード | **未使用のため影響なし** | Astro 5 のまま運用、6 系の互換性が安定したら upgrade 検討 |
| Astro server island replay（GHSA-xr5h-phrj-8vxv） | SSR + Server Islands を使うコード | **`output: 'static'` のため影響なし** | 同上 |
| yaml stack overflow（`yaml-language-server` 経由） | `@astrojs/check` の依存（dev 専用） | **本番ビルド成果物に含まれない**（IDE 補完用ツール） | 上流の `yaml-language-server` 修正待ち |

## 情報公開ポリシー

- このサイトには **public リポの公開情報のみ** を掲載
- 個人を特定する追加情報（メール・住所等）は載せない
- 表示するフィールドは「リポ名」「概要」「URL」のみに限定し、不必要な情報を露出させない
