import React, { useState } from 'react';
import { BountyTask, TaskCategory, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Search, PlusCircle, Shield, Sparkles, Filter, Code, CheckCircle2, Lock, User } from 'lucide-react';
import { PublicUserQuery } from './PublicUserProfileModal';

interface TaskFeedProps {
  tasks: BountyTask[];
  role: 'developer' | 'project';
  currentUser?: import('../types').UserAccount | null;
  onSelectTask: (task: BountyTask) => void;
  onQuickSubmitPR: (task: BountyTask) => void;
  onOpenCreate: () => void;
  onOpenProfile?: () => void;
  onOpenUserProfile?: (query: PublicUserQuery) => void;
  onLoadSampleBounties?: () => void;
}

export const TaskFeed: React.FC<TaskFeedProps> = ({
  tasks,
  role,
  currentUser,
  onSelectTask,
  onQuickSubmitPR,
  onOpenCreate,
  onOpenProfile,
  onOpenUserProfile,
  onLoadSampleBounties,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'reward-high' | 'reward-low'>('newest');

  const isDev = role === 'developer';

  // Categories list
  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Все направления' },
    { id: 'smart-contracts', label: 'Anchor / Rust' },
    { id: 'frontend', label: 'Frontend / UI' },
    { id: 'security', label: 'Security Audit' },
    { id: 'sdk', label: 'SDK & Tools' },
    { id: 'docs', label: 'Docs & Guides' },
  ];

  // Filtering
  const filteredTasks = tasks.filter((task) => {
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchOrg = task.author.org.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchOrg) return false;
    }
    return true;
  });

  // Sorting
  filteredTasks.sort((a, b) => {
    if (sortBy === 'reward-high') return b.rewardSOL - a.rewardSOL;
    if (sortBy === 'reward-low') return a.rewardSOL - b.rewardSOL;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate platform aggregate statistics
  const totalLockedSol = tasks.reduce((acc, t) => acc + (t.status !== 'completed' ? t.rewardSOL : 0), 0);
  const totalCompletedCount = tasks.filter(t => t.status === 'completed').length;
  const activeCount = tasks.filter(t => t.status === 'open').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Presentation */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0F172A] via-[#090D16] to-[#0A1224] p-6 sm:p-10 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#9945FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#14F195]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
            <span>
              {isDev 
                ? 'Режим разработчика · Выбирайте таски и сдавайте GitHub PR'
                : 'Режим заказчика · Публикуйте таски с гарантией Solana Escrow'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            {isDev ? (
              <>Выполняйте Web3-задачи, прокачивайте <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-emerald-400">Proof of Code</span></>
            ) : (
              <>Решайте точечные задачи без найма в штат с <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-purple-400">Solana Escrow</span></>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isDev ? (
              'Заказчики замораживают оплату в Solana Escrow смарт-контрактах. Находите интересные задания, отправляйте GitHub Pull Request, получайте моментальные выплаты и верифицированное ончейн-портфолио.'
            ) : (
              'Замораживайте оплату в смарт-контракте, получайте качественные Pull Request от проверенных разработчиков и выплачивайте вознаграждение только после аппрува кода.'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onLoadSampleBounties && (
              <button
                type="button"
                onClick={onLoadSampleBounties}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-purple-200 hover:text-white bg-purple-950/70 hover:bg-purple-900 border border-purple-600/80 hover:border-[#14F195] rounded-xl transition-all shadow-lg shadow-purple-950/40 flex items-center gap-2 cursor-pointer"
                title="Загрузить 3 готовые задачи для хакатона (Smart Contracts, Frontend, Security Audit)"
              >
                <Sparkles className="w-4 h-4 text-[#14F195]" />
                <span>Загрузить демо-задачи (1-Click Demo)</span>
              </button>
            )}

            {isDev ? (
              <>
                <a
                  href="#feed"
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Code className="w-4 h-4" />
                  <span>Выбрать задачу к выполнению</span>
                </a>
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Сменить статус на Заказчика в профиле</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onOpenCreate}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Опубликовать задачу в Escrow</span>
                </button>
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Сменить статус на Разработчика в профиле</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-400">Заморожено в Solana Escrow</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-[#14F195] tabular-nums mt-0.5">
              {totalLockedSol.toFixed(1)} SOL
            </div>
            <div className="text-slate-500 text-[11px]">Безопасные смарт-контракты</div>
          </div>

          <div>
            <div className="text-slate-400">Активных задач в ленте</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums mt-0.5">
              {activeCount}
            </div>
            <div className="text-slate-500 text-[11px]">Готовы к выполнению</div>
          </div>

          <div>
            <div className="text-slate-400">Успешно закрытых PRs</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-purple-300 tabular-nums mt-0.5">
              {totalCompletedCount}
            </div>
            <div className="text-slate-500 text-[11px]">В ончейн-портфолио</div>
          </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div id="feed" className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, стеку, описанию..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status buttons & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  selectedStatus === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Все ({tasks.length})
              </button>
              <button
                onClick={() => setSelectedStatus('open')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  selectedStatus === 'open' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Открытые
              </button>
              <button
                onClick={() => setSelectedStatus('under_review')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  selectedStatus === 'under_review' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                На проверке
              </button>
              <button
                onClick={() => setSelectedStatus('completed')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  selectedStatus === 'completed' ? 'bg-slate-800 text-purple-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Выплачено
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="newest">Сначала новые</option>
              <option value="reward-high">По награде (Max SOL)</option>
              <option value="reward-low">По награде (Min SOL)</option>
            </select>
          </div>
        </div>

        {/* Category Pills / Filter bar (Interactive segmented controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white font-semibold border-slate-700 shadow-xs'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-slate-800 bg-[#0F172A]/50">
          <Code className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Задачи не найдены</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Попробуйте изменить категорию или поисковый запрос, либо загрузите готовые демо-задачи для хакатона.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {onLoadSampleBounties && (
              <button
                type="button"
                onClick={onLoadSampleBounties}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-900 hover:bg-purple-800 border border-purple-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#14F195]" />
                <span>Загрузить 3 демо-задачи для хакатона</span>
              </button>
            )}
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-lg transition-colors cursor-pointer"
            >
              Создать задачу
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              onSelect={onSelectTask}
              onQuickSubmitPR={onQuickSubmitPR}
              onOpenUserProfile={onOpenUserProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
