import React, { useState, useRef, useEffect } from 'react';
import { UserSession, AppView, UserAccount } from '../types';
import { 
  ShieldCheck, Coins, Wallet, PlusCircle, GitPullRequest, 
  Layers, User, Building2, ExternalLink, LogOut, RefreshCw, Copy, Check, AlertTriangle, KeyRound,
  Zap, Lock, Code2, ClipboardList, X, Shield, Sparkles, Eye
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  session: UserSession;
  currentUser: UserAccount | null;
  onSetRole: (role: 'developer' | 'project') => void;
  walletAddress: string | null;
  walletBalance: number | null;
  isConnectingWallet: boolean;
  walletError: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onRefreshBalance: () => void;
  onClearWalletError: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onQuickTestLogin?: () => void;
  onLoadSampleBounties?: () => void;
  pendingReviewCount?: number;
  mySubmissionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  session,
  currentUser,
  onSetRole,
  walletAddress,
  walletBalance,
  isConnectingWallet,
  walletError,
  onConnectWallet,
  onDisconnectWallet,
  onRefreshBalance,
  onClearWalletError,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  onQuickTestLogin,
  onLoadSampleBounties,
  pendingReviewCount = 0,
  mySubmissionsCount = 0,
}) => {
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDev = session.role === 'developer';

  // Close wallet dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 1800);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/95 backdrop-blur-md">
      {/* Top Meta Bar: Account status and quick role switch or guest status */}
      <div className="border-b border-slate-800/50 bg-[#060910] hidden sm:block">
        {currentUser ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-slate-400">
              <button
                onClick={onOpenProfile}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#14F195]" />
                <span>Аккаунт: <strong className="text-white">@{currentUser.login}</strong> ({currentUser.name})</span>
              </button>

              <span className="text-slate-600">|</span>

              <span className={`font-semibold flex items-center gap-1.5 ${isDev ? 'text-[#14F195]' : 'text-[#9945FF]'}`}>
                {isDev ? <Code2 className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                {isDev ? 'Режим: Разработчик' : 'Режим: Заказчик'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Роль: <strong className={isDev ? 'text-[#14F195]' : 'text-purple-300'}>{isDev ? 'Разработчик' : 'Заказчик'}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <button
                onClick={onOpenProfile}
                className="text-xs text-[#14F195] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                title="Сменить роль в профиле"
              >
                <span>Сменить статус в профиле</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#14F195]" />
              <span>Гостевой режим — ознакомление с платформой SolBounties</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenAuth}
                className="text-xs text-[#14F195] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3 h-3" />
                <span>Войдите или зарегистрируйтесь для работы с задачами</span>
              </button>
              {onQuickTestLogin && (
                <>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={onQuickTestLogin}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Быстрый вход: test</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate(currentUser ? (isDev ? 'tasks' : 'my-tasks') : 'how-it-works')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#9945FF] to-[#14F195] p-[1.5px] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#090D16] rounded-[7px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#14F195]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white font-sans group-hover:text-slate-200 transition-colors">
                SolBounties
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        {currentUser ? (
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm font-medium">
            {isDev ? (
              /* DEVELOPER ROLE NAVIGATION */
              <>
                <button
                  onClick={() => onNavigate('tasks')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'tasks'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-[#14F195]" />
                  <span>Лента задач</span>
                </button>

                <button
                  onClick={() => onNavigate('my-submissions')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'my-submissions'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <GitPullRequest className="w-3.5 h-3.5 text-[#14F195]" />
                  <span>Мои PRs</span>
                  {mySubmissionsCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-mono">
                      {mySubmissionsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('proof-of-code')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'proof-of-code'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#14F195]" />
                  <span>Proof of Code</span>
                </button>

                <button
                  onClick={() => onNavigate('ledger')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'ledger'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-[#14F195]" />
                  <span>Ончейн-записи</span>
                </button>

                <button
                  onClick={() => onNavigate('escrow')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'escrow'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Escrow защита</span>
                </button>
              </>
            ) : (
              /* CUSTOMER / PROJECT ROLE NAVIGATION */
              <>
                <button
                  onClick={() => onNavigate('my-tasks')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'my-tasks'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Мои задачи</span>
                </button>

                <button
                  onClick={() => onNavigate('create')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'create'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#14F195]" />
                  <span>Создать таск</span>
                </button>

                <button
                  onClick={() => onNavigate('review-prs')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'review-prs'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ревью PRs</span>
                  {pendingReviewCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] bg-amber-950 text-amber-400 border border-amber-800 rounded-full font-mono animate-pulse">
                      {pendingReviewCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('ledger')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'ledger'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-[#14F195]" />
                  <span>Ончейн-записи</span>
                </button>

                <button
                  onClick={() => onNavigate('escrow')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'escrow'
                      ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Escrow Казна</span>
                </button>
              </>
            )}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#14F195]" />
              <span>Платформа микро-задач и Solana Escrow</span>
            </span>
          </nav>
        )}

        {/* Zone 3: Actions (Account + Wallet) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User Account / Profile Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Открыть профиль пользователя"
            >
              <User className="w-3.5 h-3.5 text-[#14F195]" />
              <span className="max-w-[80px] sm:max-w-[110px] truncate font-mono">@{currentUser.login}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-[#14F195] hover:bg-[#12da86] rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
              >
                <User className="w-3.5 h-3.5" />
                <span>Войти / Регистрация</span>
              </button>
              {onQuickTestLogin && (
                <button
                  onClick={onQuickTestLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Быстрый вход под пользователем test"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>test</span>
                </button>
              )}
            </div>
          )}

          {/* 1-Click Load Sample Bounties for Hackathon Judges & Evaluator */}
          {onLoadSampleBounties && (
            <button
              onClick={onLoadSampleBounties}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-purple-200 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 hover:border-[#14F195]/60 rounded-lg transition-all cursor-pointer shadow-xs"
              title="Загрузить 3 готовых демо-задачи (Smart Contracts, Frontend, Security Audit) для судей и тестирования"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#14F195]" />
              <span className="hidden sm:inline">Демо-задачи</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}

          {/* Wallet Action (Working Phantom Connection with Address & Balance) */}
          <div className="relative flex items-center gap-2" ref={menuRef}>
            {walletAddress ? (
              /* CONNECTED WALLET STATE */
              <div className="flex items-center gap-2">
                {/* Devnet balance badge */}
                <div 
                  onClick={onRefreshBalance}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono cursor-pointer hover:border-slate-700 transition-colors"
                  title="Нажмите для обновления баланса Devnet"
                >
                  <Coins className="w-3.5 h-3.5 text-[#14F195]" />
                  <span className="text-slate-200 font-semibold tabular-nums">
                    {walletBalance !== null ? `${walletBalance.toFixed(2)} SOL` : '...'}
                  </span>
                  <span className="text-[10px] text-slate-400">devnet</span>
                  <RefreshCw className="w-2.5 h-2.5 text-slate-500 ml-0.5" />
                </div>

                {/* Main wallet button with 4...4 address */}
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
                  <span>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
                </button>

                {/* Dropdown Menu for Connected Wallet */}
                {showWalletMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Phantom Devnet</div>
                      <div className="font-mono text-white text-xs mt-0.5 break-all">
                        {walletAddress}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Баланс:</span>
                        <span className="text-[#14F195] font-mono font-bold">
                          {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : 'Загрузка...'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleCopyWallet}
                        className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{copiedAddr ? 'Скопировано!' : 'Скопировать адрес'}</span>
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onRefreshBalance();
                          setShowWalletMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Обновить баланс</span>
                      </button>

                      <a
                        href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>Solana Explorer</span>
                        </span>
                      </a>
                    </div>

                    <div className="border-t border-slate-800 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setShowWalletMenu(false);
                          onDisconnectWallet();
                        }}
                        className="w-full px-3 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Отключить кошелёк</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CONNECT WALLET BUTTON */
              <button
                disabled={isConnectingWallet}
                onClick={onConnectWallet}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                <Wallet className="w-3.5 h-3.5 text-[#14F195]" />
                <span>{isConnectingWallet ? 'Подключение…' : 'Подключить Phantom'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Error Alert Banner (if Phantom not found or rejected) */}
      {walletError && (
        <div className="bg-amber-950/80 border-b border-amber-900/60 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{walletError}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-100 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Открыть в новой вкладке</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={onClearWalletError}
                className="text-amber-400 hover:text-white px-1.5 py-0.5 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile subnavigation */}
      {currentUser ? (
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-slate-800/60 bg-[#070A11] overflow-x-auto text-xs gap-2">
          <button
            onClick={onOpenProfile}
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0 ${
              isDev ? 'bg-emerald-950/60 text-[#14F195] border border-emerald-900/60' : 'bg-purple-950/60 text-purple-300 border border-purple-900/60'
            }`}
            title="Сменить статус в профиле"
          >
            {isDev ? <Code2 className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
            <span>{isDev ? 'Разработчик' : 'Заказчик'}</span>
          </button>

          {isDev ? (
            <>
              <button
                onClick={() => onNavigate('tasks')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'tasks' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400'}`}
              >
                Задачи
              </button>
              <button
                onClick={() => onNavigate('my-submissions')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'my-submissions' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400'}`}
              >
                Мои PRs
              </button>
              <button
                onClick={() => onNavigate('proof-of-code')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'proof-of-code' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400'}`}
              >
                Proof of Code
              </button>
              <button
                onClick={() => onNavigate('ledger')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'ledger' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400'}`}
              >
                Ончейн
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('my-tasks')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'my-tasks' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400'}`}
              >
                Мои задачи
              </button>
              <button
                onClick={() => onNavigate('create')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'create' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400'}`}
              >
                + Создать
              </button>
              <button
                onClick={() => onNavigate('review-prs')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'review-prs' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400'}`}
              >
                Ревью ({pendingReviewCount})
              </button>
              <button
                onClick={() => onNavigate('ledger')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${currentView === 'ledger' ? 'text-white bg-slate-800 font-semibold' : 'text-slate-400'}`}
              >
                Ончейн
              </button>
            </>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenProfile}
              className="px-2 py-1 text-[11px] text-[#14F195] border border-slate-700 rounded whitespace-nowrap font-mono"
            >
              @{currentUser.login}
            </button>
          </div>
        </div>
      ) : (
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-slate-800/60 bg-[#070A11] text-xs">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Shield className="w-3 h-3 text-[#14F195]" />
            <span>Гостевой режим</span>
          </span>
          <div className="flex items-center gap-2">
            {onQuickTestLogin && (
              <button
                onClick={onQuickTestLogin}
                className="px-2 py-1 text-[11px] text-purple-300 bg-purple-950/40 border border-purple-900/50 rounded font-medium cursor-pointer"
              >
                test
              </button>
            )}
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-[#14F195] rounded-md cursor-pointer"
            >
              Войти
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
