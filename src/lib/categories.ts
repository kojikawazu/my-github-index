/**
 * リポジトリのカテゴリ定義。
 *
 * - GitHub の Topic 名（`key`）と UI 表示名（`label`）を対応付ける
 * - 配列の並び順がそのままセクションの表示順
 * - "other" は「定義済み topic が一つも付いていない」ものを集めるための特別枠
 */

export type CategoryKey =
  | "profile"
  | "personal-project"
  | "tech-article"
  | "learning"
  | "ai"
  | "algorithm"
  | "other";

export type Category = {
  key: CategoryKey;
  label: string;
};

export const CATEGORIES: readonly Category[] = [
  { key: "profile", label: "プロフィール" },
  { key: "personal-project", label: "個人開発" },
  { key: "tech-article", label: "技術記事" },
  { key: "learning", label: "学習" },
  { key: "ai", label: "AI" },
  { key: "algorithm", label: "アルゴリズム" },
  { key: "other", label: "その他" },
] as const;

/**
 * topics 配列から主カテゴリを 1 つ決める。
 * CATEGORIES の定義順で走査し、最初に一致したものを採用する。
 * （GitHub Topic の付与順序に依存しない・複数該当時の挙動が決定的）
 */
export function pickCategory(topics: readonly string[]): CategoryKey {
  for (const cat of CATEGORIES) {
    if (cat.key === "other") continue;
    if (topics.includes(cat.key)) return cat.key;
  }
  return "other";
}
