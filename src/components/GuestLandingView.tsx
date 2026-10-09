import React from 'react';
import { 
  Zap, Lock, GitPullRequest, ShieldCheck, ArrowRight, 
  Code2, Building2, CheckCircle2, User, Coins, Terminal, Sparkles, UserPlus 
} from 'lucide-react';

interface GuestLandingViewProps {
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onQuickTestLogin: () => void;
  onLoadSampleBounties?: () => void;
}

export const GuestLandingView: React.FC<GuestLandingViewProps> = ({
  onOpenAuth,
  onQuickTestLogin,
  onLoadSampleBounties,
}) => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0F172A] via-[#090D16] to-[#0D1527] p-8 sm:p-12 overflow-hidden text-center max-w-4xl mx-auto shadow-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#14F195] bg-[#14F195]/10 border border-[#14F195]/30 px-3.5 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>Децентрализованная Web3-платформа микро-задач</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
          SolBounties — микро-задачи с гарантией <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]">Solana Escrow</span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Web3-платформа микро-задач для разработчиков и заказчиков. Проекты публикуют таски и замораживают оплату в Solana Escrow, а программисты делают работу, прокачивают свое ончейн-портфолио и моментально получают выплаты.
        </p>

        {/* Guest Action Panel */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-6 py-3 text-sm font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Войти в аккаунт</span>
          </button>

          <button
            onClick={() => onOpenAuth('register')}
            className="px-5 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-[#14F195]" />
            <span>Регистрация</span>
          </button>

          <button
            onClick={onQuickTestLogin}
            className="px-5 py-3 text-sm font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            title="Быстрый вход под пользователем test"
          >
            <Sparkles className="w-4 h-4 text-[#9945FF]" />
            <span>Быстрый вход (test)</span>
          </button>

          {onLoadSampleBounties && (
            <button
              onClick={() => {
                onLoadSampleBounties();
                onQuickTestLogin();
              }}
              className="px-5 py-3 text-sm font-semibold text-[#14F195] bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/60 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-950/40"
              title="Загрузить демо-задачи и сразу войти для судей хакатона"
            >
              <Sparkles className="w-4 h-4 text-[#14F195]" />
              <span>Загрузить демо-задачи (Demo)</span>
            </button>
          )}
        </div>

        <div className="mt-6 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 max-w-lg mx-auto flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Без учетной записи нельзя сдать или опубликовать таск. Войдите или зарегистрируйтесь.</span>
        </div>
      </div>

      {/* Target Audiences and Problems Solved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#0F172A] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Для Заказчиков и Web3-проектов</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Нанимать человека в штат дорого, а на обычных фриланс-биржах долго и неудобно расплачиваться фиатом. Проектам нужно быстро закрывать точечные задачи без найма в штат — написать тесты, исправить баг, сверстать UI-компонент или написать документацию.
          </p>
          <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
              <span>Заморозка оплаты в Solana Escrow перед публикацией</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
              <span>Проверка работы через реальный GitHub Pull Request</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
              <span>Оплата исполнителю в 1 клик при одобрении решения</span>
            </li>
          </ul>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#0F172A] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#14F195] flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Для разработчиков</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Находите оплачиваемые задания, получайте гарантированные выплаты в SOL/USDC без задержек и комиссий платежных систем. Подтверждайте свой реальный опыт верифицированными ончейн-записями.
          </p>
          <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
              <span>Средства гарантированно заблокированы в Escrow PDA</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
              <span>Верифицированное ончейн-портфолио Proof of Code</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
              <span>Прямой перевод на подключенный Phantom-кошелек</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Proof of Code Highlight */}
      <div className="p-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0F172A] via-[#0B101E] to-[#13102A] max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#14F195] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Proof of Code / Dev Portfolio
            </h3>
            <p className="text-xs text-slate-400">
              Неподделываемое портфолио разработчика в блокчейне Solana
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Когда программист выполняет таск, запись о решенной задаче (вместе со ссылкой на GitHub Pull Request, суммой вознаграждения и криптографической подписью транзакции) сохраняется в его ончейн-профиле на Solana. Это превращается в верифицированное портфолио разработчика, которое невозможно подделать или удалить.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300">
            <span className="text-[#14F195] block text-[11px] mb-1">GitHub PR Verify</span>
            Прямая связь с коммитами и Pull Request
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300">
            <span className="text-purple-400 block text-[11px] mb-1">Solana Explorer</span>
            Транзакции в сети Devnet / Mainnet
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300">
            <span className="text-emerald-400 block text-[11px] mb-1">Escrow Payout</span>
            Гарантированная моментальная выплата
          </div>
        </div>
      </div>

      {/* 3 Step Mechanics */}
      <div className="p-8 rounded-2xl border border-slate-800 bg-[#090D16] max-w-5xl mx-auto space-y-6">
        <h3 className="text-base font-bold text-white text-center">
          Как устроена работа на платформе
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="font-mono text-[#14F195] font-bold text-sm">Шаг 1</div>
            <div className="font-semibold text-white">Публикация & Escrow</div>
            <p className="text-slate-400 leading-relaxed">
              Заказчик формулирует задачу, прикрепляет репозиторий и депонирует вознаграждение в SOL на Escrow PDA.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="font-mono text-[#9945FF] font-bold text-sm">Шаг 2</div>
            <div className="font-semibold text-white">Сдача GitHub PR</div>
            <p className="text-slate-400 leading-relaxed">
              Разработчик выбирает задачу, решает её, открывает Pull Request на GitHub и отправляет ссылку на проверку.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="font-mono text-emerald-400 font-bold text-sm">Шаг 3</div>
            <div className="font-semibold text-white">Выплата & Proof of Code</div>
            <p className="text-slate-400 leading-relaxed">
              Заказчик одобряет PR. Смарт-контракт мгновенно переводит вознаграждение и фиксирует ончейн-запись.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-6 py-2.5 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>Войти и начать работу</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
