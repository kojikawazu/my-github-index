import { describe, expect, it } from "vitest";
import { pickCategory } from "./categories";

describe("pickCategory", () => {
  describe("正常系", () => {
    it("定義済み topic が 1 つ一致すればそのカテゴリを返す", () => {
      expect(pickCategory(["learning"])).toBe("learning");
    });

    it("複数一致した場合は CATEGORIES の定義順で先のものを優先する", () => {
      // 定義順: personal-project < ai < game
      expect(pickCategory(["game", "ai", "personal-project"])).toBe("personal-project");
    });

    it('"other" を明示した場合は "other" を返す', () => {
      expect(pickCategory(["other"])).toBe("other");
    });
  });

  describe("準正常系", () => {
    it('topics が空なら "added" に落とす', () => {
      expect(pickCategory([])).toBe("added");
    });

    it('定義外の topic のみなら "added" に落とす', () => {
      expect(pickCategory(["astro", "typescript"])).toBe("added");
    });

    it('"added" topic は優先順位の走査対象外（後続の定義済み topic が勝つ）', () => {
      expect(pickCategory(["added", "game"])).toBe("game");
    });

    it("topic の大文字小文字は区別する", () => {
      expect(pickCategory(["AI"])).toBe("added");
    });
  });
});
