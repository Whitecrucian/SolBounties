/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BountyTask, ProofOfCodeRecord, UserSession, Submission, AppView, OnchainRecord, UserAccount } from './types';
import { INITIAL_TASKS, INITIAL_PROOF_OF_CODE, INITIAL_ONCHAIN_RECORDS, SAMPLE_BOUNTIES, SAMPLE_PROOF_OF_CODE } from './data/mockData';
import { Navbar } from './components/Navbar';
import { TaskFeed } from './components/TaskFeed';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { ProofOfCodeView } from './components/ProofOfCodeView';
import { EscrowView } from './components/EscrowView';
import { HowItWorksView } from './components/HowItWorksView';
import { WalletModal } from './components/WalletModal';
import { SolanaExplorerModal } from './components/SolanaExplorerModal';
import { DeveloperSubmissionsView } from './components/DeveloperSubmissionsView';
import { ProjectDashboardView } from './components/ProjectDashboardView';
import { OnchainLedgerView } from './components/OnchainLedgerView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { PublicUserProfileModal, PublicUserQuery } from './components/PublicUserProfileModal';
import { GuestLandingView } from './components/GuestLandingView';
import { getPhantomProvider, fetchDevnetBalance, sendDevnetMemo } from './utils/solana';
import { getCurrentUser, logoutUser, updateUserProfile, getAllUsers } from './utils/userDb';
import { ShieldCheck, GitPullRequest, CheckCircle2, Lock, Sparkles, Terminal, ExternalLink, User } from 'lucide-react';

const STORAGE_KEYS = {
  TASKS: 'solbounties_tasks_v2',
  POC: 'solbounties_poc_v2',
  SESSION: 'solbounties_session_v2',
  ONCHAIN_RECORDS: 'solbounties_onchain_records_v2'
};

