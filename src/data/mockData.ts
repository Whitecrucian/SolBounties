import { BountyTask, ProofOfCodeRecord, OnchainRecord } from '../types';

// Начальные списки задач и Proof of Code
export const INITIAL_TASKS: BountyTask[] = [];

export const INITIAL_PROOF_OF_CODE: ProofOfCodeRecord[] = [];

// Демо-задачи для хакатона и судей (1-клик загрузка)
export const SAMPLE_BOUNTIES: BountyTask[] = [
  {
    id: 'task-sample-1',
    title: 'Anchor Escrow PDA Multi-Sig Release Mechanism',
    category: 'smart-contracts',
    categoryLabel: 'Smart Contracts / Anchor',
    description: 'Разработать смарт-контракт на Rust/Anchor для мульти-подписи при освобождении средств из Escrow PDA. Контракт должен поддерживать таймаут на возврат средств заказчику и верификацию хэша коммита.',
    requirements: [
      'Смарт-контракт написан на Anchor v0.30+',
      'Unit-тесты в Typescript покрывают успешный релиз и возврат по таймауту',
      'Проверен расход вычислительных юнитов (Compute Units < 50k)',
      'Открытый Pull Request с описанием архитектуры PDA'
    ],
    rewardSOL: 4.5,
    rewardUSDC: 675,
    author: {
      name: 'Solana Labs Ecosystem',
      org: '@solana_ecosystem',
      authorLogin: 'solana_ecosystem',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      verified: true
    },
    githubRepo: 'https://github.com/solana-labs/solana-program-library',
    githubIssueUrl: 'https://github.com/solana-labs/solana-program-library/issues/104',
    status: 'under_review',
    createdAt: '2026-10-07 14:30',
    deadline: '2 дня',
    difficulty: 'Advanced',
    escrowAddress: 'ESCRWm9Zk7T5v8p2Xy9Ab4c1DeFgHiJkLmNoPqRsTuVw',
    submissions: [
      {
        id: 'sub-sample-1',
        bountyId: 'task-sample-1',
        devName: 'alex_soldev',
        devWallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        githubPrUrl: 'https://github.com/solana-labs/solana-program-library/pull/42',
        notes: 'Реализовал логику мульти-сига и PDA escrow seeds [b"escrow", task_id]. Все anchor tests проходят успешно!',
        submittedAt: '2026-10-08 09:15',
        status: 'submitted',
      }
    ]
  },
  {
    id: 'task-sample-2',
    title: 'Responsive Solana RPC WebSocket Stream Dashboard',
    category: 'frontend',
    categoryLabel: 'Frontend & UI',
    description: 'Создать адаптивный компонент мониторинга сетевых транзакций Solana Devnet в реальном времени. Включает анимацию подтверждения блоков, быстрый фильтр по программам и интеграцию с Phantom.',
    requirements: [
      'Чистый Tailwind CSS без внешних тяжелых библиотек',
      'Индикация статуса подключения RPC WebSocket (confirmed/finalized)',
      'Поддержка мобильных экранов и планшетов',
      'Копирование хэшей транзакций в один клик'
    ],
    rewardSOL: 2.0,
    rewardUSDC: 300,
    author: {
      name: 'Superteam Grants',
      org: '@superteam_grants',
      authorLogin: 'superteam_grants',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      verified: true
    },
    githubRepo: 'https://github.com/coral-xyz/anchor',
    githubIssueUrl: 'https://github.com/coral-xyz/anchor/issues/45',
    status: 'open',
    createdAt: '2026-10-08 10:00',
    deadline: '3 дня',
    difficulty: 'Intermediate',
    escrowAddress: 'ESCRW3b8Jv2K1p9M4t7Qz5Wx8Ac0DeFgHiJkLmNoPqRs',
    submissions: []
  },
  {
    id: 'task-sample-3',
    title: 'Anchor Security Audit: CPI & Account Validation Linter',
    category: 'security',
    categoryLabel: 'Security Audit',
    description: 'Аудит смарт-контрактов на предмет отсутствия проверок владельца аккаунтов (owner check), уязвимостей в Cross-Program Invocations (CPI) и опасных десериализаций данных.',
    requirements: [
      'Составление детального отчета с классификацией Critical/High/Medium',
      'Pull Request с патчами для исправления найденных уязвимостей',
      'Верификация исправления в тестнете'
    ],
    rewardSOL: 3.5,
    rewardUSDC: 525,
    author: {
      name: 'Sentinel Security DAO',
      org: '@sentinel_dao',
      authorLogin: 'sentinel_dao',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      verified: true
    },
    githubRepo: 'https://github.com/coral-xyz/anchor',
    githubIssueUrl: 'https://github.com/coral-xyz/anchor/issues/88',
    status: 'completed',
    createdAt: '2026-10-06 18:20',
    deadline: 'Завершено',
    difficulty: 'Advanced',
    escrowAddress: 'ESCRW7k4P9m2T1v8Xy5Ab0c3DeFgHiJkLmNoPqRsTuVw',
    submissions: [
      {
        id: 'sub-sample-3',
        bountyId: 'task-sample-3',
        devName: 'cyber_auditor',
        devWallet: 'DX3fYsyxzsZcTuHXsLNiRNBjh4J7Z1gtiuxM43GH6vZY',
        githubPrUrl: 'https://github.com/coral-xyz/anchor/pull/128',
        notes: 'Устранена уязвимость отсутствия проверки дискриминатора и добавлен тест на попытку поддельного CPI.',
        submittedAt: '2026-10-07 16:40',
        status: 'approved',
        txHash: '2QUjHuQuPmmWyc8DtBxwkxDrrY5iq8kYsUcE6tfAQ7ntnPsdaFoo7BzmZgUzZeG92XPJn9GGszDaLa2QpMTg3aq8',
        payoutAmountSOL: 3.5
      }
    ]
  }
];

