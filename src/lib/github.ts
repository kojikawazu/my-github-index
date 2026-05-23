/**
 * GitHub REST API からリポジトリ一覧を取得し、表示用にフィルタ・整形する。
 * ビルド時にのみ呼び出される（クライアントには含まれない）。
 */

const GITHUB_API_BASE = 'https://api.github.com';

export type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  archived: boolean;
  updated_at: string;
};

export type DisplayRepo = {
  name: string;
  description: string;
  url: string;
};

const REPO_HEADERS: HeadersInit = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'my-github-index-builder',
};

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
    const res = await fetch(url, { headers: REPO_HEADERS });

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
      throw new Error('Pagination exceeded safety limit (5000 repos)');
    }
  }

  return repos;
}

/**
 * fork と archived を除外し、表示用 3 フィールドだけに整形する。
 * 並び順は API 取得時の sort=updated（updated_at 降順）を維持する。
 */
function filterAndShape(repos: GitHubRepo[]): DisplayRepo[] {
  return repos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      name: r.name,
      description: r.description ?? '',
      url: r.html_url,
    }));
}

/**
 * メインエクスポート。指定ユーザーの表示対象リポ一覧を返す。
 * ビルド時に index.astro 等から呼び出す。
 */
export async function getDisplayRepos(username: string): Promise<DisplayRepo[]> {
  const all = await fetchAllRepos(username);
  return filterAndShape(all);
}
