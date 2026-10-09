import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, CheckCircle2, Shield, Terminal, ArrowUpRight } from 'lucide-react';

interface SolanaExplorerModalProps {
  txHash: string;
  onClose: () => void;
}

export const SolanaExplorerModal: React.FC<SolanaExplorerModalProps> = ({
  txHash,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#090D16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header styled like Solana Explorer */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] flex items-center justify-center text-[10px] font-bold text-slate-900">
              ◎
            </div>
            <span className="font-mono text-sm font-bold text-white tracking-tight">
              Solana Explorer · Transaction Details
            </span>
            <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded font-mono">
              Devnet
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explorer Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs font-mono">
          {/* Status badge & signature */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Результат:</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-sans font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Success (Confirmed on 32+ validators)
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-sans block mb-1">Сигнатура транзакции (Signature):</span>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-200">
                <span className="break-all">{txHash}</span>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-white ml-2 transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Block & Fee data */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-sans">
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[11px]">Slot</span>
              <div className="font-mono text-sm font-semibold text-white mt-0.5">298,412,034</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[11px]">Fee</span>
              <div className="font-mono text-sm font-semibold text-[#14F195] mt-0.5">0.000005 SOL</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-500 text-[11px]">Confirmation</span>
              <div className="font-mono text-sm font-semibold text-purple-300 mt-0.5">Finalized (MAX)</div>
            </div>
          </div>

          {/* Instruction Execution */}
          <div className="space-y-2">
            <div className="text-slate-300 font-sans font-semibold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Instruction 1: SolBounties Escrow Program</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
              <div className="text-purple-300 font-semibold">
                &gt; Program: ESCRW_PROGRAM_ID_11111111111111111111111111
              </div>
              <div>&gt; Instruction: <span className="text-[#14F195]">SettleAndReleaseBounty</span></div>
              <div className="text-slate-500"># Log messages:</div>
              <div className="text-slate-400">&gt; Program log: Instruction: SettleAndReleaseBounty</div>
              <div className="text-slate-400">&gt; Program log: Verifying GitHub Pull Request URI and author signature</div>
              <div className="text-emerald-400">&gt; Program log: Escrow verification PASSED. Releasing locked funds.</div>
              <div className="text-slate-400">&gt; Program log: Emitting ProofOfCodeMintEvent(dev, pr_url, amount_sol)</div>
              <div className="text-emerald-400">&gt; Program ESCRW_PROGRAM_ID_11111111111111111111111111 success</div>
            </div>
          </div>

          {/* Account Balances Change */}
          <div className="space-y-2 font-sans">
            <span className="text-slate-300 font-semibold text-xs">Изменение балансов аккаунтов (Lamport Deltas):</span>
            <div className="divide-y divide-slate-800/80 bg-slate-900/60 rounded-xl border border-slate-800 p-3 text-xs">
              <div className="flex items-center justify-between py-1.5 font-mono">
                <span className="text-slate-400">Escrow PDA Account (Sender)</span>
                <span className="text-rose-400">-3,500,000,000 Lamports</span>
              </div>
              <div className="flex items-center justify-between py-1.5 font-mono">
                <span className="text-slate-400">Developer Wallet (Recipient)</span>
                <span className="text-[#14F195]">+3,499,995,000 Lamports</span>
              </div>
              <div className="flex items-center justify-between py-1.5 font-mono">
                <span className="text-slate-400">Network Leader Validator (Fee)</span>
                <span className="text-slate-300">+5,000 Lamports</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 flex items-center justify-between text-slate-500 font-sans text-[11px]">
            <span>Запись сохранена в неизменяемом хранилище Solana.</span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
