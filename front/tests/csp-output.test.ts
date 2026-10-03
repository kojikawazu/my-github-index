/**
 * ビルド成果物（dist/index.html）の検証。`npm run build` の後に `npm run test:dist` で実行する。
 * CSP が本番 HTML に出力され、かつ出力 HTML 自体がそのポリシーに違反しないことを確認する。
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { CSP } from "../src/lib/csp";

const DIST_HTML = fileURLToPath(new URL("../dist/index.html", import.meta.url));

let html: string;

beforeAll(() => {
  html = readFileSync(DIST_HTML, "utf-8");
});

function cspMetaContent(source: string): string | undefined {
  return source.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/)?.[1];
}

describe("dist/index.html の CSP", () => {
  describe("正常系", () => {
    it("CSP meta タグが lib/csp.ts の定義どおりに出力される", () => {
      expect(cspMetaContent(html)).toBe(CSP);
    });

    it("CSP meta タグはスタイルシートより前に出力される（meta CSP は後続リソースにのみ効く）", () => {
      const metaIndex = html.indexOf('http-equiv="Content-Security-Policy"');
      const stylesheetIndex = html.indexOf('rel="stylesheet"');
      expect(metaIndex).toBeGreaterThan(-1);
      expect(stylesheetIndex).toBeGreaterThan(metaIndex);
    });
  });

  describe("準正常系（出力 HTML がポリシーに違反しない）", () => {
    it("<script> を含まない（script-src 'none'）", () => {
      expect(html).not.toMatch(/<script[\s>]/i);
    });

    it("インラインスタイル（style 属性・<style>）を含まない（style-src 'self'）", () => {
      expect(html).not.toMatch(/\sstyle="/i);
      expect(html).not.toMatch(/<style[\s>]/i);
    });

    it("スタイルシート・画像は自サイト（相対 / ルート相対パス）からのみ読み込む", () => {
      const srcs = [...html.matchAll(/<(?:link|img)\b[^>]*\b(?:href|src)="([^"]+)"/gi)].map(
        (m) => m[1],
      );
      expect(srcs.length).toBeGreaterThan(0);
      for (const src of srcs) {
        expect(src).toMatch(/^\/(?!\/)/);
      }
    });
  });

  describe("異常系（ポリシーが緩められていない）", () => {
    it("'unsafe-inline' / 'unsafe-eval' を含まない", () => {
      const content = cspMetaContent(html) ?? "";
      expect(content).not.toContain("'unsafe-inline'");
      expect(content).not.toContain("'unsafe-eval'");
    });

    it("ワイルドカードやスキーム全許可（*, https:, data:）を含まない", () => {
      const content = cspMetaContent(html) ?? "";
      expect(content).not.toMatch(/(^|\s)(\*|https:|http:|data:)(;|\s|$)/);
    });
  });
});
