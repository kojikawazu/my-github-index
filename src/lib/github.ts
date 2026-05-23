/**
 * GitHub REST API からリポジトリ一覧を取得し、表示用にフィルタ・整形する。
 * ビルド時にのみ呼び出される（クライアントには含まれない）。
 */

import { CATEGORIES, pickCategory, type Category, type CategoryKey } from "./categories";

const GITHUB_API_BASE = "https://api.github.com";

export type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  archived: boolean;
  updated_at: string;
  topics: string[];
};

export type DisplayRepo = {
  name: string;
  description: string;
  url: string;
  category: CategoryKey;
};

export type CategoryGroup = Category & {
  repos: DisplayRepo[];
};

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "my-github-index-builder",
  };
  // 認証があれば 60 req/hr → 5000 req/hr に拡張される。
  // ローカル: GITHUB_TOKEN=$(gh auth token) npm run build
  // CI: GitHub Actions の secrets.GITHUB_TOKEN を env で渡す
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * 指定ユーザーの public リポを全件取得する（ページング対応）。
 * GitHub API は per_page 最大 100。1 ユーザーで 100 件超は稀だが念のためページングする。
 */
async function fetchAllRepos(username: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=${perPage}&page=${page}`;
    const res = await fetch(url, { headers: buildHeaders() });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `GitHub API request failed: ${res.status} ${res.statusText}\n${body}`,
      );
    }

    const batch = (await res.json()) as GitHubRepo[];
    repos.push(...batch);

    if (batch.length < perPage) break;
    page += 1;

    if (page > 50) {
      throw new Error("Pagination exceeded safety limit (5000 repos)");
    }
  }

  return repos;
}

/**
 * fork と archived を除外し、表示用 4 フィールド（name/description/url/category）に整形する。
 * 並び順は API 取得時の sort=updated（updated_at 降順）を維持する。
 */
function filterAndShape(repos: GitHubRepo[]): DisplayRepo[] {
  return repos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      name: r.name,
      description: r.description ?? "",
      url: r.html_url,
      category: pickCategory(r.topics ?? []),
    }));
}

/**
 * DisplayRepo[] を CATEGORIES の順でグループ化する。
 * 空のカテゴリ（リポ 0 件）は結果から除外する。
 */
export function groupByCategory(repos: DisplayRepo[]): CategoryGroup[] {
  return CATEGORIES
    .map((cat) => ({
      ...cat,
      repos: repos.filter((r) => r.category === cat.key),
    }))
    .filter((g) => g.repos.length > 0);
}

/**
 * メインエクスポート。指定ユーザーの表示対象リポ一覧を返す。
 * ビルド時に index.astro 等から呼び出す。
 */
export async function getDisplayRepos(username: string): Promise<DisplayRepo[]> {
  const all = await fetchAllRepos(username);
  return filterAndShape(all);
}
