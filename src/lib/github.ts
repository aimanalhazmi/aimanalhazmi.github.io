export const PORTFOLIO_TOPIC = 'y-pub';
export const FEATURED_TOPIC = 'y-feat';

export type GitHubProject = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  repoUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  listed: boolean;
};

const TAG_CASING: Record<string, string> = {
  ai: 'AI',
  ml: 'ML',
  'deep-learning': 'Deep Learning',
  nlp: 'NLP',
  'computer-vision': 'Computer Vision',
  'data-science': 'Data Science',
  software: 'Software',
  backend: 'Backend',
  python: 'Python',
  java: 'Java',
  pytorch: 'PyTorch',
  flutter: 'Flutter',
  healthcare: 'Healthcare',
  finance: 'Finance',
  'open-source': 'Open Source',
};

function normalizeTag(topic: string): string {
  const key = topic.toLowerCase();
  if (TAG_CASING[key]) return TAG_CASING[key];
  return key
    .split('-')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function prettifyName(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => {
      const upper = w.toUpperCase();
      if (['ECG', 'NLP', 'AI', 'ML', 'API', 'CV', 'UI'].includes(upper)) return upper;
      return w[0].toUpperCase() + w.slice(1);
    })
    .join(' ');
}

type GhRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  private: boolean;
  created_at: string;
  pushed_at: string;
  language: string | null;
  stargazers_count: number;
};

function toProject(r: GhRepo): GitHubProject {
  const topics = r.topics ?? [];
  return {
    slug: r.name.toLowerCase(),
    title: prettifyName(r.name),
    description: r.description ?? '',
    tags: topics
      .filter((t) => t !== PORTFOLIO_TOPIC && t !== FEATURED_TOPIC)
      .map(normalizeTag),
    href: r.html_url,
    repoUrl: r.html_url,
    homepage: r.homepage && r.homepage.trim() ? r.homepage : null,
    language: r.language,
    stars: r.stargazers_count,
    createdAt: r.created_at,
    updatedAt: r.pushed_at,
    featured: topics.includes(FEATURED_TOPIC),
    listed: topics.includes(PORTFOLIO_TOPIC),
  };
}

const repoCache = new Map<string, Promise<GitHubProject[]>>();

export async function fetchUserRepos(user: string): Promise<GitHubProject[]> {
  const cached = repoCache.get(user);
  if (cached) return cached;
  const promise = fetchUserReposUncached(user);
  repoCache.set(user, promise);
  return promise;
}

async function fetchUserReposUncached(user: string): Promise<GitHubProject[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'aimanalhazmi.github.io-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=100&sort=updated`,
      { headers }
    );
    if (!res.ok) {
      console.warn(`[github] ${res.status} ${res.statusText} fetching repos for ${user}`);
      return [];
    }
    const repos = (await res.json()) as GhRepo[];
    return repos
      .filter((r) => !r.fork && !r.archived && !r.private)
      .map(toProject)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  } catch (err) {
    console.warn('[github] fetch failed, falling back to curated only:', err);
    return [];
  }
}

export async function fetchPortfolioRepos(user: string): Promise<GitHubProject[]> {
  return (await fetchUserRepos(user)).filter((r) => r.listed);
}