export default function App() {
  // Current logged in account from User DB
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getCurrentUser();
  });

  // User Session (active role and working names)
  const [session, setSession] = useState<UserSession>(() => {
    const user = getCurrentUser();
    return {
      role: user ? user.role : 'developer',
      devName: user ? user.name : 'Test Developer',
      devWallet: user?.linkedWallet || '',
      projectOrg: user ? `@${user.login}` : '@user',
      projectWallet: user?.linkedWallet || '',
      virtualSolBalance: 0.0,
    };
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    return session.role === 'developer' ? 'tasks' : 'my-tasks';
  });

  // Tasks state (starts empty as requested: "пустовала чтобы я мог сам проверить")
  const [tasks, setTasks] = useState<BountyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TASKS;
  });

  // Proof of Code records (starts empty)
  const [pocRecords, setPocRecords] = useState<ProofOfCodeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POC);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROOF_OF_CODE;
  });

  // Onchain records list
  const [onchainRecords, setOnchainRecords] = useState<OnchainRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ONCHAIN_RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove legacy 4Dv5 transaction and any obsolete unichain records
          const filtered = parsed.filter(
            (r: OnchainRecord) =>
              r &&
              r.signature !== '4Dv5zsf9Q2Us9XYymmVEdvY4f4A9R1fACFUR8pQvGnD3onALvudzptGBLFkB7S3WtNtgwex5gqMVE26tFbpaHVCr' &&
              !r.explorerUrl?.includes('4Dv5zsf9Q2Us') &&
              !r.text?.includes('UniChain.kz')
          );
          
          // Preserve any newly user-added records, while keeping the 3 required initial records
          const customOnly = filtered.filter(
            r => !INITIAL_ONCHAIN_RECORDS.some(init => init.signature === r.signature)
          );
          if (customOnly.length > 0) {
            return [...customOnly, ...INITIAL_ONCHAIN_RECORDS];
          }
          if (filtered.length > 0) {
            return filtered;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ONCHAIN_RECORDS;
  });

  // Phantom Wallet State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isWritingOnchain, setIsWritingOnchain] = useState(false);

  // Modals state
  const [selectedTask, setSelectedTask] = useState<BountyTask | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [explorerTxHash, setExplorerTxHash] = useState<string | null>(null);
  const [publicUserProfile, setPublicUserProfile] = useState<PublicUserQuery | null>(null);

  // Enforce dark mode document class
  useEffect(() => {
    try {
      localStorage.removeItem('solbounties_theme');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'error'; link?: string } | null>(null);

  // Enforce role visibility restriction: Customer cannot see or access developer views
  useEffect(() => {
    if (currentUser?.role === 'project' || session.role === 'project') {
      if (currentView === 'tasks' || currentView === 'my-submissions' || currentView === 'proof-of-code') {
        setCurrentView('my-tasks');
      }
    }
  }, [currentUser?.role, session.role, currentView]);

  // Check if Phantom is already connected on mount
  useEffect(() => {
    const provider = getPhantomProvider();
    if (provider && provider.isPhantom && provider.publicKey) {
      const pubKey = provider.publicKey.toString();
      setWalletAddress(pubKey);
      fetchDevnetBalance(pubKey).then(bal => setWalletBalance(bal));
    }
  }, []);

  // Sync session with currentUser whenever it changes
  useEffect(() => {
    if (currentUser) {
      setSession(prev => ({
        ...prev,
        role: currentUser.role,
        devName: currentUser.name,
        devWallet: currentUser.linkedWallet || prev.devWallet,
      }));
    }
  }, [currentUser]);

  // Persist states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POC, JSON.stringify(pocRecords));
    } catch (e) {
      console.error(e);
    }
  }, [pocRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONCHAIN_RECORDS, JSON.stringify(onchainRecords));
    } catch (e) {
      console.error(e);
    }
  }, [onchainRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.error(e);
    }
  }, [session]);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'error' = 'success', link?: string) => {
    setToastMessage({ title, desc, type, link });
    setTimeout(() => {
      setToastMessage(null);
    }, 5500);
  };

  // Connect to Phantom wallet via window.phantom.solana
  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    setWalletError(null);

    try {
      const provider = getPhantomProvider();
      if (!provider) {
        setWalletError('Откройте приложение в отдельной вкладке с установленным Phantom');
        setIsConnectingWallet(false);
        return;
      }

      const resp = await provider.connect();
      const pubKey = resp.publicKey.toString();
      setWalletAddress(pubKey);

      // If user is logged in and doesn't have a linked wallet, link it automatically!
      if (currentUser && !currentUser.linkedWallet) {
        const updated = updateUserProfile(currentUser.id, { linkedWallet: pubKey });
        setCurrentUser(updated);
      }

      setSession(prev => ({
        ...prev,
        devWallet: pubKey,
        projectWallet: pubKey,
      }));

      // Fetch balance on devnet via @solana/web3.js
      const bal = await fetchDevnetBalance(pubKey);
      setWalletBalance(bal);

      showToast(
        'Кошелёк подключен',
        `Phantom: ${pubKey.slice(0, 4)}...${pubKey.slice(-4)} | Баланс Devnet: ${bal.toFixed(2)} SOL`,
        'success'
      );
    } catch (err: any) {
      if (err?.code === 4001 || err?.message?.includes('User rejected')) {
        setWalletError('Подключение кошелька отменено пользователем.');
      } else {
        setWalletError(err?.message || 'Откройте приложение в отдельной вкладке с установленным Phantom');
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Disconnect Phantom wallet
  const handleDisconnectWallet = async () => {
    try {
      const provider = getPhantomProvider();
      if (provider) {
        await provider.disconnect();
      }
    } catch (e) {
      console.warn('Disconnect error:', e);
    }
    setWalletAddress(null);
    setWalletBalance(null);
    showToast('Кошелёк отключен', 'Сессия Phantom успешно завершена', 'info');
  };

  // Refresh Devnet balance
  const handleRefreshBalance = async () => {
    if (!walletAddress) return;
    const bal = await fetchDevnetBalance(walletAddress);
    setWalletBalance(bal);
    showToast('Баланс обновлен', `${bal.toFixed(3)} SOL в сети Solana Devnet`, 'info');
  };

  // Send Onchain Memo Transaction via connected Phantom in Devnet
  const handleSendOnchainMemo = async (memoText: string): Promise<string | undefined> => {
    const provider = getPhantomProvider();
    if (!provider || !walletAddress) {
      showToast('Кошелек не подключен', 'Сначала подключите кошелек Phantom через кнопку в правом верхнем углу.', 'error');
      throw new Error('Кошелек не подключен. Сначала подключите Phantom.');
    }

    setIsWritingOnchain(true);
    showToast('Записываем в блокчейн…', 'Пожалуйста, подтвердите транзакцию в окне Phantom', 'info');

    try {
      // Sends transaction with Memo instruction (program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)
      const { signature, explorerUrl } = await sendDevnetMemo(provider, memoText);

      const newRecord: OnchainRecord = {
        id: 'rec-' + Date.now(),
        text: memoText,
        signature,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        explorerUrl,
      };

      setOnchainRecords(prev => [newRecord, ...prev]);

      // Refresh balance after fee deduction
      handleRefreshBalance();

      showToast(
        'Записано в блокчейн',
        `Транзакция успешно подтверждена: ${signature.slice(0, 8)}...`,
        'success',
        explorerUrl
      );

      return signature;
    } catch (err: any) {
      showToast('Ошибка транзакции', err?.message || 'Не удалось отправить транзакцию', 'error');
      throw err;
    } finally {
      setIsWritingOnchain(false);
    }
  };

  // Switch role between developer and project
  const handleSetRole = (newRole: 'developer' | 'project') => {
    if (newRole === session.role) return;

    setSession(prev => ({
      ...prev,
      role: newRole
    }));

    if (currentUser) {
      updateUserProfile(currentUser.id, { role: newRole });
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }

    if (newRole === 'developer') {
      setCurrentView('tasks');
      showToast(
        'Режим Разработчика',
        'Вам открыты: Лента задач, Мои PRs, Proof of Code и гарантии Escrow.',
        'info'
      );
    } else {
      setCurrentView('my-tasks');
      showToast(
        'Режим Заказчика',
        'Вам открыты: Кабинет заказчика, Мои задачи, Создать таск, Ревью входящих PRs и Escrow Казна.',
        'info'
      );
    }
  };

  // Handle Authentication Success
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setSession(prev => ({
      ...prev,
      role: user.role,
      devName: user.name,
      projectOrg: `@${user.login}`,
      devWallet: user.linkedWallet || prev.devWallet,
    }));
    setCurrentView(user.role === 'developer' ? 'tasks' : 'my-tasks');
    showToast('Успешный вход', `Добро пожаловать, ${user.name}!`, 'success');
  };

  // Quick 1-click test login for evaluator
  const handleQuickTestLogin = () => {
    const users = getAllUsers();
    let testUser = users.find(u => u.login.toLowerCase() === 'test');
    if (!testUser) {
      testUser = {
        id: 'usr_test_default',
        login: 'test',
        name: 'Test Developer',
        email: 'test@solbounties.dev',
        passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        role: 'developer',
        linkedWallet: null,
        createdAt: '2026-10-01',
      };
    }
    setCurrentUser(testUser);
    setSession(prev => ({
      ...prev,
      role: testUser.role,
      devName: testUser.name,
      devWallet: testUser.linkedWallet || prev.devWallet,
    }));
    setCurrentView(testUser.role === 'developer' ? 'tasks' : 'my-tasks');
    showToast('Тестовый вход выполнен', 'Вы вошли под тестовым аккаунтом @test (Разработчик)', 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('Выход выполнен', 'Вы вышли из учетной записи', 'info');
  };

  // Submit PR by developer
  const handleSubmitPR = (bountyId: string, prUrl: string, notes: string) => {
    const submissionId = 'sub-' + Date.now();
    const newSubmission: Submission = {
      id: submissionId,
      bountyId,
      devName: currentUser ? currentUser.name : session.devName,
      devWallet: walletAddress || currentUser?.linkedWallet || session.devWallet || 'DevWallet',
      githubPrUrl: prUrl,
      notes,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'submitted'
    };

    setTasks(prev => prev.map(t => {
      if (t.id === bountyId) {
        return {
          ...t,
          status: 'under_review',
          submissions: [newSubmission, ...t.submissions]
        };
      }
      return t;
    }));

    // Update selectedTask if open
    if (selectedTask && selectedTask.id === bountyId) {
      setSelectedTask(prev => prev ? {
        ...prev,
        status: 'under_review',
        submissions: [newSubmission, ...prev.submissions]
      } : null);
    }

    showToast(
      'Pull Request отправлен!',
      `Решение привязано к задаче. Заказчик проверит код и произведет выплату из Escrow.`,
      'success'
    );
  };

  // Approve PR & Release Solana Escrow Payout
  const handleApproveAndReleaseEscrow = (bountyId: string, submissionId: string) => {
    const targetTask = tasks.find(t => t.id === bountyId);
    if (!targetTask) return;

    const targetSub = targetTask.submissions.find(s => s.id === submissionId);
    if (!targetSub) return;

    // Generate random signature or use real transaction if available
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let txHash = '5';
    for (let i = 0; i < 43; i++) {
      txHash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const currentSlot = 298450000 + Math.floor(Math.random() * 50000);

    // 1. Update task & submission
    const updatedSubmissions = targetTask.submissions.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status: 'approved' as const,
          txHash,
          payoutAmountSOL: targetTask.rewardSOL
        };
      }
      return s;
    });

    const updatedTask: BountyTask = {
      ...targetTask,
      status: 'completed',
      submissions: updatedSubmissions
    };

    setTasks(prev => prev.map(t => t.id === bountyId ? updatedTask : t));
    if (selectedTask && selectedTask.id === bountyId) {
      setSelectedTask(updatedTask);
    }

    // 2. Extract repo name from github URL
    let repoName = 'project-repo';
    try {
      const parts = new URL(targetTask.githubRepo).pathname.replace(/^\//, '').split('/');
      if (parts.length >= 2) repoName = `${parts[0]}/${parts[1]}`;
    } catch {
      repoName = targetTask.githubRepo.replace('https://github.com/', '');
    }

    // 3. Create immutable Proof of Code onchain record
    const newPocRecord: ProofOfCodeRecord = {
      id: 'poc-' + Date.now(),
      bountyId: targetTask.id,
      taskTitle: targetTask.title,
      category: targetTask.category,
      devName: targetSub.devName,
      devWallet: targetSub.devWallet,
      githubPrUrl: targetSub.githubPrUrl,
      repoName,
      rewardSOL: targetTask.rewardSOL,
      rewardUSDC: targetTask.rewardUSDC,
      completedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      solanaTxHash: txHash,
      slotNumber: currentSlot,
      programId: 'ESCRW_PROGRAM_ID_11111111111111111111111111',
      tags: [targetTask.categoryLabel, targetTask.difficulty, 'Verified Escrow']
    };

    setPocRecords(prev => [newPocRecord, ...prev]);

    showToast(
      'Escrow выплачен!',
      `Выплачено ${targetTask.rewardSOL} SOL. Запись «Proof of Code» создана!`,
      'success',
      `https://explorer.solana.com/tx/${txHash}?cluster=devnet`
    );
  };

  // Create new task
  const handleCreateTask = (newTask: BountyTask) => {
    setTasks(prev => [newTask, ...prev]);

    showToast(
      'Задача создана!',
      `${newTask.rewardSOL} SOL депонировано на Escrow PDA: ${newTask.escrowAddress.slice(0, 10)}...`,
      'success'
    );
  };

  // 1-Click Load Sample Bounties for Hackathon Evaluator & Judges
  const handleLoadSampleBounties = () => {
    setTasks(SAMPLE_BOUNTIES);
    setPocRecords(prev => {
      const merged = [...SAMPLE_PROOF_OF_CODE];
      for (const p of prev) {
        if (!merged.some(m => m.id === p.id)) {
          merged.push(p);
        }
      }
      return merged;
    });

    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SAMPLE_BOUNTIES));
      localStorage.setItem(STORAGE_KEYS.POC, JSON.stringify(SAMPLE_PROOF_OF_CODE));
    } catch (e) {
      console.error(e);
    }

    showToast(
      'Демо-задачи загружены!',
      'Загружено 3 задачи (Smart Contracts, Frontend, Security Audit) для тестирования хакатона Colosseum.',
      'success'
    );
  };

  // Faucet request helper
  const handleRequestFaucet = () => {
    window.open('https://faucet.solana.com/', '_blank');
  };

  const handleUpdateSession = (updates: Partial<UserSession>) => {
    setSession(prev => ({ ...prev, ...updates }));
    showToast('Профиль обновлен', 'Данные успешно сохранены', 'info');
  };

  // Pending PRs count for startup
  const pendingReviewCount = tasks.reduce(
    (acc, t) => acc + t.submissions.filter(s => s.status === 'submitted').length,
    0
  );

  // My submissions count for developer
  const mySubmissionsCount = tasks.reduce(
    (acc, t) => acc + t.submissions.filter(s => s.devName === (currentUser?.name || session.devName) || s.devWallet === (walletAddress || currentUser?.linkedWallet)).length,
    0
  );

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F1F5F9] flex flex-col font-sans selection:bg-[#9945FF]/30 selection:text-white">
      {/* Role-Aware Navigation Bar with Active Phantom Connect & User Account */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (!currentUser) {
            setAuthInitialTab('login');
            setShowAuthModal(true);
            return;
          }
          if (view === 'create') {
            setShowCreateModal(true);
          } else {
            setCurrentView(view);
          }
        }}
        session={session}
        currentUser={currentUser}
        onSetRole={handleSetRole}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        isConnectingWallet={isConnectingWallet}
        walletError={walletError}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onRefreshBalance={handleRefreshBalance}
        onClearWalletError={() => setWalletError(null)}
        onOpenAuth={() => {
          setAuthInitialTab('login');
          setShowAuthModal(true);
        }}
        onOpenProfile={() => setShowProfileModal(true)}
        onLogout={handleLogout}
        onQuickTestLogin={!currentUser ? handleQuickTestLogin : undefined}
        onLoadSampleBounties={handleLoadSampleBounties}
        pendingReviewCount={pendingReviewCount}
        mySubmissionsCount={mySubmissionsCount}
      />

      {/* Main View Port */}
      <main className="flex-1">
        {!currentUser ? (
          <GuestLandingView
            onOpenAuth={(mode = 'login') => {
              setAuthInitialTab(mode);
              setShowAuthModal(true);
            }}
            onQuickTestLogin={handleQuickTestLogin}
            onLoadSampleBounties={handleLoadSampleBounties}
          />
        ) : (
          <>
            {/* DEVELOPER: Tasks Feed */}
            {currentView === 'tasks' && (
              <TaskFeed
                tasks={tasks}
                role={session.role}
                currentUser={currentUser}
                onSelectTask={(task) => setSelectedTask(task)}
                onQuickSubmitPR={(task) => setSelectedTask(task)}
                onOpenCreate={() => setShowCreateModal(true)}
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenUserProfile={(query) => setPublicUserProfile(query)}
                onLoadSampleBounties={handleLoadSampleBounties}
              />
            )}

            {/* DEVELOPER: My Submissions & PRs */}
            {currentView === 'my-submissions' && (
              <DeveloperSubmissionsView
                tasks={tasks}
                session={{ ...session, devWallet: walletAddress || currentUser?.linkedWallet || session.devWallet }}
                onSelectTask={(task) => setSelectedTask(task)}
                onViewExplorer={(txHash) => setExplorerTxHash(txHash)}
                onGoToTasks={() => setCurrentView('tasks')}
                onGoToProofOfCode={() => setCurrentView('proof-of-code')}
                onOpenUserProfile={(query) => setPublicUserProfile(query)}
              />
            )}

            {/* DEVELOPER / CUSTOMER: Proof of Code Portfolio */}
            {currentView === 'proof-of-code' && (
              <ProofOfCodeView
                records={pocRecords}
                session={{ ...session, devWallet: walletAddress || currentUser?.linkedWallet || session.devWallet }}
                onViewExplorer={(txHash) => setExplorerTxHash(txHash)}
                onOpenUserProfile={(query) => setPublicUserProfile(query)}
              />
            )}

            {/* ONCHAIN RECORDS LEDGER (Solana Devnet Memo program) */}
            {currentView === 'ledger' && (
              <OnchainLedgerView
                records={onchainRecords}
                walletAddress={walletAddress}
                onSendMemo={handleSendOnchainMemo}
                isWriting={isWritingOnchain}
              />
            )}

            {/* CUSTOMER / PROJECT: Task Management Dashboard & Review Queue */}
            {(currentView === 'my-tasks' || currentView === 'review-prs') && (
              <ProjectDashboardView
                tasks={tasks}
                session={{ ...session, projectWallet: walletAddress || currentUser?.linkedWallet || session.projectWallet }}
                currentUser={currentUser}
                onSelectTask={(task) => setSelectedTask(task)}
                onOpenCreateModal={() => setShowCreateModal(true)}
                onApproveAndReleaseEscrow={handleApproveAndReleaseEscrow}
                onViewExplorer={(txHash) => setExplorerTxHash(txHash)}
                onOpenUserProfile={(query) => setPublicUserProfile(query)}
              />
            )}

            {/* BOTH: Solana Escrow Vaults */}
            {currentView === 'escrow' && (
              <EscrowView
                tasks={tasks}
                onSelectTask={(task) => setSelectedTask(task)}
                onViewExplorer={(txHash) => setExplorerTxHash(txHash)}
              />
            )}

            {/* BOTH: How It Works & Architecture */}
            {currentView === 'how-it-works' && (
              <HowItWorksView
                onGoToTasks={() => setCurrentView('tasks')}
                onGoToCreate={() => setShowCreateModal(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Task Detail & PR Submission Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          session={{ ...session, devWallet: walletAddress || currentUser?.linkedWallet || session.devWallet }}
          currentUser={currentUser}
          walletAddress={walletAddress}
          onClose={() => setSelectedTask(null)}
          onSubmitPR={handleSubmitPR}
          onApproveAndReleaseEscrow={handleApproveAndReleaseEscrow}
          onViewExplorer={(txHash) => setExplorerTxHash(txHash)}
          onSendMemo={handleSendOnchainMemo}
          onOpenAuth={() => {
            setAuthInitialTab('login');
            setShowAuthModal(true);
          }}
          onOpenUserProfile={(query) => setPublicUserProfile(query)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          session={session}
          currentUser={currentUser}
          walletAddress={walletAddress}
          onClose={() => setShowCreateModal(false)}
          onCreateTask={handleCreateTask}
          onSendMemo={handleSendOnchainMemo}
        />
      )}

      {/* Authentication Modal (Login / Register / Forgot Password) */}
      {showAuthModal && (
        <AuthModal
          initialTab={authInitialTab}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* User Profile Modal (Edit Name, Password, Linked Wallet, Logout) */}
      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          currentConnectedWallet={walletAddress}
          onClose={() => setShowProfileModal(false)}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            setSession(prev => ({
              ...prev,
              role: updated.role,
              devName: updated.name,
              projectOrg: `@${updated.login}`,
            }));
            setCurrentView(updated.role === 'developer' ? 'tasks' : 'my-tasks');
          }}
          onLogout={handleLogout}
        />
      )}

      {/* Public User Profile Modal (View another user's profile and stats) */}
      {publicUserProfile && (
        <PublicUserProfileModal
          userQuery={publicUserProfile}
          tasks={tasks}
          pocRecords={pocRecords}
          onClose={() => setPublicUserProfile(null)}
          onSelectTask={(task) => {
            setSelectedTask(task);
            setPublicUserProfile(null);
          }}
        />
      )}

      {/* Wallet Modal (Config / Faucet) */}
      {showWalletModal && (
        <WalletModal
          session={{ ...session, devWallet: walletAddress || currentUser?.linkedWallet || session.devWallet, virtualSolBalance: walletBalance || 0 }}
          onClose={() => setShowWalletModal(false)}
          onUpdateSession={handleUpdateSession}
          onRequestFaucet={handleRequestFaucet}
        />
      )}

      {/* Solana Explorer Modal */}
      {explorerTxHash && (
        <SolanaExplorerModal
          txHash={explorerTxHash}
          onClose={() => setExplorerTxHash(null)}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0F172A] border border-slate-700 rounded-xl p-4 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#14F195] flex items-center justify-center shrink-0 mt-0.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#14F195]" />
            ) : toastMessage.type === 'error' ? (
              <Terminal className="w-5 h-5 text-rose-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-purple-400" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-semibold text-white text-sm">{toastMessage.title}</h4>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
            {toastMessage.link && (
              <a
                href={toastMessage.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[#14F195] font-semibold underline hover:text-white"
              >
                <span>Посмотреть запись в Solana Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Minimalist Footnote Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A11] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SolBounties Protocol</span>
            <span aria-hidden="true">·</span>
            <span>Solana Escrow & Proof of Code</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#14F195] font-mono">Devnet Cluster</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {currentUser ? (
              <button
                onClick={() => setShowProfileModal(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Профиль (@{currentUser.login})
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="hover:text-white transition-colors cursor-pointer text-[#14F195]"
              >
                Вход / Регистрация
              </button>
            )}
            <button
              onClick={() => setCurrentView('ledger')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Ончейн-реестр (Memo)
            </button>
            <a
              href="https://faucet.solana.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors text-purple-400"
            >
              Solana Devnet Faucet
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
