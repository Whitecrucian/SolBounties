import React, { useState } from 'react';
import { BountyTask, UserSession, UserAccount } from '../types';
import { 
  Layers, PlusCircle, GitPullRequest, Lock, CheckCircle2, 
  ExternalLink, Clock, ShieldCheck, ArrowRight, AlertCircle, 
  ChevronRight, UserCheck, Users, Eye, Sparkles, User 
} from 'lucide-react';
import { PublicUserQuery } from './PublicUserProfileModal';
import { GitHubPrPreview } from './GitHubPrPreview';

interface ProjectDashboardViewProps {
  tasks: BountyTask[];
  session: UserSession;
  currentUser?: UserAccount | null;
  onSelectTask: (task: BountyTask) => void;
  onOpenCreateModal: () => void;
  onApproveAndReleaseEscrow: (bountyId: string, submissionId: string) => void;
  onViewExplorer: (txHash: string) => void;
  onOpenUserProfile?: (query: PublicUserQuery) => void;
}

export const ProjectDashboardView: React.FC<ProjectDashboardViewProps> = ({
  tasks,
  session,
  currentUser,
  onSelectTask,
  onOpenCreateModal,
  onApproveAndReleaseEscrow,
  onViewExplorer,
  onOpenUserProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending-review' | 'completed'>('all');
  const [viewScope, setViewScope] = useState<'my' | 'others'>('my');
  const [releasingId, setReleasingId] = useState<string | null>(null);

  // Check if a task belongs to the current user
  const isMyTask = (t: BountyTask) => {
    if (!currentUser) return false;
    return Boolean(
      (t.author.authorId && t.author.authorId === currentUser.id) ||
      (t.author.authorLogin && t.author.authorLogin.toLowerCase() === currentUser.login.toLowerCase()) ||
      t.author.name.toLowerCase() === currentUser.login.toLowerCase() ||
      t.author.name.toLowerCase() === currentUser.name.toLowerCase() ||
      t.author.org.toLowerCase() === currentUser.login.toLowerCase() ||
      t.author.org.toLowerCase() === currentUser.name.toLowerCase()
    );
  };

  const myTasks = tasks.filter(t => isMyTask(t));
  const otherTasks = tasks.filter(t => !isMyTask(t));

  // Tasks to display based on selected scope
  const targetTasks = viewScope === 'my' ? myTasks : otherTasks;

  // Collect pending submissions only for the current customer's tasks!
  const pendingSubmissions: {
    task: BountyTask;
    submission: BountyTask['submissions'][0];
  }[] = [];

  myTasks.forEach((t) => {
    t.submissions.forEach((s) => {
      if (s.status === 'submitted') {
        pendingSubmissions.push({ task: t, submission: s });
      }
    });
  });

  const totalLockedSol = myTasks
    .filter(t => t.status !== 'completed')
    .reduce((acc, t) => acc + t.rewardSOL, 0);

  const myCompletedCount = myTasks.filter(t => t.status === 'completed').length;
  const myActiveCount = myTasks.filter(t => t.status === 'open').length;

  const filteredTasks = targetTasks.filter((t) => {
    if (activeTab === 'pending-review') return t.status === 'under_review';
    if (activeTab === 'completed') return t.status === 'completed';
    return true;
  });

  const handleApprove = (bountyId: string, submissionId: string) => {
    setReleasingId(submissionId);
    setTimeout(() => {
      onApproveAndReleaseEscrow(bountyId, submissionId);
      setReleasingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner: Cabinet of Customer */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-purple-950/40 via-[#0F172A] to-[#090D16] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9945FF]">
              <Layers className="w-4 h-4" />
              <span>Панель управления заказчика</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Кабинет заказчика: @{currentUser?.login || currentUser?.name || 'заказчик'}
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl">
              Публикуйте точечные микро-задачи, блокируйте вознаграждение в Solana Escrow, проверяйте сданные разработчиками Pull Requests и выплачивайте SOL в 1 клик.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Опубликовать таск в Escrow</span>
          </button>
        </div>

        {/* Treasury and Task KPIs for current customer */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400">В вашей казне Escrow PDA</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-[#14F195] tabular-nums mt-0.5">
              {totalLockedSol.toFixed(1)} SOL
            </div>
            <div className="text-[11px] text-slate-500">Замороженные депозиты ваших задач</div>
          </div>

          <div>
            <div className="text-slate-400">Ждут вашего ревью</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400 tabular-nums mt-0.5">
              {pendingSubmissions.length} PRs
            </div>
            <div className="text-[11px] text-slate-500">Сдано разработчиками по вашим таскам</div>
          </div>

          <div>
            <div className="text-slate-400">Ваших открытых задач</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums mt-0.5">
              {myActiveCount}
            </div>
            <div className="text-[11px] text-slate-500">Доступно к выполнению сообществом</div>
          </div>

          <div>
            <div className="text-slate-400">Ваших закрытых задач</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-purple-300 tabular-nums mt-0.5">
              {myCompletedCount}
            </div>
            <div className="text-[11px] text-slate-500">Успешно выплачено разработчикам</div>
          </div>
        </div>
      </div>

      {/* PENDING PR REVIEW INBOX (Only for tasks created by current user) */}
      {pendingSubmissions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">
              Очередь код-ревью: входящие Pull Requests ({pendingSubmissions.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingSubmissions.map(({ task, submission }) => (
              <div
                key={submission.id}
                className="p-5 rounded-xl border border-slate-800 bg-[#0F172A] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs text-slate-400">Задача вашего проекта:</span>
                    <h3
                      onClick={() => onSelectTask(task)}
                      className="text-base font-semibold text-white hover:text-[#14F195] transition-colors cursor-pointer"
                    >
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Награда:</span>
                    <span className="text-[#14F195] font-bold">{task.rewardSOL} SOL</span>
                    <span className="text-slate-500">(${task.rewardUSDC} USDC)</span>
                  </div>
                </div>

                {/* Developer details and PR Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Разработчик:</span>
                    <div className="mt-1 font-semibold text-white flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenUserProfile) {
                            onOpenUserProfile({
                              login: submission.devName.replace(/^@/, ''),
                              name: submission.devName,
                              wallet: submission.devWallet,
                              role: 'developer',
                            });
                          }
                        }}
                        className="text-[#14F195] hover:underline cursor-pointer inline-flex items-center gap-1 font-mono"
                        title="Посмотреть профиль разработчика"
                      >
                        <User className="w-3.5 h-3.5 text-[#14F195]" />
                        <span>@{submission.devName.replace(/^@/, '')}</span>
                      </button>
                      <span className="font-mono text-slate-500 text-[11px]">
                        ({submission.devWallet.slice(0, 4)}...{submission.devWallet.slice(-4)})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400">GitHub Pull Request:</span>
                    <div className="mt-1 space-y-1.5">
                      <a
                        href={submission.githubPrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#14F195] hover:underline font-mono inline-flex items-center gap-1.5"
                      >
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>{submission.githubPrUrl}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <GitHubPrPreview prUrl={submission.githubPrUrl} compact={true} />
                    </div>
                  </div>
                </div>

                {submission.notes && (
                  <div className="text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-slate-500 block mb-1">Комментарий разработчика к PR:</span>
                    «{submission.notes}»
                  </div>
                )}

                {/* Release Escrow Payout Button */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#14F195]" />
                    <span>Выплата поступит напрямую на кошелёк разработчика с созданием ончейн Proof of Code</span>
                  </div>

                  <button
                    disabled={releasingId === submission.id}
                    onClick={() => handleApprove(task.id, submission.id)}
                    className="px-4 py-2 text-xs font-semibold text-slate-900 bg-gradient-to-r from-[#14F195] to-[#10b981] hover:opacity-95 rounded-lg transition-opacity flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {releasingId === submission.id ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <span>Выплата из Escrow...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Одобрить PR и выплатить {task.rewardSOL} SOL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Management Section with Scope Switching (My Tasks vs Other Users' Tasks) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {viewScope === 'my' 
                  ? `Задачи вашего проекта (${myTasks.length})` 
                  : `Заказы других пользователей (${otherTasks.length})`
                }
              </h2>
              {viewScope === 'my' && myTasks.length > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60">
                  Только ваши
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {viewScope === 'my' 
                ? 'Отображаются задачи, созданные текущим аккаунтом заказчика.'
                : 'Просмотр задач, опубликованных другими заказчиками и командами.'
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Switcher: My tasks vs Other users' tasks */}
            <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => setViewScope('my')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                  viewScope === 'my'
                    ? 'bg-purple-950/60 text-purple-200 border border-purple-800/60 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#14F195]" />
                <span>Мои задачи ({myTasks.length})</span>
              </button>

              <button
                onClick={() => setViewScope('others')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                  viewScope === 'others'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Посмотреть заказы других пользователей"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Заказы других ({otherTasks.length})</span>
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Все ({targetTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('pending-review')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'pending-review' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                На проверке ({targetTasks.filter(t => t.status === 'under_review').length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'completed' ? 'bg-slate-800 text-purple-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Выплачено ({targetTasks.filter(t => t.status === 'completed').length})
              </button>
            </div>
          </div>
        </div>

        {/* Informative banner if viewing others */}
        {viewScope === 'others' && (
          <div className="p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl text-xs text-purple-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Вы просматриваете задачи других пользователей. Как заказчик, вы не можете сдавать на них решения.</span>
            </div>
            <button
              onClick={() => setViewScope('my')}
              className="px-2.5 py-1 text-xs font-semibold bg-purple-900/40 hover:bg-purple-900/60 rounded text-purple-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Вернуться к моим задачам
            </button>
          </div>
        )}

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#0F172A]/50 space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">
              {viewScope === 'my' 
                ? 'Вы пока не создали ни одной задачи под этим аккаунтом' 
                : 'Задачи других пользователей не найдены'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {viewScope === 'my'
                ? 'Опубликуйте точечный таск с заморозкой оплаты в Solana Escrow, и разработчики сообщества приступят к его выполнению.'
                : 'Пока другие заказчики не опубликовали задач в этой категории.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {viewScope === 'my' ? (
                <>
                  <button
                    onClick={onOpenCreateModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-lg transition-colors cursor-pointer"
                  >
                    Опубликовать первую задачу
                  </button>
                  {otherTasks.length > 0 && (
                    <button
                      onClick={() => setViewScope('others')}
                      className="px-3.5 py-2 text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Посмотреть заказы других ({otherTasks.length})</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setViewScope('my')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Вернуться к моим задачам
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const mine = isMyTask(task);
              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    mine 
                      ? 'border-purple-500/70 bg-[#141229] shadow-md shadow-purple-950/20 hover:border-purple-400' 
                      : 'border-slate-800 bg-[#0F172A] hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    {/* User ownership highlight badge */}
                    {mine ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/80 text-purple-200 border border-purple-800/80">
                        <UserCheck className="w-3 h-3 text-[#14F195]" />
                        <span>Ваша задача · Принадлежит вам</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Заказчик:</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenUserProfile) {
                              onOpenUserProfile({
                                login: (task.author.authorLogin || task.author.name).replace(/^@/, ''),
                                name: task.author.name,
                                authorId: task.author.authorId,
                                role: 'project',
                              });
                            }
                          }}
                          className="font-semibold text-purple-300 hover:text-[#14F195] underline cursor-pointer inline-flex items-center gap-1"
                          title="Посмотреть профиль заказчика"
                        >
                          <User className="w-3 h-3 text-purple-400" />
                          <span>@{ (task.author.authorLogin || task.author.name).replace(/^@/, '') }</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm hover:text-[#14F195] transition-colors">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>{task.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-500">PDA: {task.escrowAddress.slice(0, 10)}...</span>
                      <span aria-hidden="true">·</span>
                      <span>Заявок: {task.submissions.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-white tabular-nums">
                        {task.rewardSOL.toFixed(1)} SOL
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ≈ ${task.rewardUSDC} USDC
                      </div>
                    </div>

                    <div>
                      {task.status === 'completed' ? (
                        <span className="px-2.5 py-1 rounded bg-purple-950/40 text-purple-300 font-semibold border border-purple-900/50">
                          Выплачено
                        </span>
                      ) : task.status === 'under_review' ? (
                        <span className="px-2.5 py-1 rounded bg-amber-950/40 text-amber-400 font-semibold border border-amber-900/50">
                          Есть PR ({task.submissions.length})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/50">
                          Открыт
                        </span>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
