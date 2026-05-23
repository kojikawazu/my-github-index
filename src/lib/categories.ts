/**
 * リポジトリのカテゴリ定義。
 *
 * - GitHub の Topic 名（`key`）と UI 表示名（`label`）を対応付ける
 * - 配列の並び順がそのままセクションの表示順
 * - "other" は「定義済み topic が一つも付いていない」ものを集めるための特別枠
 */

export type CategoryKey =
  | "profile"
  | "added"
  | "personal-project"
  | "info-tool"
  | "tech-article"
  | "learning"
  | "ai"
  | "ai-experiment"
  | "algorithm"
  | "game"
  | "pending"
  | "other";

export type Category = {
  key: CategoryKey;
  label: string;
};

export const CATEGORIES: readonly Category[] = [
  { key: "profile", label: "プロフィール" },
  { key: "added", label: "追加分" },
  { key: "personal-project", label: "個人開発" },
  { key: "info-tool", label: "情報集約用" },
  { key: "tech-article", label: "技術記事" },
  { key: "learning", label: "学習" },
  { key: "ai", label: "AI" },
  { key: "ai-experiment", label: "AI検証用" },
  { key: "algorithm", label: "アルゴリズム" },
  { key: "game", label: "ゲーム" },
  { key: "pending", label: "保留" },
  { key: "other", label: "その他" },
] as const;

/**
 * topics 配列から主カテゴリを 1 つ決める。
 * CATEGORIES の定義順で走査し、最初に一致した topic を採用する。
 * どの定義済み topic にもマッチしない場合は "added"（追加分）に落とす。
 * （= 新規リポは自動的に「追加分」セクションに集まり、トリアージ漏れを防ぐ）
 */
export function pickCategory(topics: readonly string[]): CategoryKey {
  for (const cat of CATEGORIES) {
    if (cat.key === "added") continue;
    if (topics.includes(cat.key)) return cat.key;
  }
  return "added";
}
