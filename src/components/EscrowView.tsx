import React, { useState } from 'react';
import { BountyTask } from '../types';
import { 
  Lock, Shield, ArrowRight, CheckCircle2, Copy, Check, 
  ExternalLink, Coins, Layers, Zap, KeyRound
} from 'lucide-react';

interface EscrowViewProps {
  tasks: BountyTask[];
  onSelectTask: (task: BountyTask) => void;
  onViewExplorer: (txHash: string) => void;
}

export const EscrowView: React.FC<EscrowViewProps> = ({
  tasks,
  onSelectTask,
  onViewExplorer,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const totalLocked = tasks.reduce(
    (acc, t) => acc + (t.status !== 'completed' ? t.rewardSOL : 0), 
    0
  );

  const totalDisbursed = tasks.reduce(
    (acc, t) => acc + (t.status === 'completed' ? t.rewardSOL : 0), 
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Overview Hero */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#14F195]">
          <Lock className="w-4 h-4" />
          <span>Архитектура децентрализованного депонирования</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Solana Escrow & Smart Contract Vaults
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Все выплаты защищены смарт-контрактом на Solana. При создании таска проект депонирует средства на автономный Program Derived Address (PDA). Разработчик защищен от невыплаты, а проект — от некачественной работы: средства переводятся только после проверки и одобрения GitHub Pull Request.
        </p>

        {/* Global Vault Statistics */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Сейчас заблокировано в PDA</div>
            <div className="font-mono text-2xl font-bold text-[#14F195] tabular-nums mt-1">
              {totalLocked.toFixed(1)} SOL
            </div>
            <div className="text-[11px] text-slate-500">
              ≈ ${(totalLocked * 150).toLocaleString()} USDC
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Успешно выплачено разработчикам</div>
            <div className="font-mono text-2xl font-bold text-white tabular-nums mt-1">
              {totalDisbursed.toFixed(1)} SOL
            </div>
            <div className="text-[11px] text-slate-500">
              Через атомарные релизы
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Программа Escrow</div>
            <div className="font-mono text-xs font-semibold text-purple-300 mt-2 truncate">
              ESCRW_PROGRAM_ID_11111111111111111111111111
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Solana Devnet / Anchor 0.30
            </div>
          </div>
        </div>
      </div>

      {/* Mechanism Architecture Diagram */}
      <div className="rounded-2xl border border-slate-800 bg-[#090D16] p-6 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#14F195]" />
          <span>Как работает Solana Escrow без посредников</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-sm font-semibold text-white">Заморозка средств в PDA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Заказчик инициирует транзакцию <code className="text-slate-300">initialize_escrow</code>. SOL списываются с кошелька проекта и поступают на автономный PDA-аккаунт. Заказчик не может просто так отозвать средства, пока активен срок задачи.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-sm font-semibold text-white">Сдача GitHub Pull Request</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Разработчик решает задачу в публичном репозитории и отправляет ссылку на Pull Request. Платформа фиксирует заявку, привязывает кошелек разработчика и запускает процесс проверки кода.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-sm font-semibold text-white">Мгновенная выплата + Proof of Code</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              При слиянии или одобрении PR вызывается инструкция <code className="text-slate-300">settle_and_release</code>. Смарт-контракт мгновенно переводит SOL разработчику и одновременно записывает неизменяемый Proof of Code в реестр.
            </p>
          </div>
        </div>
      </div>

      {/* Escrow Accounts Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Реестр активных Escrow-контрактов ({tasks.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Devnet Cluster</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-3 px-4">Задача / Проект</th>
                <th className="py-3 px-4">Escrow PDA Адрес</th>
                <th className="py-3 px-4 text-right">Сумма в Escrow</th>
                <th className="py-3 px-4">Статус контракта</th>
                <th className="py-3 px-4 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {task.author.org} · {task.categoryLabel}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300 truncate max-w-[140px] sm:max-w-[180px]">
                        {task.escrowAddress}
                      </span>
                      <button
                        onClick={() => handleCopy(task.escrowAddress)}
                        className="text-slate-500 hover:text-white cursor-pointer transition-colors"
                        title="Скопировать PDA"
                      >
                        {copiedAddress === task.escrowAddress ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    <span className="text-white">{task.rewardSOL.toFixed(1)} SOL</span>
                    <div className="text-[10px] text-slate-500 font-normal">
                      ${task.rewardUSDC} USDC
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {task.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Средства выплачены
                      </span>
                    ) : task.status === 'under_review' ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        PR на проверке
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        Заморожено в Escrow
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectTask(task)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                    >
                      Детали
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
