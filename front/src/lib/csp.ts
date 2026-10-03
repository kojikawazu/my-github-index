/**
 * Content Security Policy（本番ビルドの <meta http-equiv> に出力する）。
 *
 * GitHub Pages はカスタム HTTP ヘッダを設定できないため meta タグで指定する。
 * 出力 HTML は JS なし・インラインスタイルなし・自サイト CSS 1 枚のみのため最も厳しく絞る。
 * JS や外部リソースを追加する場合はここを見直すこと（docs/06「Content Security Policy」）。
 */
export const CSP_DIRECTIVES: Readonly<Record<string, string>> = {
  "default-src": "'self'",
  "script-src": "'none'",
  "style-src": "'self'",
  "img-src": "'self'",
  "object-src": "'none'",
  "base-uri": "'self'",
  "form-action": "'none'",
};

export const CSP = Object.entries(CSP_DIRECTIVES)
  .map(([directive, value]) => `${directive} ${value}`)
  .join("; ");
