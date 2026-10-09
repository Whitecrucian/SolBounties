import React, { useState } from 'react';
import { UserSession } from '../types';
import { X, Wallet, Check, AlertCircle, Copy, Coins, ShieldCheck, Sparkles, Ghost, Flame, Briefcase, Shield } from 'lucide-react';

interface WalletModalProps {
  session: UserSession;
  onClose: () => void;
  onUpdateSession: (newSession: Partial<UserSession>) => void;
  onRequestFaucet: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  session,
  onClose,
  onUpdateSession,
  onRequestFaucet,
}) => {
  const [copied, setCopied] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const [editingName, setEditingName] = useState(session.devName);

  const supportedWallets = [
    { name: 'Phantom', desc: 'Наиболее популярный кошелек Solana', icon: Ghost, status: 'Скоро в Mainnet' },
    { name: 'Solflare', desc: 'Безопасный кошелек с поддержкой аппаратных ключей', icon: Flame, status: 'Скоро в Mainnet' },
    { name: 'Backpack', desc: 'xNFT и Web3 кошелек нового поколения', icon: Briefcase, status: 'Скоро в Mainnet' },
    { name: 'Ledger', desc: 'Аппаратная защита ключей', icon: Shield, status: 'Скоро в Mainnet' }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(session.devWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFaucet = () => {
    onRequestFaucet();
    setFaucetSuccess(true);
    setTimeout(() => setFaucetSuccess(false), 2500);
  };

  const handleSaveDevName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      onUpdateSession({ devName: editingName.trim().replace(/^@/, '') });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#9945FF]" />
            <h2 className="text-base font-bold text-white">
              Подключение Solana-кошелька
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Status banner */}
          <div className="p-3.5 bg-gradient-to-r from-purple-950/40 to-slate-900 rounded-xl border border-purple-900/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#9945FF]" />
                Wallet Adapter v2
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-purple-300 bg-[#9945FF]/30 border border-[#9945FF]/40">
                Скоро в Mainnet
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Прямой коннект через браузерные расширения Phantom и Solflare станет доступен при развертывании в Mainnet-Beta. Сейчас активен локальный <span className="text-white font-medium">Devnet-профиль</span> для тестирования всех функций платформы.
            </p>
          </div>

          {/* Active Devnet Session Info */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Текущий кошелек (Devnet):</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {session.virtualSolBalance.toFixed(2)} SOL
              </span>
            </div>

            <div className="flex items-center justify-between font-mono bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-300 truncate max-w-[220px]">
                {session.devWallet}
              </span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Копировать адрес"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Faucet action */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Нужно больше SOL для тестов?</span>
              <button
                onClick={handleFaucet}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#14F195] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Coins className="w-3 h-3" />
                <span>+5.0 SOL (Faucet)</span>
              </button>
            </div>
            {faucetSuccess && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>+5.0 тестовых SOL начислено на ваш баланс!</span>
              </div>
            )}
          </div>

          {/* Edit Handle */}
          <form onSubmit={handleSaveDevName} className="space-y-2">
            <label className="block text-slate-400 font-medium">
              Имя разработчика в Proof of Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">@</span>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-lg text-white font-mono focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Сохранить
              </button>
            </div>
          </form>

          {/* List of upcoming wallets */}
          <div className="space-y-2 pt-1">
            <span className="text-slate-400 font-medium">Поддерживаемые провайдеры:</span>
            <div className="space-y-1.5">
              {supportedWallets.map(w => (
                <div key={w.name} className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800/60 rounded-xl opacity-75">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      <w.icon className="w-4 h-4 text-[#14F195]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{w.name}</div>
                      <div className="text-[10px] text-slate-500">{w.desc}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded">
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
