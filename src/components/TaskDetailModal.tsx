import React, { useState } from 'react';
import { BountyTask, UserSession, Submission, UserAccount } from '../types';
import { 
  X, GitPullRequest, ExternalLink, Lock, CheckCircle2, 
  AlertCircle, ArrowRight, ShieldCheck, Terminal, Copy, Check, Sparkles, User, Ban, Building2 
} from 'lucide-react';
import { PublicUserQuery } from './PublicUserProfileModal';
import { GitHubPrPreview } from './GitHubPrPreview';
import { ShareToTwitterButton } from './ShareToTwitterButton';

interface TaskDetailModalProps {
  task: BountyTask;
  session: UserSession;
  currentUser: UserAccount | null;
  walletAddress: string | null;
  onClose: () => void;
  onSubmitPR: (bountyId: string, prUrl: string, notes: string) => void;
  onApproveAndReleaseEscrow: (bountyId: string, submissionId: string) => void;
  onViewExplorer: (txHash: string) => void;
  onSendMemo?: (text: string) => Promise<string | undefined>;
  onOpenAuth?: () => void;
  onOpenUserProfile?: (query: PublicUserQuery) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  session,
  currentUser,
  walletAddress,
  onClose,
  onSubmitPR,
  onApproveAndReleaseEscrow,
  onViewExplorer,
  onSendMemo,
  onOpenAuth,
  onOpenUserProfile,
}) => {
  const [prUrl, setPrUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedEscrow, setCopiedEscrow] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [releaseStatus, setReleaseStatus] = useState<{ text: string; link?: string } | null>(null);

  // Check if current user is the author of this task
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

  const handleCopyEscrow = () => {
    navigator.clipboard.writeText(task.escrowAddress);
    setCopiedEscrow(true);
    setTimeout(() => setCopiedEscrow(false), 2000);
  };

  const handlePRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!currentUser) {
      setFormError('Для сдачи задачи необходимо войти в аккаунт.');
      return;
    }

    if (currentUser.role === 'project' || session.role === 'project') {
      if (isAuthor) {
        setFormError('Заказчик не может отвечать на свой собственный таск.');
      } else {
        setFormError('Заказчик не может отвечать на таски. Это может делать только роль разработчика.');
      }
      return;
    }

    if (isAuthor) {
      setFormError('Заказчик не может отвечать на свой собственный таск.');
      return;
    }

    if (!prUrl.trim()) {
      setFormError('Укажите ссылку на Pull Request');
      return;
    }

    if (!prUrl.includes('github.com') || !prUrl.includes('/pull/')) {
      setFormError('Ссылка должна иметь формат https://github.com/{owner}/{repo}/pull/{number}');
      return;
    }

    setSubmitting(true);

    // If connected, optionally record PR onchain
    if (walletAddress && onSendMemo) {
      try {
        await onSendMemo(`SolBounties Решение: PR ${prUrl.trim()} к задаче "${task.title}"`);
      } catch (err: any) {
        console.warn('Memo error on PR submission:', err);
      }
    }

    setTimeout(() => {
      onSubmitPR(task.id, prUrl.trim(), notes.trim());
      setSubmitting(false);
      setPrUrl('');
      setNotes('');
    }, 600);
  };

  const handleRelease = async (sub: Submission) => {
    setReleasingId(sub.id);
    setReleaseStatus(null);

    // If connected, write Proof of Code Memo to Solana Devnet!
    if (walletAddress && onSendMemo) {
      try {
        const memoText = `SolBounties Proof of Code: Одобрен PR ${sub.githubPrUrl} | Награда: ${task.rewardSOL} SOL | Разработчик: ${sub.devWallet}`;
        const sig = await onSendMemo(memoText);
        if (sig) {
          setReleaseStatus({
            text: 'Записано в блокчейн',
            link: `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
          });
        }
      } catch (err: any) {
        setFormError(err?.message || 'Ошибка записи в блокчейн');
        setReleasingId(null);
        return;
      }
    }

    setTimeout(() => {
      onApproveAndReleaseEscrow(task.id, sub.id);
      setReleasingId(null);
    }, 1000);
  };

  const completedSubmission = task.submissions.find(s => s.status === 'approved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-400">
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
              className="text-[#14F195] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              title="Посмотреть профиль заказчика"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>@{ (task.author.authorLogin || task.author.name).replace(/^@/, '') }</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>{task.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-300">Сложность: {task.difficulty}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Main Title & Reward Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {task.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span>Заказчик:</span>
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
                    className="text-white hover:text-[#14F195] font-semibold underline cursor-pointer"
                    title="Посмотреть профиль заказчика"
                  >
                    @{ (task.author.authorLogin || task.author.name).replace(/^@/, '') }
                  </button>
                </span>
                <span aria-hidden="true">·</span>
                <span>Срок: {task.deadline}</span>
                <span aria-hidden="true">·</span>
                <a 
                  href={task.githubIssueUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#9945FF] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  GitHub Issue #{task.githubIssueUrl.split('/').pop()}
                </a>
              </div>
            </div>

            {/* Escrow Reward Display */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:text-right shrink-0">
              <div className="text-[11px] text-slate-400">Награда в Escrow</div>
              <div className="font-mono text-xl font-bold text-emerald-400 tabular-nums">
                {task.rewardSOL.toFixed(1)} SOL
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                ≈ ${task.rewardUSDC} USDC
              </div>
            </div>
          </div>

          {/* Solana Escrow Smart Contract Guarantee box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-emerald-950/20 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-[#14F195]" />
                <span>Гарантия выплаты: Solana Escrow Program v2</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Депозит заморожен</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Средства заказчика заблокированы на Program Derived Address (PDA). Они не могут быть отозваны без соблюдения правил смарт-контракта. Выплата производится моментально при одобрении Pull Request.
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="truncate max-w-[260px] sm:max-w-md">PDA: {task.escrowAddress}</span>
              <button 
                onClick={handleCopyEscrow}
                className="flex items-center gap-1 text-slate-300 hover:text-white ml-2 transition-colors cursor-pointer"
              >
                {copiedEscrow ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEscrow ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Описание задачи</h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          </div>

          {/* Requirements & Criteria */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Критерии приемки</h4>
            <ul className="space-y-2">
              {task.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="text-[#14F195] font-bold mt-0.5">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Repository Links */}
          <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
            <Terminal className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-400">Репозиторий:</span>
            <a 
              href={task.githubRepo} 
              target="_blank" 
              rel="noreferrer" 
              className="text-white hover:text-[#14F195] font-mono truncate underline transition-colors"
            >
              {task.githubRepo}
            </a>
          </div>

          {/* Status Message if released onchain */}
          {releaseStatus && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
                <span>{releaseStatus.text}</span>
              </div>
              <div className="flex items-center gap-2">
                {releaseStatus.link && (
                  <a href={releaseStatus.link} target="_blank" rel="noreferrer" className="underline text-[#14F195] font-semibold flex items-center gap-1">
                    <span>Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <ShareToTwitterButton
                  devName={session.devName}
                  rewardSOL={task.rewardSOL}
                  taskTitle={task.title}
                  txHash={releaseStatus.link?.split('/tx/')[1]?.split('?')[0]}
                  variant="compact"
                />
              </div>
            </div>
          )}

          {/* IF COMPLETED: Show Proof of Code Record */}
          {task.status === 'completed' && completedSubmission && (
            <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-purple-950/30 border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-[#14F195]" />
                  <span>Задача выполнена · Ончейн Proof of Code создан</span>
                </div>
                <ShareToTwitterButton
                  devName={completedSubmission.devName}
                  rewardSOL={task.rewardSOL}
                  taskTitle={task.title}
                  txHash={completedSubmission.txHash}
                  variant="compact"
                />
              </div>
              <p className="text-xs text-slate-300">
                Исполнитель: <span className="font-semibold text-white">@{completedSubmission.devName}</span> ({completedSubmission.devWallet.slice(0, 6)}...{completedSubmission.devWallet.slice(-4)})
              </p>
              <div className="text-xs text-slate-300 space-y-1.5">
                <p>Pull Request: <a href={completedSubmission.githubPrUrl} target="_blank" rel="noreferrer" className="text-[#14F195] underline">{completedSubmission.githubPrUrl}</a></p>
                <GitHubPrPreview prUrl={completedSubmission.githubPrUrl} compact={true} />
              </div>
              {completedSubmission.txHash && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-800">
                  <span className="font-mono text-slate-400 truncate max-w-xs">Tx: {completedSubmission.txHash}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onViewExplorer(completedSubmission.txHash!)}
                      className="text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Открыть в Solana Explorer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REVIEW SECTION: If there are submissions pending */}
          {task.submissions.length > 0 && task.status !== 'completed' && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-amber-400" />
                <span>Отправленные решения ({task.submissions.length})</span>
              </h4>

              {task.submissions.map((sub) => (
                <div key={sub.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenUserProfile) {
                            onOpenUserProfile({
                              login: sub.devName.replace(/^@/, ''),
                              name: sub.devName,
                              wallet: sub.devWallet,
                              role: 'developer',
                            });
                          }
                        }}
                        className="text-sm font-semibold text-white hover:text-[#14F195] underline cursor-pointer inline-flex items-center gap-1"
                        title="Посмотреть профиль разработчика"
                      >
                        <User className="w-3.5 h-3.5 text-[#14F195]" />
                        <span>@{sub.devName.replace(/^@/, '')}</span>
                      </button>
                      <span className="text-xs text-slate-400 ml-2 font-mono">({sub.devWallet.slice(0, 4)}...{sub.devWallet.slice(-4)})</span>
                    </div>
                    <span className="text-xs text-slate-500">{sub.submittedAt}</span>
                  </div>

                  <div className="text-xs space-y-2">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>PR: </span>
                      <a href={sub.githubPrUrl} target="_blank" rel="noreferrer" className="text-[#14F195] hover:underline font-mono">
                        {sub.githubPrUrl}
                      </a>
                    </div>
                    <GitHubPrPreview prUrl={sub.githubPrUrl} compact={true} />
                  </div>

                  {sub.notes && (
                    <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      «{sub.notes}»
                    </p>
                  )}

                  {/* Actions for PR (Only accessible if reviewer or author) */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>CI тесты пройдены</span>
                      <span aria-hidden="true">·</span>
                      <span>Комиссию платит кошелек</span>
                    </div>

                    <button
                      disabled={releasingId === sub.id}
                      onClick={() => handleRelease(sub)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-gradient-to-r from-[#14F195] to-[#10b981] hover:opacity-90 rounded-lg transition-opacity flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {releasingId === sub.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                          <span>Записываем в блокчейн…</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Одобрить и выплатить {task.rewardSOL} SOL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUBMIT SOLUTION SECTION */}
          {task.status !== 'completed' && (
            <div className="border-t border-slate-800 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <GitPullRequest className="w-4 h-4 text-[#14F195]" />
                <h4 className="text-sm font-semibold text-white">
                  Сдать решение (GitHub Pull Request)
                </h4>
              </div>

              {/* RULE: AUTHOR CANNOT SUBMIT PR TO THEIR OWN TASK */}
              {isAuthor ? (
                <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Ban className="w-4 h-4" />
                    <span>Заказчик не может ответить на свой таск</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Вы являетесь автором (заказчиком) этой задачи. Заказчик не может отвечать на свой собственный таск. Вы можете проверять поступающие Pull Request от других разработчиков и одобрять выплату вознаграждения из Solana Escrow.
                  </p>
                </div>
              ) : currentUser?.role === 'project' || session.role === 'project' ? (
                /* RULE: CUSTOMER CANNOT SUBMIT PR TO OTHER TASKS */
                <div className="p-4 bg-purple-950/20 border border-purple-900/40 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                    <Ban className="w-4 h-4 text-purple-400" />
                    <span>Заказчик не может отвечать на таски</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Роль Заказчика предназначена для публикации задач. Отправлять Pull Request могут только Разработчики. Переключите свой статус в профиле на «Разработчик», если хотите выполнять таски и зарабатывать SOL.
                  </p>
                </div>
              ) : !currentUser ? (
                /* RULE: GUEST CANNOT SUBMIT PR WITHOUT ACCOUNT */
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-200">
                    <Lock className="w-4 h-4 text-[#14F195]" />
                    <span>Требуется авторизация</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Без аккаунта пользователь не может сдать или опубликовать таск. Войдите в существующий аккаунт или зарегистрируйтесь.
                  </p>
                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="px-4 py-2 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Войти или зарегистрироваться</span>
                    </button>
                  )}
                </div>
              ) : (
                /* AUTHORIZED NON-AUTHOR DEVELOPER FORM */
                <>
                  <p className="text-xs text-slate-400 mb-4">
                    Отправьте ссылку на ваш открытый Pull Request. После ревью заказчик подтверждает слияние, а смарт-контракт автоматически переводит вам вознаграждение и фиксирует ончейн-запись «Proof of Code».
                  </p>

                  <form onSubmit={handlePRSubmit} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-slate-300">
                          Ссылка на GitHub Pull Request *
                        </label>
                        <button
                          type="button"
                          onClick={() => setPrUrl('https://github.com/solana-labs/solana-program-library/pull/42')}
                          className="text-[11px] text-[#14F195] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                          title="Вставить тестовый пример ссылки на PR"
                        >
                          <Sparkles className="w-3 h-3 text-[#14F195]" />
                          <span>Вставить пример ссылки</span>
                        </button>
                      </div>

                      <input
                        type="url"
                        value={prUrl}
                        onChange={(e) => setPrUrl(e.target.value)}
                        placeholder="https://github.com/solana-labs/solana-program-library/pull/42"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                      />

                      {/* Quick Example Links helper strip */}
                      <div className="mt-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Готовые примеры ссылок (нажмите для вставки):</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                          <button
                            type="button"
                            onClick={() => setPrUrl('https://github.com/solana-labs/solana-program-library/pull/42')}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 hover:border-[#14F195] border border-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Вставить https://github.com/solana-labs/solana-program-library/pull/42"
                          >
                            <Copy className="w-3 h-3 text-[#14F195]" />
                            <span>.../solana-program-library/pull/42</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPrUrl('https://github.com/coral-xyz/anchor/pull/128')}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 hover:border-[#14F195] border border-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Вставить https://github.com/coral-xyz/anchor/pull/128"
                          >
                            <Copy className="w-3 h-3 text-purple-400" />
                            <span>.../coral-xyz/anchor/pull/128</span>
                          </button>

                          {task.githubRepo && (
                            <button
                              type="button"
                              onClick={() => {
                                const repoClean = task.githubRepo.replace(/\/$/, '');
                                setPrUrl(`${repoClean}/pull/1`);
                              }}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 hover:border-[#14F195] border border-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                              title="Вставить PR к репозиторию этой задачи"
                            >
                              <GitPullRequest className="w-3 h-3 text-emerald-400" />
                              <span>PR к репозиторию таска #{1}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Live GitHub PR Preview from Public GitHub API */}
                      {prUrl.trim() && (
                        <div className="mt-3">
                          <GitHubPrPreview prUrl={prUrl.trim()} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Комментарий разработчика и результаты тестов (необязательно)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Опишите, что было исправлено, приложите вывод `anchor test` или скриншот верстки..."
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    {formError && (
                      <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-500">
                        Исполнитель: <span className="text-slate-300 font-mono">@{currentUser.login}</span>
                        {walletAddress && (
                          <span className="text-slate-500 ml-1">({walletAddress.slice(0, 4)}...{walletAddress.slice(-4)})</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                            <span>Записываем в блокчейн…</span>
                          </>
                        ) : (
                          <>
                            <GitPullRequest className="w-3.5 h-3.5" />
                            <span>Отправить PR на проверку</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
