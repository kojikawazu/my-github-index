import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDisplayRepos, groupByCategory, type DisplayRepo, type GitHubRepo } from "./github";

function repo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    name: "repo",
    description: "desc",
    html_url: "https://github.com/kojikawazu/repo",
    fork: false,
    archived: false,
    updated_at: "2026-10-01T00:00:00Z",
    topics: [],
    ...overrides,
  };
}

function display(name: string, category: DisplayRepo["category"]): DisplayRepo {
  return { name, description: "", url: `https://github.com/kojikawazu/${name}`, category };
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("groupByCategory", () => {
  describe("正常系", () => {
    it("CATEGORIES の定義順でグループ化する", () => {
      const groups = groupByCategory([
        display("g", "game"),
        display("p", "profile"),
        display("l", "learning"),
        display("l2", "learning"),
      ]);
      expect(groups.map((g) => g.key)).toEqual(["profile", "learning", "game"]);
      expect(groups[1].label).toBe("学習");
      expect(groups[1].repos.map((r) => r.name)).toEqual(["l", "l2"]);
    });
  });

  describe("準正常系", () => {
    it("リポ 0 件のカテゴリは結果に含めない", () => {
      const groups = groupByCategory([display("a", "ai")]);
      expect(groups).toHaveLength(1);
      expect(groups[0].key).toBe("ai");
    });

    it("入力が空なら空配列を返す", () => {
      expect(groupByCategory([])).toEqual([]);
    });
  });
});

describe("getDisplayRepos", () => {
  // 外部 I/O（GitHub API への HTTP 通信）のみスタブする
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.stubEnv("GH_TOKEN", "");
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe("正常系", () => {
    it("表示用の 4 フィールドに整形する", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse([repo({ name: "a", description: "hello", topics: ["learning"] })]),
      );

      expect(await getDisplayRepos("kojikawazu")).toEqual([
        {
          name: "a",
          description: "hello",
          url: "https://github.com/kojikawazu/repo",
          category: "learning",
        },
      ]);
    });

    it("1 ページが per_page(100) 件ちょうどなら次ページも取得する", async () => {
      const page1 = Array.from({ length: 100 }, (_, i) => repo({ name: `r${i}` }));
      fetchMock
        .mockResolvedValueOnce(jsonResponse(page1))
        .mockResolvedValueOnce(jsonResponse([repo({ name: "last" })]));

      const result = await getDisplayRepos("kojikawazu");

      expect(result).toHaveLength(101);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(String(fetchMock.mock.calls[1][0])).toContain("page=2");
    });
  });

  describe("準正常系", () => {
    it("fork と archived のリポを除外する", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse([
          repo({ name: "keep" }),
          repo({ name: "forked", fork: true }),
          repo({ name: "old", archived: true }),
        ]),
      );

      const result = await getDisplayRepos("kojikawazu");

      expect(result.map((r) => r.name)).toEqual(["keep"]);
    });

    it('description が null なら "" に変換する', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse([repo({ description: null })]));

      const [result] = await getDisplayRepos("kojikawazu");

      expect(result.description).toBe("");
    });

    it('topics が欠落していれば "added" に分類する', async () => {
      const { topics: _omit, ...withoutTopics } = repo();
      fetchMock.mockResolvedValueOnce(jsonResponse([withoutTopics]));

      const [result] = await getDisplayRepos("kojikawazu");

      expect(result.category).toBe("added");
    });

    it("トークンがあるときだけ Authorization ヘッダを付与する", async () => {
      fetchMock.mockImplementation(async () => jsonResponse([]));

      await getDisplayRepos("kojikawazu");
      vi.stubEnv("GITHUB_TOKEN", "test-token");
      await getDisplayRepos("kojikawazu");

      const headersOf = (n: number) =>
        fetchMock.mock.calls[n][1]?.headers as Record<string, string>;
      expect(headersOf(0).Authorization).toBeUndefined();
      expect(headersOf(1).Authorization).toBe("Bearer test-token");
    });
  });

  describe("異常系", () => {
    it("HTTP エラー時はステータスを含む例外を投げる", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response("rate limited", { status: 403, statusText: "Forbidden" }),
      );

      await expect(getDisplayRepos("kojikawazu")).rejects.toThrow(
        "GitHub API request failed: 403 Forbidden",
      );
    });

    it("ページング上限（50 ページ）を超えたら例外を投げる", async () => {
      const fullPage = Array.from({ length: 100 }, () => repo());
      fetchMock.mockImplementation(async () => jsonResponse(fullPage));

      await expect(getDisplayRepos("kojikawazu")).rejects.toThrow(
        "Pagination exceeded safety limit",
      );
      expect(fetchMock).toHaveBeenCalledTimes(50);
    });
  });
});
