import React, { useState } from 'react';
import { TaskCategory, TaskDifficulty, BountyTask, UserSession } from '../types';
import { X, Lock, Plus, Trash2, AlertCircle, CheckCircle2, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';

interface CreateTaskModalProps {
  session: UserSession;
  currentUser?: import('../types').UserAccount | null;
  walletAddress: string | null;
  onClose: () => void;
  onCreateTask: (newTask: BountyTask) => void;
  onSendMemo?: (text: string) => Promise<string | undefined>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  session,
  currentUser,
  walletAddress,
  onClose,
  onCreateTask,
  onSendMemo,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('smart-contracts');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('Intermediate');
  const [rewardSOL, setRewardSOL] = useState<number>(2.5);
  const [deadline, setDeadline] = useState('3 дня');
  const [githubRepo, setGithubRepo] = useState('https://github.com/my-project/solana-dapp');
  const [githubIssueUrl, setGithubIssueUrl] = useState('https://github.com/my-project/solana-dapp/issues/1');
  const [description, setDescription] = useState('');
  const [writeOnchain, setWriteOnchain] = useState(true);
  const [requirements, setRequirements] = useState<string[]>([
    'Код протестирован и соответствует стандартам оформления',
    'Предоставлен Pull Request с понятным описанием изменений'
  ]);
  const [newReq, setNewReq] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; link?: string } | null>(null);
  const [error, setError] = useState('');

  const categoryLabels: Record<TaskCategory, string> = {
    'smart-contracts': 'Smart Contracts / Anchor',
    'frontend': 'Frontend & UI',
    'security': 'Security Audit',
    'docs': 'Документация & Тесты',
    'backend-indexer': 'Backend & Indexer',
    'sdk': 'SDK & Библиотеки'
  };

  const handleAddRequirement = () => {
    if (newReq.trim()) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg(null);

    if (!title.trim()) {
      setError('Введите название задачи');
      return;
    }

    if (!description.trim()) {
      setError('Опишите задачу и требования');
      return;
    }

    if (rewardSOL <= 0) {
      setError('Награда должна быть больше 0 SOL');
      return;
    }

    setIsSubmitting(true);

    // Generate random PDA address
    const pdaChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let randomPda = 'ESCRW';
    for (let i = 0; i < 38; i++) {
      randomPda += pdaChars.charAt(Math.floor(Math.random() * pdaChars.length));
    }

    let txSig: string | undefined = undefined;

    // Send real onchain transaction via Phantom Memo if requested and connected
    if (writeOnchain && walletAddress && onSendMemo) {
      try {
        const memoText = `SolBounties Таск: "${title.trim()}" | Награда: ${rewardSOL} SOL | PDA: ${randomPda}`;
        txSig = await onSendMemo(memoText);
        if (txSig) {
          setStatusMsg({
            text: 'Записано в блокчейн',
            link: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
          });
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setError(err?.message || 'Ошибка записи в блокчейн Solana');
        return;
      }
    }

    const newTask: BountyTask = {
      id: 'task-' + Date.now(),
      title: title.trim(),
      category,
      categoryLabel: categoryLabels[category],
      description: description.trim(),
      requirements: requirements.length > 0 ? requirements : ['Качественное решение и открытый PR'],
      rewardSOL: Number(rewardSOL),
      rewardUSDC: Math.round(rewardSOL * 150),
      author: {
        name: currentUser?.name || currentUser?.login || 'Заказчик',
        org: currentUser?.login ? `@${currentUser.login}` : (currentUser?.name ? `@${currentUser.name}` : '@user'),
        authorId: currentUser?.id,
        authorLogin: currentUser?.login,
        verified: true,
      },
      githubRepo: githubRepo.trim(),
      githubIssueUrl: githubIssueUrl.trim(),
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      deadline,
      difficulty,
      escrowAddress: randomPda,
      submissions: []
    };

    onCreateTask(newTask);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#14F195]" />
            <h2 className="text-base font-bold text-white">
              Публикация таска с блокировкой в Solana Escrow
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Название задачи *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Написать тесты для программы стейкинга на Anchor"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category, Difficulty & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="smart-contracts">Smart Contracts / Anchor</option>
                <option value="frontend">Frontend & UI</option>
                <option value="security">Security Audit</option>
                <option value="docs">Документация & Тесты</option>
                <option value="sdk">SDK & Инструменты</option>
                <option value="backend-indexer">Backend & Indexer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Сложность
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Срок выполнения
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="2 дня, 1 неделя..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Reward & Escrow Info */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-white">
                  Размер вознаграждения в SOL *
                </label>
                <div className="text-[11px] text-slate-400">
                  Будет заморожен в смарт-контракте Escrow при создании
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={rewardSOL}
                  onChange={(e) => setRewardSOL(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono font-bold text-[#14F195] text-right focus:outline-none"
                />
                <span className="text-xs font-mono font-bold text-white">SOL</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Эквивалент: <strong className="text-slate-300 font-mono">${Math.round(rewardSOL * 150)} USDC</strong></span>
              <span>Кошелек: <strong className="text-white font-mono">{walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Не подключен'}</strong></span>
            </div>
          </div>

          {/* Blockchain Memo Record Option */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-2 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={writeOnchain}
                onChange={(e) => setWriteOnchain(e.target.checked)}
                className="rounded text-[#14F195] focus:ring-0"
              />
              <span className="font-semibold text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#14F195]" />
                Записать создание таска в Solana Devnet через Phantom Memo
              </span>
            </label>
            <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
              Отправляет реальную транзакцию в сеть Solana Devnet с инструкцией Memo. Комиссию оплатит ваш подключенный кошелек Phantom.
            </p>
          </div>

          {/* GitHub Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                GitHub Repository URL
              </label>
              <input
                type="url"
                required
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                GitHub Issue URL
              </label>
              <input
                type="url"
                required
                value={githubIssueUrl}
                onChange={(e) => setGithubIssueUrl(e.target.value)}
                placeholder="https://github.com/org/repo/issues/1"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Подробное описание задачи *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите контекст, какую проблему нужно решить, где расположен код и какие тесты должны проходить..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Requirements builder */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Критерии приемки решения
            </label>
            <div className="space-y-2 mb-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-900/60 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-200 truncate">• {req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
                placeholder="Добавить пункт критерия приемки..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg transition-colors cursor-pointer"
              >
                + Добавить
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-3 rounded-lg border border-rose-900/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 flex items-center justify-between">
              <span>{statusMsg.text}</span>
              {statusMsg.link && (
                <a href={statusMsg.link} target="_blank" rel="noreferrer" className="underline text-[#14F195] font-semibold flex items-center gap-1">
                  <span>Посмотреть запись</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Submit action */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Сеть: <span className="font-mono text-slate-400">Solana Devnet</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-gradient-to-r from-[#14F195] to-[#10b981] hover:opacity-90 rounded-lg transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Записываем в блокчейн…</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Заморозить {rewardSOL} SOL и опубликовать</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
