import React from 'react';

interface ShareToTwitterButtonProps {
  devName: string;
  rewardSOL: number;
  taskTitle: string;
  txHash?: string;
  variant?: 'primary' | 'subtle' | 'compact';
  className?: string;
}

export function shareProofOfCodeToX({
  devName,
  rewardSOL,
  taskTitle,
  txHash,
}: {
  devName: string;
  rewardSOL: number;
  taskTitle: string;
  txHash?: string;
}) {
  const explorerUrl = txHash
    ? `https://explorer.solana.com/tx/${txHash}?cluster=devnet`
    : 'https://explorer.solana.com/?cluster=devnet';
  const cleanDev = devName.startsWith('@') ? devName : `@${devName}`;

  const tweetText = `🚀 Just verified "${taskTitle}" on @SolBounties!\n💰 Earned: ${rewardSOL} SOL\n👨‍💻 Contributor: ${cleanDev}\n🔗 Onchain Proof of Code on @Solana:\n${explorerUrl}\n\n#Solana #SolBounties #ProofOfCode #Web3 #Colosseum`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  window.open(twitterUrl, '_blank', 'noopener,noreferrer');
}

export const ShareToTwitterButton: React.FC<ShareToTwitterButtonProps> = ({
  devName,
  rewardSOL,
  taskTitle,
  txHash,
  variant = 'primary',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareProofOfCodeToX({ devName, rewardSOL, taskTitle, txHash });
  };

  // SVG for X (formerly Twitter) logo
  const XIcon = () => (
    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title="Поделиться Proof of Code в X (Twitter)"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white bg-black hover:bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg transition-all shadow-sm cursor-pointer ${className}`}
      >
        <XIcon />
        <span>Share to X</span>
      </button>
    );
  }

  if (variant === 'subtle') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-black hover:text-white border border-slate-700/80 hover:border-slate-500 rounded-xl transition-all cursor-pointer shadow-sm ${className}`}
      >
        <XIcon />
        <span>Поделиться в X (Twitter)</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-900 border border-neutral-700 hover:border-white/40 rounded-xl transition-all shadow-md hover:shadow-black/40 cursor-pointer ${className}`}
    >
      <XIcon />
      <span>Share Proof of Code to X</span>
    </button>
  );
};
