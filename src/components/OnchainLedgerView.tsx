import React, { useState } from 'react';
import { OnchainRecord } from '../types';
import { 
  Terminal, ExternalLink, CheckCircle2, Clock, Send, 
  AlertCircle, ShieldCheck, Copy, Check, Sparkles 
} from 'lucide-react';

interface OnchainLedgerViewProps {
  records: OnchainRecord[];
  walletAddress: string | null;
  onSendMemo: (text: string) => Promise<string | undefined>;
  isWriting: boolean;
}

export const OnchainLedgerView: React.FC<OnchainLedgerViewProps> = ({
  records,
  walletAddress,
  onSendMemo,
  isWriting,
}) => {
  const [customText, setCustomText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);
  const [copiedSig, setCopiedSig] = useState<string | null>(null);

  const handleWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setStatusMsg(null);

    try {
      const sig = await onSendMemo(customText.trim());
      if (sig) {
        setStatusMsg({
          type: 'success',
          text: 'Записано в блокчейн',
          link: `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
        });
        setCustomText('');
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Ошибка отправки транзакции',
      });
    }
  };

  const handleCopy = (sig: string) => {
    navigator.clipboard.writeText(sig);
    setCopiedSig(sig);
    setTimeout(() => setCopiedSig(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#14F195]">
          <Terminal className="w-4 h-4" />
          <span>Solana Devnet · Программа Memo</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Ончейн-записи в блокчейне Solana
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Каждое важное действие на платформе (публикация таска, сдача решения, подтверждение Proof of Code) фиксируется реальной транзакцией в Solana Devnet через официальную программу <code className="text-slate-200 font-mono">MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr</code>.
        </p>

        {/* Live writing form */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9945FF]" />
            <span>Прямая запись в блокчейн через Phantom</span>
          </h3>

          <form onSubmit={handleWrite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Введите текст для записи в блокчейн Solana (например: SolBounties Proof of Code...)"
              disabled={isWriting}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isWriting || !customText.trim()}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {isWriting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Записываем в блокчейн…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Записать в блокчейн</span>
                </>
              )}
            </button>
          </form>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>

              {statusMsg.link && (
                <a
                  href={statusMsg.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline flex items-center gap-1 text-[#14F195] hover:text-white"
                >
                  <span>Посмотреть запись в Solana Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {!walletAddress && (
            <div className="text-[11px] text-amber-400/90 flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Для отправки транзакции подключите кошелек Phantom вверху справа.</span>
            </div>
          )}
        </div>
      </div>

      {/* List of Onchain Records */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#14F195]" />
            <span>Реестр подтвержденных записей ({records.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Cluster: devnet</span>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#0F172A]/50 space-y-2">
            <Terminal className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Список записей пуст</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Когда вы создаете таск, отправляете Pull Request или подтверждаете выплату, транзакции с программой Memo сохранятся здесь с прямыми ссылками на Solana Explorer.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-slate-800 bg-[#0F172A] hover:border-slate-700 transition-all space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-white">{rec.text}</span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rec.timestamp}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-slate-500">Сигнатура:</span>
                    <span className="truncate max-w-[180px] sm:max-w-md">{rec.signature}</span>
                    <button
                      onClick={() => handleCopy(rec.signature)}
                      className="text-slate-400 hover:text-white cursor-pointer ml-1"
                      title="Копировать сигнатуру"
                    >
                      {copiedSig === rec.signature ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <a
                    href={rec.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#14F195] hover:underline font-sans font-medium"
                  >
                    <span>Посмотреть запись</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
