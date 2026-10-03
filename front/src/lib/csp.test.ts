import { describe, expect, it } from "vitest";
import { CSP, CSP_DIRECTIVES } from "./csp";

describe("CSP", () => {
  describe("正常系", () => {
    it("全ディレクティブを '; ' 区切りの 1 行に連結する", () => {
      expect(CSP).toBe(
        "default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self'; " +
          "object-src 'none'; base-uri 'self'; form-action 'none'",
      );
    });
  });

  describe("異常系（ポリシーが緩められていない）", () => {
    it("JS を一切許可しない", () => {
      expect(CSP_DIRECTIVES["script-src"]).toBe("'none'");
    });

    it("インラインスタイル・eval を許可しない", () => {
      expect(CSP).not.toContain("'unsafe-inline'");
      expect(CSP).not.toContain("'unsafe-eval'");
    });
  });
});
