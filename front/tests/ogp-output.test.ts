/**
 * ビルド成果物（dist/index.html）の OGP / Twitter Card 検証。
 * `npm run build` の後に `npm run test:dist` で実行する。
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const DIST_HTML = fileURLToPath(new URL("../dist/index.html", import.meta.url));
const SITE_URL = "https://kojikawazu.github.io/my-github-index/";

let html: string;

beforeAll(() => {
  html = readFileSync(DIST_HTML, "utf-8");
});

function meta(attr: "property" | "name", key: string): string | undefined {
  return html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];
}

describe("dist/index.html の OGP", () => {
  describe("正常系", () => {
    it("og:url と canonical が base 付き・末尾スラッシュ付きの公開 URL になる", () => {
      expect(meta("property", "og:url")).toBe(SITE_URL);
      expect(html).toContain(`<link rel="canonical" href="${SITE_URL}">`);
    });

    it("og:title / og:description が <title> / meta description と一致する", () => {
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      const description = meta("name", "description");
      expect(title).toBe("My GitHub Index（整備中）");
      expect(meta("property", "og:title")).toBe(title);
      expect(meta("property", "og:description")).toBe(description);
    });

    it("og:type / og:locale / twitter:card が設定される", () => {
      expect(meta("property", "og:type")).toBe("website");
      expect(meta("property", "og:locale")).toBe("ja_JP");
      expect(meta("name", "twitter:card")).toBe("summary");
    });
  });

  describe("準正常系", () => {
    it("og:url が末尾スラッシュなし（GitHub Pages で 301 になる URL）になっていない", () => {
      expect(meta("property", "og:url")).not.toBe(SITE_URL.slice(0, -1));
    });

    it("og:url が localhost 等の開発用 URL になっていない", () => {
      expect(meta("property", "og:url")).not.toMatch(/localhost|127\.0\.0\.1/);
    });

    it("画像なし方針のため og:image / twitter:image を出力しない", () => {
      expect(meta("property", "og:image")).toBeUndefined();
      expect(meta("name", "twitter:image")).toBeUndefined();
    });
  });

  describe("異常系", () => {
    it("og:url が https の絶対 URL である（相対 URL や http はクローラーに解決されない）", () => {
      expect(meta("property", "og:url")).toMatch(/^https:\/\//);
    });

    it("OGP の各値が空文字になっていない", () => {
      for (const key of ["og:title", "og:description", "og:url", "og:site_name"]) {
        expect(meta("property", key)?.length ?? 0).toBeGreaterThan(0);
      }
    });
  });
});
