import React, { useState } from 'react';
import { ProofOfCodeRecord, UserSession } from '../types';
import { 
  ShieldCheck, GitPullRequest, ExternalLink, Search, 
  Copy, Check, Share2, Sparkles, Filter, Award, Code2, CheckCircle2, User 
} from 'lucide-react';
import { PublicUserQuery } from './PublicUserProfileModal';
import { ShareToTwitterButton } from './ShareToTwitterButton';

interface ProofOfCodeViewProps {
  records: ProofOfCodeRecord[];
  session: UserSession;
  onViewExplorer: (txHash: string) => void;
  onOpenUserProfile?: (query: PublicUserQuery) => void;
}

export const ProofOfCodeView: React.FC<ProofOfCodeViewProps> = ({
  records,
  session,
  onViewExplorer,
  onOpenUserProfile,
}) => {
  const [selectedDev, setSelectedDev] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  // Collect unique devs and tags
  const devs = Array.from(new Set(records.map(r => r.devName)));
  const allTags = Array.from(new Set(records.flatMap(r => r.tags)));

  // Filter records
  const filteredRecords = records.filter(r => {
    if (selectedDev !== 'all' && r.devName !== selectedDev) return false;
    if (selectedTag !== 'all' && !r.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.taskTitle.toLowerCase().includes(q);
      const matchRepo = r.repoName.toLowerCase().includes(q);
      const matchDev = r.devName.toLowerCase().includes(q);
      const matchTx = r.solanaTxHash.toLowerCase().includes(q);
      if (!matchTitle && !matchRepo && !matchDev && !matchTx) return false;
    }
    return true;
  });

  // Calculate totals for active developer or global
  const activeRecords = selectedDev === 'all' 
    ? records 
    : records.filter(r => r.devName === selectedDev);
  const totalEarnedSOL = activeRecords.reduce((acc, r) => acc + r.rewardSOL, 0);
  const totalEarnedUSDC = activeRecords.reduce((acc, r) => acc + r.rewardUSDC, 0);

  const handleCopyTx = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const handleSharePortfolio = () => {
    const url = window.location.origin + '?portfolio=' + (selectedDev === 'all' ? session.devName : selectedDev);
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleCopyReadmeBadge = () => {
    const badgeMarkdown = `[![Proof of Code Verified](https://img.shields.io/badge/Proof_of_Code-Verified_on_Solana-14F195?style=flat-square&logo=solana)](https://solbounties.dev/p/${selectedDev === 'all' ? session.devName : selectedDev})`;
    navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Concept Explanation */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0F172A] to-[#090D16] p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#14F195]">
            <ShieldCheck className="w-4 h-4" />
            <span>Верифицированное ончейн-резюме</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Proof of Code / Dev Portfolio
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Когда разработчик выполняет таск, запись о решенной задаче (вместе со ссылкой на GitHub Pull Request) сохраняется в его ончейн-профиле на Solana через смарт-контракт Escrow. Это превращается в верифицированное портфолио разработчика, которое <span className="text-white font-medium">невозможно подделать</span>.
          </p>
        </div>

        {/* Developer stats header banner */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400">Верифицировано PRs</div>
            <div className="font-mono text-2xl font-bold text-white tabular-nums mt-0.5">
              {activeRecords.length}
            </div>
            <div className="text-[11px] text-slate-500">В реестре Solana</div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Заработано в SOL</div>
            <div className="font-mono text-2xl font-bold text-[#14F195] tabular-nums mt-0.5">
              {totalEarnedSOL.toFixed(1)} SOL
            </div>
            <div className="text-[11px] text-slate-500">≈ ${totalEarnedUSDC} USDC</div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Репутация Devnet</div>
            <div className="text-base font-semibold text-purple-300 mt-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#9945FF]" />
              <span>Verified Anchor Dev</span>
            </div>
            <div className="text-[11px] text-slate-500">Tier 1 · Smart Contracts</div>
          </div>

          <div className="flex flex-col justify-end gap-2">
            <button
              onClick={handleSharePortfolio}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Ссылка скопирована' : 'Поделиться профилем'}</span>
            </button>

            <button
              onClick={handleCopyReadmeBadge}
              className="inline-flex items-center justify-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Скопировать Markdown-бейдж для GitHub README"
            >
              {copiedBadge ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3" />}
              <span>{copiedBadge ? 'Бейдж скопирован!' : 'GitHub README бейдж'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Developer selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Dev filter segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedDev('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedDev === 'all'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Все разработчики ({records.length})
          </button>
          {devs.map(dev => (
            <button
              key={dev}
              onClick={() => setSelectedDev(dev)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedDev === dev
                  ? 'bg-slate-800 text-[#14F195] font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              @{dev}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, PR, репозиторию..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-[#9945FF] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Skill Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Теги:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              selectedTag === 'all' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Все
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === tag ? 'text-[#14F195] bg-slate-800 font-semibold' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Proof of Code Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#0F172A]/40">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">Записи не найдены</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              По выбранным критериям поиска нет верифицированных Proof of Code записей.
            </p>
          </div>
        ) : (
          filteredRecords.map((item) => (
            <div 
              key={item.id}
              className="bg-[#0F172A] border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 transition-all shadow-xs space-y-3"
            >
              {/* Top row: Developer, Timestamp, Onchain Verification */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[11px] text-[#14F195] font-bold">
                    {item.devName.slice(0, 2).toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenUserProfile) {
                        onOpenUserProfile({
                          login: item.devName.replace(/^@/, ''),
                          name: item.devName,
                          wallet: item.devWallet,
                          role: 'developer',
                        });
                      }
                    }}
                    className="font-semibold text-white hover:text-[#14F195] underline cursor-pointer inline-flex items-center gap-1"
                    title="Посмотреть профиль разработчика"
                  >
                    <span>@{item.devName.replace(/^@/, '')}</span>
                  </button>
                  <span className="text-slate-500 font-mono text-[11px]">
                    ({item.devWallet.slice(0, 4)}...{item.devWallet.slice(-4)})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/30 border border-emerald-900/50 px-2.5 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195]" />
                  <span>On-Chain Verified · Solana Escrow</span>
                </div>
              </div>

              {/* Task title */}
              <h3 className="text-base font-semibold text-white tracking-tight">
                {item.taskTitle}
              </h3>

              {/* GitHub PR Link & Repo */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">Репозиторий:</span>
                <span className="text-slate-300 font-mono">{item.repoName}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <a 
                  href={item.githubPrUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 text-[#14F195] hover:underline font-mono"
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  GitHub PR #{item.githubPrUrl.split('/').pop()}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Tags & Metadata (unboxed text discipline) */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 pt-1">
                <span className="text-slate-500">Стек:</span>
                {item.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span className="text-slate-300 font-medium">{tag}</span>
                    {idx < item.tags.length - 1 && <span aria-hidden="true" className="text-slate-600">/</span>}
                  </React.Fragment>
                ))}
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Слот #{item.slotNumber.toLocaleString()}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{item.completedAt}</span>
              </div>

              {/* Bottom row: Reward & Solana Transaction explorer */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    +{item.rewardSOL.toFixed(1)} SOL
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                    (${item.rewardUSDC} USDC)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    <span className="text-slate-500">Tx:</span>
                    <span className="truncate max-w-[120px] sm:max-w-[180px]">{item.solanaTxHash}</span>
                    <button
                      onClick={() => handleCopyTx(item.solanaTxHash)}
                      className="text-slate-400 hover:text-white ml-1 transition-colors cursor-pointer"
                      title="Скопировать хэш транзакции"
                    >
                      {copiedTx === item.solanaTxHash ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => onViewExplorer(item.solanaTxHash)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
                  >
                    <span>Solana Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <ShareToTwitterButton
                    devName={item.devName}
                    rewardSOL={item.rewardSOL}
                    taskTitle={item.taskTitle}
                    txHash={item.solanaTxHash}
                    variant="compact"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
