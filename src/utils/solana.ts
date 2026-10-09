import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

export const DEVNET_RPC = 'https://api.devnet.solana.com';
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export interface OnchainRecord {
  id: string;
  text: string;
  signature: string;
  timestamp: string;
  explorerUrl: string;
}

export function getPhantomProvider(): any {
  if (typeof window === 'undefined') return null;

  const anyWindow = window as any;
  if (anyWindow.phantom?.solana?.isPhantom) {
    return anyWindow.phantom.solana;
  }
  if (anyWindow.solana?.isPhantom) {
    return anyWindow.solana;
  }
  return null;
}

export async function fetchDevnetBalance(publicKeyStr: string): Promise<number> {
  try {
    const connection = new Connection(DEVNET_RPC, 'confirmed');
    const pubKey = new PublicKey(publicKeyStr);
    const lamports = await connection.getBalance(pubKey);
    return lamports / 1_000_000_000;
  } catch (err) {
    console.warn('Не удалось получить баланс devnet:', err);
    return 0;
  }
}

export async function sendDevnetMemo(
  provider: any,
  memoText: string
): Promise<{ signature: string; explorerUrl: string }> {
  if (!provider || !provider.publicKey) {
    throw new Error('Кошелек не подключен. Сначала подключите Phantom.');
  }

  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const userPublicKey = new PublicKey(provider.publicKey.toString());

  // Use TextEncoder (DO NOT use Buffer per user constraint)
  const encodedMemo = new TextEncoder().encode(memoText);

  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: userPublicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: encodedMemo as any,
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: userPublicKey,
  }).add(memoInstruction);

  try {
    const { signature } = await provider.signAndSendTransaction(transaction);
    
    // Wait for confirmation on devnet
    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    return { signature, explorerUrl };
  } catch (err: any) {
    if (err?.code === 4001 || err?.message?.includes('User rejected')) {
      throw new Error('Транзакция отменена пользователем в Phantom.');
    }
    if (err?.message?.includes('Attempt to debit an account but found no record') || err?.message?.includes('insufficient funds')) {
      throw new Error('Недостаточно SOL в сети Devnet для оплаты комиссии. Запросите тестовые SOL через faucet.');
    }
    throw new Error(err?.message || 'Ошибка отправки транзакции в Solana devnet.');
  }
}
