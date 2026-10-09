# SolBounties

> Decentralized micro-bounty marketplace connecting everyday users and Web3 projects with developers through Solana-secured escrow and verifiable Proof of Code.

---

## Target Audience
- **Everyday Users & Project Owners:** Get websites fixed, features built, and tasks completed safely with zero scam risk — funds are only released when you approve the work.
- **Developers & Freelancers:** Earn guaranteed crypto payouts in SOL for solving real tasks, backed by an unforgeable onchain portfolio.

---

## Problem
Traditional freelance platforms charge high fees (up to 20%), suffer from slow dispute resolution, and expose both sides to risk: clients lose money to low-quality work or ghosting, while developers risk working for free without verifiable credit.

## Solution
SolBounties automates trust between clients and developers:
1. **Guaranteed Escrow:** Clients lock bounty funds safely in a Solana Escrow PDA before work begins.
2. **GitHub Pull Request Flow:** Developers submit solutions via transparent, reviewable pull requests.
3. **Proof of Code Settlement:** Clients approve the result to release funds, instantly minting an immutable onchain reputation record for the developer.

---

## How it uses Solana
Built on **Solana Devnet** using `@solana/web3.js` and the native **Solana Memo Program** (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`).

### What is recorded onchain:
- **Bounty Escrow Lock:** Task title, SOL reward amount, and Escrow PDA address upon creation.
- **Solution Submission:** GitHub PR URL linked directly to the task ID.
- **Proof of Code Settlement:** Signed transaction verifying client approval, released SOL payout, and contributor wallet address.

### Why:
- **Tamper-Proof Audit Trail:** Every milestone is publicly verifiable on Solana Explorer.
- **Zero-Dispute Trust:** Neither client nor developer can alter terms once locked onchain.
- **Permanent Onchain CV:** Builds an authentic, unforgeable portfolio of completed work.

---

## How to run

### Prerequisites
- Node.js (v18+)
- Phantom Wallet (switched to **Solana Devnet**)
- Devnet SOL via [faucet.solana.com](https://faucet.solana.com/)

### Setup & Launch
```bash
# Clone the repository
git clone <repository-url>
cd solbounties

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Team
- **SolBounties Core Team** — Full-stack Web3 engineering, escrow smart contracts, and GitHub developer workflows.
