import React from 'react';
import { 
  GitPullRequest, ShieldCheck, Zap, Lock, DollarSign, 
  Code, CheckCircle, ArrowRight, FileCheck, Layers
} from 'lucide-react';

interface HowItWorksViewProps {
  onGoToTasks: () => void;
  onGoToCreate: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({
  onGoToTasks,
  onGoToCreate,
}) => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#14F195] bg-[#14F195]/10 border border-[#14F195]/30 px-3 py-1 rounded-full">
          <span>SolBounties Protocol Overview</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Как устроена платформа микро-задач
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Прозрачное взаимодействие между Web3-стартапами и разработчиками на базе смарт-контрактов Solana Escrow и неизменяемого Proof of Code.
        </p>
      </div>

      {/* Two columns: Developer vs Startup Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* For Developers */}
        <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#14F195] flex items-center justify-center font-bold">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Для разработчиков</h2>
                <p className="text-xs text-slate-400">Зарабатывайте SOL и создавайте ончейн-портфолио</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-[#14F195] flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Выберите задачу</h3>
                  <p className="text-slate-400 mt-0.5">
                    Изучите требования, ссылку на репозиторий и размер награды в SOL. Вы уверены в оплате: средства уже лежат в Escrow контракте.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-[#14F195] flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Сдайте GitHub Pull Request</h3>
                  <p className="text-slate-400 mt-0.5">
                    Сделайте fork, решите задачу, напишите тесты и отправьте ссылку на созданный PR через кнопку «Сдать PR».
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-[#14F195] flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Получите выплату и Proof of Code</h3>
                  <p className="text-slate-400 mt-0.5">
                    При слиянии PR смарт-контракт мгновенно переводит SOL на ваш кошелек и создает не подделываемый Proof of Code в вашем ончейн-профиле.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={onGoToTasks}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Смотреть открытые задачи</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* For Startups / Open Source */}
        <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Для заказчиков и проектов</h2>
                <p className="text-xs text-slate-400">Быстро закрывайте точечные задачи без бюрократии найма</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-purple-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Опубликуйте таск и заблокируйте SOL</h3>
                  <p className="text-slate-400 mt-0.5">
                    Укажите репозиторий, issue и требования. Вознаграждение замораживается на автономном Solana Escrow PDA аккаунте.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-purple-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Получите Pull Requests от разработчиков</h3>
                  <p className="text-slate-400 mt-0.5">
                    Квалифицированные Web3-разработчики присылают готовый код с тестами. Никаких пустых откликов без кода.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-purple-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Одобрите релиз в 1 клик</h3>
                  <p className="text-slate-400 mt-0.5">
                    После код-ревью подтвердите слияние. Смарт-контракт автоматически выплачивает награду разработчику.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={onGoToCreate}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Опубликовать задачу</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Why SolBounties vs Traditional Fiat Freelance */}
      <div className="rounded-2xl border border-slate-800 bg-[#090D16] p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white text-center">
          Почему SolBounties лучше традиционных бирж
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-[#14F195] font-semibold text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Мгновенные выплаты
            </div>
            <p className="text-slate-400 leading-relaxed">
              Без вывода на банковские карты по 5 дней, без валютного контроля и блокировок счетов. Выплата в SOL или стейблкоинах занимает секунды с комиссией $0.0001.
            </p>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-purple-400 font-semibold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Proof of Code
            </div>
            <p className="text-slate-400 leading-relaxed">
              Резюме разработчика — это не список слов, а проверяемые ончейн-ссылки на реальные GitHub PRs с хэшами транзакций в Solana Explorer.
            </p>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-blue-400 font-semibold text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              Защита Solana Escrow
            </div>
            <p className="text-slate-400 leading-relaxed">
              Средства заморожены на автономном смарт-контракте до выполнения работы. Никакого кидалова со стороны недобросовестных заказчиков.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
