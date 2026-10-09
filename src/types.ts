export type TaskCategory = 
  | 'smart-contracts' 
  | 'frontend' 
  | 'security' 
  | 'docs' 
  | 'backend-indexer' 
  | 'sdk';

export type TaskDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type TaskStatus = 'open' | 'in_progress' | 'under_review' | 'completed';

export type AppView = 
  | 'tasks' 
  | 'my-submissions' 
  | 'proof-of-code' 
  | 'escrow' 
  | 'my-tasks' 
  | 'create' 
  | 'review-prs' 
  | 'dev-catalog' 
  | 'ledger'
  | 'profile'
  | 'how-it-works';

export interface UserAccount {
  id: string;
  login: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'developer' | 'project';
  linkedWallet: string | null;
  createdAt: string;
}

export interface Submission {
  id: string;
  bountyId: string;
  devName: string;
  devWallet: string;
  githubPrUrl: string;
  notes: string;
  submittedAt: string;
  status: 'submitted' | 'approved' | 'rejected';
  txHash?: string;
  payoutAmountSOL?: number;
}

export interface BountyTask {
  id: string;
  title: string;
  category: TaskCategory;
  categoryLabel: string;
  description: string;
  requirements: string[];
  rewardSOL: number;
  rewardUSDC: number;
  author: {
    name: string;
    org: string;
    authorId?: string;
    authorLogin?: string;
    avatar?: string;
    verified: boolean;
  };
  githubRepo: string;
  githubIssueUrl: string;
  status: TaskStatus;
  createdAt: string;
  deadline: string;
  difficulty: TaskDifficulty;
  escrowAddress: string;
  submissions: Submission[];
}

export interface ProofOfCodeRecord {
  id: string;
  bountyId: string;
  taskTitle: string;
  category: TaskCategory;
  devName: string;
  devWallet: string;
  githubPrUrl: string;
  repoName: string;
  rewardSOL: number;
  rewardUSDC: number;
  completedAt: string;
  solanaTxHash: string;
  slotNumber: number;
  programId: string;
  tags: string[];
}

export interface OnchainRecord {
  id: string;
  text: string;
  signature: string;
  timestamp: string;
  explorerUrl: string;
}

export interface UserSession {
  role: 'developer' | 'project';
  devName: string;
  devWallet: string;
  projectOrg: string;
  projectWallet: string;
  virtualSolBalance: number;
}
