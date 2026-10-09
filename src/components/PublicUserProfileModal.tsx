import React, { useState } from 'react';
import { BountyTask, ProofOfCodeRecord, UserAccount } from '../types';
import { findUserByLoginOrName } from '../utils/userDb';
import { 
  X, User, Code2, Building2, Wallet, ExternalLink, 
  Copy, Check, ShieldCheck, Calendar, GitPullRequest, 
  Layers, Lock, CheckCircle2, Coins, Clock 
} from 'lucide-react';

export interface PublicUserQuery {
  login?: string;
  name?: string;
  authorId?: string;
  role?: 'developer' | 'project';
  wallet?: string | null;
}

interface PublicUserProfileModalProps {
  userQuery: PublicUserQuery;
  tasks: BountyTask[];
  pocRecords: ProofOfCodeRecord[];
  onClose: () => void;
  onSelectTask?: (task: BountyTask) => void;
}

export const PublicUserProfileModal: React.FC<PublicUserProfileModalProps> = ({
  userQuery,
  tasks,
  pocRecords,
  onClose,
  onSelectTask,
}) => {
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'info'>('activity');

  // Try to find registered user in local DB
  const rawIdentifier = userQuery.authorId || userQuery.login || userQuery.name || '';
  const dbUser = findUserByLoginOrName(rawIdentifier);

  // Consolidated profile data
  const login = dbUser?.login || (userQuery.login ? userQuery.login.replace(/^@/, '') : (userQuery.name ? userQuery.name.toLowerCase().replace(/\s+/g, '_') : 'user'));
  const name = dbUser?.name || userQuery.name || login;
  const role: 'developer' | 'project' = dbUser?.role || userQuery.role || (login === 'test' ? 'developer' : 'project');
  const linkedWallet = dbUser?.linkedWallet || userQuery.wallet || null;
  const createdAt = dbUser?.createdAt || '2026-10-01';

  // Tasks created by this user (as customer)
  const userCreatedTasks = tasks.filter((t) => {
    return Boolean(
      (t.author.authorId && dbUser && t.author.authorId === dbUser.id) ||
      (t.author.authorLogin && t.author.authorLogin.toLowerCase() === login.toLowerCase()) ||
      t.author.name.toLowerCase() === login.toLowerCase() ||
      t.author.name.toLowerCase() === name.toLowerCase() ||
      t.author.org.toLowerCase() === `@${login.toLowerCase()}`
    );
  });

  // Submissions made by this user (as developer)
  const userSubmissions: {
    task: BountyTask;
    submission: BountyTask['submissions'][0];
  }[] = [];

  tasks.forEach((t) => {
    t.submissions.forEach((s) => {
      if (
        s.devName.toLowerCase() === login.toLowerCase() ||
        s.devName.toLowerCase() === name.toLowerCase() ||
        (linkedWallet && s.devWallet === linkedWallet)
      ) {
        userSubmissions.push({ task: t, submission: s });
      }
    });
  });

  // Proof of code records
  const userPocRecords = pocRecords.filter(
    (r) =>
      r.devName.toLowerCase() === login.toLowerCase() ||
      r.devName.toLowerCase() === name.toLowerCase() ||
      (linkedWallet && r.devWallet === linkedWallet)
  );

  const totalEscrowDeposited = userCreatedTasks.reduce((acc, t) => acc + t.rewardSOL, 0);
  const completedTasksCount = userCreatedTasks.filter((t) => t.status === 'completed').length;
  const approvedSubmissionsCount = userSubmissions.filter((s) => s.submission.status === 'approved').length;
  const totalEarnedSol = userSubmissions
    .filter((s) => s.submission.status === 'approved')
    .reduce((acc, s) => acc + (s.submission.payoutAmountSOL || s.task.rewardSOL), 0);

  const handleCopyWallet = () => {
    if (!linkedWallet) return;
    navigator.clipboard.writeText(linkedWallet);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const isDev = role === 'developer';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#14F195]" />
            <h2 className="text-base font-bold text-white">Профиль участника</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* User Hero Card */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/80 to-[#141229] border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl p-0.5 flex items-center justify-center shadow-lg ${
                  isDev 
                    ? 'bg-gradient-to-tr from-[#14F195] to-emerald-400 shadow-emerald-500/10' 
                    : 'bg-gradient-to-tr from-[#9945FF] to-purple-400 shadow-purple-500/10'
                }`}>
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-white font-mono text-xl">
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-lg tracking-tight">{name}</h3>
                    <span title="Верифицированный профиль">
                      <ShieldCheck className="w-4 h-4 text-[#14F195]" />
                    </span>
                  </div>
                  <div className="text-xs text-[#14F195] font-mono font-semibold">
                    @{login}
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              <div className="sm:self-start">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  isDev 
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' 
                    : 'bg-purple-950/60 text-purple-300 border-purple-800/80'
                }`}>
                  {isDev ? (
                    <>
                      <Code2 className="w-4 h-4 text-[#14F195]" />
                      <span>Роль: Разработчик</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span>Роль: Заказчик</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Member meta info */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>На платформе с {createdAt}</span>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
                <span className="text-slate-300">Статус: Активен в сети</span>
              </div>
            </div>
          </div>

          {/* Linked Solana Wallet */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-purple-400" />
                <span>Solana-кошелёк участника:</span>
              </span>

              {linkedWallet && (
                <a
                  href={`https://explorer.solana.com/address/${linkedWallet}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#14F195] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Solana Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {linkedWallet ? (
              <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between gap-2 font-mono text-[11px]">
                <span className="text-slate-200 truncate">{linkedWallet}</span>
                <button
                  onClick={handleCopyWallet}
                  className="p-1 hover:text-[#14F195] text-slate-400 transition-colors cursor-pointer shrink-0"
                  title="Скопировать адрес"
                >
                  {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-lg text-slate-500 text-[11px] italic">
                Кошелек еще не привязан к этому профилю
              </div>
            )}
          </div>

          {/* Performance KPIs / Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {!isDev ? (
              <>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Создано задач</div>
                  <div className="font-mono text-lg font-bold text-white mt-0.5">
                    {userCreatedTasks.length}
                  </div>
                  <div className="text-[10px] text-slate-500">Микро-задач</div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-[11px]">В Escrow казне</div>
                  <div className="font-mono text-lg font-bold text-[#14F195] mt-0.5">
                    {totalEscrowDeposited.toFixed(1)} SOL
                  </div>
                  <div className="text-[10px] text-slate-500">Заморожено наград</div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Закрыто задач</div>
                  <div className="font-mono text-lg font-bold text-purple-300 mt-0.5">
                    {completedTasksCount}
                  </div>
                  <div className="text-[10px] text-slate-500">Выплачено разработчикам</div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Получено PR</div>
                  <div className="font-mono text-lg font-bold text-amber-400 mt-0.5">
                    {userCreatedTasks.reduce((acc, t) => acc + t.submissions.length, 0)}
                  </div>
                  <div className="text-[10px] text-slate-500">Решений от сообщества</div>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Сдано PRs</div>
                  <div className="font-mono text-lg font-bold text-white mt-0.5">
                    {userSubmissions.length}
                  </div>
                  <div className="text-[10px] text-slate-500">Решений задач</div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Одобрено PRs</div>
                  <div className="font-mono text-lg font-bold text-[#14F195] mt-0.5">
                    {approvedSubmissionsCount}
                  </div>
                  <div className="text-[10px] text-slate-500">Успешно приняты</div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Заработано SOL</div>
                  <div className="font-mono text-lg font-bold text-[#14F195] mt-0.5">
                    {totalEarnedSol.toFixed(1)} SOL
                  </div>
                  <div className="text-[10px] text-slate-500">Выплаты из Escrow</div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Proof of Code</div>
                  <div className="font-mono text-lg font-bold text-purple-300 mt-0.5">
                    {userPocRecords.length}
                  </div>
                  <div className="text-[10px] text-slate-500">Ончейн-записей</div>
                </div>
              </>
            )}
          </div>

          {/* Activity Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                {!isDev ? (
                  <>
                    <Layers className="w-4 h-4 text-[#9945FF]" />
                    <span>Опубликованные задачи заказчика ({userCreatedTasks.length})</span>
                  </>
                ) : (
                  <>
                    <GitPullRequest className="w-4 h-4 text-[#14F195]" />
                    <span>История решений и Pull Requests ({userSubmissions.length})</span>
                  </>
                )}
              </h4>
            </div>

            {/* List for Customer */}
            {!isDev && (
              <div className="space-y-2.5">
                {userCreatedTasks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 border border-slate-800/60 rounded-xl text-slate-400 space-y-1">
                    <p className="font-medium text-white">У этого заказчика пока нет опубликованных задач</p>
                    <p className="text-[11px] text-slate-500">Новые задачи появятся здесь после публикации в Escrow</p>
                  </div>
                ) : (
                  userCreatedTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (onSelectTask) {
                          onSelectTask(t);
                          onClose();
                        }
                      }}
                      className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate hover:text-[#14F195]">
                            {t.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{t.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-500">Срок: {t.deadline}</span>
                          <span aria-hidden="true">·</span>
                          <span>Заявок: {t.submissions.length}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-white text-sm">
                          {t.rewardSOL.toFixed(1)} SOL
                        </div>
                        <div>
                          {t.status === 'completed' ? (
                            <span className="text-[10px] text-purple-300 font-semibold">Выплачено</span>
                          ) : t.status === 'under_review' ? (
                            <span className="text-[10px] text-amber-400 font-semibold">На проверке</span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold">Открыт</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* List for Developer */}
            {isDev && (
              <div className="space-y-2.5">
                {userSubmissions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 border border-slate-800/60 rounded-xl text-slate-400 space-y-1">
                    <p className="font-medium text-white">У этого разработчика пока нет отправленных решений</p>
                    <p className="text-[11px] text-slate-500">После сдачи Pull Request решения отобразятся здесь</p>
                  </div>
                ) : (
                  userSubmissions.map(({ task: t, submission: s }) => (
                    <div
                      key={s.id}
                      className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white text-xs truncate">
                          {t.title}
                        </span>
                        <span className="font-mono font-bold text-[#14F195] text-xs shrink-0">
                          {t.rewardSOL} SOL
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <a
                          href={s.githubPrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#14F195] hover:underline font-mono inline-flex items-center gap-1"
                        >
                          <GitPullRequest className="w-3 h-3" />
                          <span>{s.githubPrUrl}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                        </a>

                        {s.status === 'approved' ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#14F195]" />
                            <span>PR Одобрен</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>На проверке</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#14F195]" />
            <span>SolBounties Protocol Network</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
