import { useEffect, useState } from 'react';

const REPO = 'southwellmedia/velocity';
const CACHE_KEY = 'gh-stars';
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

interface CacheEntry {
  count: number;
  ts: number;
}

function getCached(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts < CACHE_TTL) return entry.count;
  } catch { /* ignore */ }
  return null;
}

function setCache(count: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ count, ts: Date.now() }));
  } catch { /* ignore */ }
}

export default function GitHubStars() {
  const [stars, setStars] = useState<number | null>(getCached);

  useEffect(() => {
    if (stars !== null) return; // already have cached value
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count);
          setCache(data.stargazers_count);
        }
      })
      .catch(() => { /* fail silently */ });
  }, []);

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors duration-300"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Star on GitHub
      {stars !== null && (
        <span className="ml-1 inline-flex items-center rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium tabular-nums">
          {stars.toLocaleString()}
        </span>
      )}
    </a>
  );
}
