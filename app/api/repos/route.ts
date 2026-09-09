type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork?: boolean;
};

const GITHUB_REPOS_URL =
  "https://api.github.com/users/harmanhanjra/repos?sort=updated&per_page=12&type=owner";

export const revalidate = 900;

function isRepo(value: unknown): value is Repo {
  if (!value || typeof value !== "object") return false;
  const repo = value as Partial<Repo>;
  return (
    typeof repo.name === "string" &&
    typeof repo.html_url === "string" &&
    (repo.description === null || typeof repo.description === "string") &&
    (repo.language === null || typeof repo.language === "string") &&
    typeof repo.stargazers_count === "number"
  );
}

export async function GET() {
  try {
    const response = await fetch(GITHUB_REPOS_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "harman-ai-systems-command-center",
      },
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return Response.json({ repos: [] });
    }

    const payload: unknown = await response.json();
    const repos = Array.isArray(payload)
      ? payload
          .filter(isRepo)
          .filter((repo) => !repo.fork)
          .slice(0, 6)
          .map(({ name, html_url, description, language, stargazers_count }) => ({
            name,
            html_url,
            description,
            language,
            stargazers_count,
          }))
      : [];

    return Response.json({ repos });
  } catch {
    return Response.json({ repos: [] });
  }
}