export const SAMPLE_PROOF_OF_CODE: ProofOfCodeRecord[] = [
  {
    id: 'poc-sample-1',
    bountyId: 'task-sample-3',
    taskTitle: 'Anchor Security Audit: CPI & Account Validation Linter',
    category: 'security',
    devName: 'cyber_auditor',
    devWallet: 'DX3fYsyxzsZcTuHXsLNiRNBjh4J7Z1gtiuxM43GH6vZY',
    githubPrUrl: 'https://github.com/coral-xyz/anchor/pull/128',
    repoName: 'coral-xyz/anchor',
    rewardSOL: 3.5,
    rewardUSDC: 525,
    completedAt: '2026-10-07 17:05',
    solanaTxHash: '2QUjHuQuPmmWyc8DtBxwkxDrrY5iq8kYsUcE6tfAQ7ntnPsdaFoo7BzmZgUzZeG92XPJn9GGszDaLa2QpMTg3aq8',
    slotNumber: 298451023,
    programId: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
    tags: ['Rust', 'Anchor', 'Security', 'CPI Audit']
  }
];

export const INITIAL_ONCHAIN_RECORDS: OnchainRecord[] = [
  {
    id: 'memo-poc-1',
    text: 'SolBounties Proof of Code: Одобрен PR https://github.com/my-project/solana-dapp/pull/1 | Награда: 0.2 SOL | Разработчик: DX3fYsyxzsZcTuHXsLNiRNBjh4J7Z1gtiuxM43GH6vZY',
    signature: '2QUjHuQuPmmWyc8DtBxwkxDrrY5iq8kYsUcE6tfAQ7ntnPsdaFoo7BzmZgUzZeG92XPJn9GGszDaLa2QpMTg3aq8',
    timestamp: '2026-10-08 10:04',
    explorerUrl: 'https://explorer.solana.com/tx/2QUjHuQuPmmWyc8DtBxwkxDrrY5iq8kYsUcE6tfAQ7ntnPsdaFoo7BzmZgUzZeG92XPJn9GGszDaLa2QpMTg3aq8?cluster=devnet',
  },
  {
    id: 'memo-task-user-1',
    text: 'SolBounties Таск: "user" | Награда: 0.2 SOL | PDA: ESCRW7wHRUikDFrkPx4Su4bwkCURrzczvu8Tqy4UaJG',
    signature: '3FXYWX5xfUUhv63fELs2K2YacQykfKKV4Wo6Ey5qb4xZTJPnfkomZHVFw2PDwArSYjdjPwDTGTMfE4VhBd9BgrBa',
    timestamp: '2026-10-07 14:14',
    explorerUrl: 'https://explorer.solana.com/tx/3FXYWX5xfUUhv63fELs2K2YacQykfKKV4Wo6Ey5qb4xZTJPnfkomZHVFw2PDwArSYjdjPwDTGTMfE4VhBd9BgrBa?cluster=devnet',
  },
  {
    id: 'memo-task-tester-1',
    text: 'SolBounties Таск: "tester" | Награда: 0.1 SOL | PDA: ESCRWq9gKM1UHKZd4r6cn3ZoqhncqT91EZBh911tRhf',
    signature: '4YWMVk9M6kHUKMhbPonzhC3GfTbbMBrzzqN24H8c9LYgB3d59XpvXAv9PStFPFrY8x6Ku8zFCNcfN92eBEUbCPXd',
    timestamp: '2026-10-07 12:53',
    explorerUrl: 'https://explorer.solana.com/tx/4YWMVk9M6kHUKMhbPonzhC3GfTbbMBrzzqN24H8c9LYgB3d59XpvXAv9PStFPFrY8x6Ku8zFCNcfN92eBEUbCPXd?cluster=devnet',
  },
];
