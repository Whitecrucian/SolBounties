import React from 'react';
import { BountyTask, UserAccount } from '../types';
import { GitPullRequest, Lock, ArrowUpRight, CheckCircle2, Clock, UserCheck, User } from 'lucide-react';
import { PublicUserQuery } from './PublicUserProfileModal';
import { ShareToTwitterButton } from './ShareToTwitterButton';

interface TaskCardProps {
  task: BountyTask;
  currentUser?: UserAccount | null;
  onSelect: (task: BountyTask) => void;
  onQuickSubmitPR?: (task: BountyTask) => void;
  onOpenUserProfile?: (query: PublicUserQuery) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  onSelect,
  onQuickSubmitPR,
  onOpenUserProfile,
}) => {
  const isAuthor = Boolean(
    currentUser && (
      (task.author.authorId && task.author.authorId === currentUser.id) ||
      (task.author.authorLogin && task.author.authorLogin.toLowerCase() === currentUser.login.toLowerCase()) ||
      task.author.name.toLowerCase() === currentUser.login.toLowerCase() ||
      task.author.name.toLowerCase() === currentUser.name.toLowerCase() ||
      task.author.org.toLowerCase() === currentUser.login.toLowerCase() ||
      task.author.org.toLowerCase() === currentUser.name.toLowerCase()
    )
  );

  const authorNickname = task.author.authorLogin
    ? `@${task.author.authorLogin}`
    : task.author.org && task.author.org.startsWith('@')
      ? task.author.org
      : task.author.name.startsWith('@')
        ? task.author.name
        : `@${task.author.name.toLowerCase().replace(/\s+/g, '_')}`;

  const isCustomer = currentUser?.role === 'project';

  const getStatusIndicator = () => {
    switch (task.status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Открыт к выполнению
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            PR на проверке ({task.submissions.length})
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195]" />
            Выплачено · Завершено
          </span>
        );
      default:
        return (
          <span className="text-xs text-slate-400">
            {task.status}
          </span>
        );
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-400';
      case 'Intermediate':
        return 'text-blue-400';
      case 'Advanced':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div 
      className={`group relative rounded-xl p-5 transition-all duration-200 flex flex-col justify-between gap-4 ${
        isAuthor
          ? 'bg-[#151229] border-2 border-purple-500/70 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/40 hover:border-purple-400'
          : 'bg-[#0F172A]/80 hover:bg-[#131D35] border border-slate-800 hover:border-slate-700/80'
      }`}
    >
      {/* Top Banner if task belongs to the user */}
      {isAuthor && (
        <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/80 text-[11px] text-purple-200 font-semibold">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#14F195]" />
            <span>Ваша задача · Принадлежит вам</span>
          </span>
          <span className="font-mono text-purple-300 text-[10px]">Ваш проект</span>
        </div>
      )}

      {/* Top row: Status and Escrow protection note */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {getStatusIndicator()}
        
        <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]" title={`Escrow PDA: ${task.escrowAddress}`}>
          <Lock className="w-3 h-3 text-[#14F195]" />
          <span>Escrow Locked</span>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h3 
          onClick={() => onSelect(task)}
          className="text-base font-semibold text-white group-hover:text-[#14F195] transition-colors cursor-pointer line-clamp-2"
        >
          {task.title}
        </h3>
        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
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
          className="inline-flex items-center gap-1 text-slate-300 hover:text-[#14F195] font-semibold transition-colors cursor-pointer group/auth"
          title="Нажмите, чтобы посмотреть профиль заказчика"
        >
          <User className="w-3 h-3 text-purple-400 group-hover/auth:text-[#14F195]" />
          <span>{authorNickname}</span>
        </button>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>{task.categoryLabel}</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className={getDifficultyColor(task.difficulty)}>{task.difficulty}</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          {task.deadline}
        </span>
      </div>

      {/* Bottom Bar: Reward & Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-bold text-white tracking-tight tabular-nums">
              {task.rewardSOL.toFixed(1)} SOL
            </span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              ≈ ${task.rewardUSDC} USDC
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Мгновенная выплата в Escrow
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthor ? (
            <span className="text-[11px] text-purple-300 font-semibold px-2.5 py-1 bg-purple-950/60 rounded-lg border border-purple-800/60 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-[#14F195]" />
              <span>Ваш таск</span>
            </span>
          ) : !isCustomer && task.status !== 'completed' && onQuickSubmitPR ? (
            /* Only developers can submit PR */
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickSubmitPR(task);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Сдать PR</span>
            </button>
          ) : null}

          {task.status === 'completed' && (
            <ShareToTwitterButton
              devName={task.submissions.find(s => s.status === 'approved')?.devName || 'contributor'}
              rewardSOL={task.rewardSOL}
              taskTitle={task.title}
              txHash={task.submissions.find(s => s.status === 'approved')?.txHash}
              variant="compact"
            />
          )}

          <button
            onClick={() => onSelect(task)}
            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Подробнее о задаче"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
