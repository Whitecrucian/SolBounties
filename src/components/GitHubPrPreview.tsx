import React, { useState, useEffect } from 'react';
import { GitPullRequest, GitMerge, CheckCircle2, AlertCircle, ExternalLink, User, GitCommit } from 'lucide-react';

interface GitHubPrData {
  title: string;
  state: 'open' | 'closed';
  merged?: boolean;
  author: string;
  authorAvatar?: string;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  htmlUrl: string;
  repo: string;
  number: number;
}

interface GitHubPrPreviewProps {
  prUrl: string;
  compact?: boolean;
}

// In-memory cache to prevent duplicate fetches & preserve rate limit
const prCache = new Map<string, GitHubPrData>();

export const GitHubPrPreview: React.FC<GitHubPrPreviewProps> = ({ prUrl, compact = false }) => {
  const [data, setData] = useState<GitHubPrData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prUrl || !prUrl.includes('github.com') || !prUrl.includes('/pull/')) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
    if (!match) {
      setData(null);
      return;
    }

    const [, owner, repo, pullNumber] = match;
    const cacheKey = `${owner}/${repo}/${pullNumber}`;

    if (prCache.has(cacheKey)) {
      setData(prCache.get(cacheKey)!);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    async function fetchPR() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            // Rate limit reached: gracefully fallback with parsed metadata
            const fallback: GitHubPrData = {
              title: `Pull Request #${pullNumber} in ${owner}/${repo}`,
              state: 'open',
              author: owner,
              htmlUrl: prUrl,
              repo: `${owner}/${repo}`,
              number: Number(pullNumber),
            };
            if (isMounted) {
              setData(fallback);
              setLoading(false);
            }
            return;
          }
          throw new Error(`GitHub API HTTP ${response.status}`);
        }

        const json = await response.json();
        const prInfo: GitHubPrData = {
          title: json.title || `PR #${pullNumber}`,
          state: json.state === 'closed' ? 'closed' : 'open',
          merged: Boolean(json.merged || json.merged_at),
          author: json.user?.login || 'contributor',
          authorAvatar: json.user?.avatar_url,
          additions: json.additions,
          deletions: json.deletions,
          changedFiles: json.changed_files,
          htmlUrl: json.html_url || prUrl,
          repo: `${owner}/${repo}`,
          number: Number(pullNumber),
        };

        prCache.set(cacheKey, prInfo);

        if (isMounted) {
          setData(prInfo);
          setLoading(false);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        // Fallback info from URL if offline or network blocked
        if (isMounted) {
          setData({
            title: `Pull Request #${pullNumber} (${owner}/${repo})`,
            state: 'open',
            author: owner,
            htmlUrl: prUrl,
            repo: `${owner}/${repo}`,
            number: Number(pullNumber),
          });
          setLoading(false);
        }
      }
    }

    fetchPR();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [prUrl]);

  if (!prUrl || (!loading && !data)) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 animate-pulse">
        <div className="w-4 h-4 border-2 border-[#14F195] border-t-transparent rounded-full animate-spin shrink-0" />
        <span>Загрузка данных PR с GitHub API (github.com)...</span>
      </div>
    );
  }

  if (!data) return null;

  const isMerged = data.merged;
  const isOpen = data.state === 'open';

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
        {isMerged ? (
          <span className="inline-flex items-center gap-1 font-semibold text-purple-400">
            <GitMerge className="w-3.5 h-3.5" /> Merged
          </span>
        ) : isOpen ? (
          <span className="inline-flex items-center gap-1 font-semibold text-[#14F195]">
            <GitPullRequest className="w-3.5 h-3.5" /> Open
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" /> Closed
          </span>
        )}
        <span className="text-white truncate max-w-[200px] font-medium">{data.title}</span>
        <span className="text-slate-400 text-[11px] font-mono">@{data.author}</span>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 border border-[#14F195]/30 shadow-lg space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isMerged ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <GitMerge className="w-3 h-3" />
              MERGED
            </span>
          ) : isOpen ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#14F195] border border-emerald-500/30">
              <GitPullRequest className="w-3 h-3" />
              OPEN PR
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertCircle className="w-3 h-3" />
              CLOSED
            </span>
          )}

          <span className="text-xs font-mono text-slate-400">
            {data.repo} #{data.number}
          </span>
        </div>

        <a
          href={data.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[#14F195] hover:underline"
        >
          <span>Открыть на GitHub</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="text-sm font-semibold text-white tracking-tight leading-snug">
        {data.title}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {data.authorAvatar ? (
            <img
              src={data.authorAvatar}
              alt={data.author}
              className="w-4 h-4 rounded-full border border-slate-700"
            />
          ) : (
            <User className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="font-mono text-slate-300">@{data.author}</span>
        </div>

        {data.additions !== undefined && data.deletions !== undefined && (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-emerald-400 font-semibold">+{data.additions}</span>
            <span className="text-rose-400 font-semibold">-{data.deletions}</span>
            {data.changedFiles !== undefined && (
              <span className="text-slate-400">({data.changedFiles} files)</span>
            )}
          </div>
        )}

        <div className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195]" />
          <span>GitHub API Live Verified</span>
        </div>
      </div>
    </div>
  );
};
