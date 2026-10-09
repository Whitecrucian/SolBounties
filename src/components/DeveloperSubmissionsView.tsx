import React from 'react';
import { BountyTask, UserSession } from '../types';
import { 
  GitPullRequest, CheckCircle2, Clock, ExternalLink, 
  ShieldCheck, ArrowRight, Coins, Terminal, ArrowUpRight, User 
} from 'lucide-react';
import { PublicUserQuery } from './PublicUserProfileModal';
import { GitHubPrPreview } from './GitHubPrPreview';
import { ShareToTwitterButton } from './ShareToTwitterButton';

interface DeveloperSubmissionsViewProps {
  tasks: BountyTask[];
  session: UserSession;
  onSelectTask: (task: BountyTask) => void;
  onViewExplorer: (txHash: string) => void;
  onGoToTasks: () => void;
  onGoToProofOfCode: () => void;
  onOpenUserProfile?: (query: PublicUserQuery) => void;
}

export const DeveloperSubmissionsView: React.FC<DeveloperSubmissionsViewProps> = ({
  tasks,
  session,
  onSelectTask,
  onViewExplorer,
  onGoToTasks,
  onGoToProofOfCode,
  onOpenUserProfile,
}) => {
  // Find all submissions made by this developer across tasks
  // (or tasks that have submissions matching session.devName, or all submissions if dev wants to see their activity)
  const mySubmissions: {
    task: BountyTask;
    submission: BountyTask['submissions'][0];
  }[] = [];

  tasks.forEach((task) => {
    task.submissions.forEach((sub) => {
      if (sub.devName === session.devName || sub.devWallet === session.devWallet) {
        mySubmissions.push({ task, submission: sub });
      }
    });
  });

  const approvedCount = mySubmissions.filter(s => s.submission.status === 'approved').length;
  const pendingCount = mySubmissions.filter(s => s.submission.status === 'submitted').length;
  const earnedSol = mySubmissions
    .filter(s => s.submission.status === 'approved')
    .reduce((acc, s) => acc + (s.submission.payoutAmountSOL || s.task.rewardSOL), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0F172A] via-[#090D16] to-slate-900 p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#14F195]">
            <GitPullRequest className="w-4 h-4" />
            <span>Кабинет разработчика</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Мои решения и Pull Requests
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Отслеживайте статус проверки ваших Pull Request заказчиками, подтверждения в смарт-контракте Solana Escrow и начисления вознаграждений.
          </p>
        </div>

        {/* Stats strip */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">На проверке (Pending)</div>
            <div className="font-mono text-2xl font-bold text-amber-400 tabular-nums mt-1">
              {pendingCount}
            </div>
            <div className="text-[11px] text-slate-500">Ожидают код-ревью</div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Одобрено и выплачено</div>
            <div className="font-mono text-2xl font-bold text-[#14F195] tabular-nums mt-1">
              {approvedCount}
            </div>
            <div className="text-[11px] text-slate-500">В ончейн Proof of Code</div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Заработано по сданным PRs</div>
            <div className="font-mono text-2xl font-bold text-white tabular-nums mt-1">
              {earnedSol.toFixed(1)} SOL
            </div>
            <div className="text-[11px] text-slate-500">≈ ${(earnedSol * 150).toFixed(0)} USDC</div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            История сданных Pull Requests ({mySubmissions.length})
          </h2>
          <button
            onClick={onGoToTasks}
            className="text-xs font-semibold text-[#14F195] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Найти новые задачи</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-slate-800 bg-[#0F172A]/50 space-y-4">
            <GitPullRequest className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">У вас пока нет отправленных решений</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Выберите подходящую задачу в ленте, сделайте fork репозитория, решите таск и отправьте ссылку на GitHub Pull Request.
            </p>
            <button
              onClick={onGoToTasks}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4" />
              <span>Перейти в ленту задач</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mySubmissions.map(({ task, submission }) => (
              <div
                key={submission.id}
                className="p-5 rounded-xl border border-slate-800 bg-[#0F172A] hover:border-slate-700/80 transition-all space-y-3"
              >
                {/* Top status bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
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
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400">{task.categoryLabel}</span>
                  </div>

                  {submission.status === 'approved' ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-900/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195]" />
                      <span>PR Одобрен · Выплата {task.rewardSOL} SOL получена</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-900/50">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>На проверке заказчиком</span>
                    </div>
                  )}
                </div>

                {/* Task title */}
                <h3 
                  onClick={() => onSelectTask(task)}
                  className="text-base font-semibold text-white hover:text-[#14F195] transition-colors cursor-pointer"
                >
                  {task.title}
                </h3>

                {/* Pull Request details */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-slate-400">Сданный PR:</span>
                    <a
                      href={submission.githubPrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#14F195] hover:underline font-mono"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>{submission.githubPrUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-500">Отправлено: {submission.submittedAt}</span>
                  </div>
                  <GitHubPrPreview prUrl={submission.githubPrUrl} compact={true} />
                </div>

                {submission.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 font-mono">
                    «{submission.notes}»
                  </p>
                )}

                {/* Actions & Links */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm tabular-nums">
                      {task.rewardSOL.toFixed(1)} SOL
                    </span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      (≈ ${task.rewardUSDC} USDC)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {submission.status === 'approved' && (
                      <ShareToTwitterButton
                        devName={submission.devName}
                        rewardSOL={task.rewardSOL}
                        taskTitle={task.title}
                        txHash={submission.txHash}
                        variant="compact"
                      />
                    )}

                    {submission.txHash && (
                      <button
                        onClick={() => onViewExplorer(submission.txHash!)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Solana Explorer</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectTask(task)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Детали задачи
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
