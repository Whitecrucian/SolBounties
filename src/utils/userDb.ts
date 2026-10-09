import { UserAccount } from '../types';

const DB_USERS_KEY = 'solbounties_db_users_v1';
const DB_SESSION_KEY = 'solbounties_db_session_v1';
const DB_RESET_CODES_KEY = 'solbounties_db_reset_codes_v1';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial pre-configured test user
const DEFAULT_TEST_PASSWORD_HASH = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'; // sha256 of "password123"

const INITIAL_TEST_USER: UserAccount = {
  id: 'usr_test_default',
  login: 'test',
  name: 'Test Developer',
  email: 'test@solbounties.dev',
  passwordHash: DEFAULT_TEST_PASSWORD_HASH,
  role: 'developer',
  linkedWallet: null,
  createdAt: '2026-10-01',
};

export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(DB_USERS_KEY);
    if (!raw) {
      localStorage.setItem(DB_USERS_KEY, JSON.stringify([INITIAL_TEST_USER]));
      return [INITIAL_TEST_USER];
    }
    const list: UserAccount[] = JSON.parse(raw);
    // Ensure test user always exists
    if (!list.some(u => u.login.toLowerCase() === 'test')) {
      list.push(INITIAL_TEST_USER);
      localStorage.setItem(DB_USERS_KEY, JSON.stringify(list));
    }
    return list;
  } catch (e) {
    console.error('Error reading users DB:', e);
    return [INITIAL_TEST_USER];
  }
}

export function findUserByLoginOrName(identifier: string): UserAccount | null {
  if (!identifier) return null;
  const clean = identifier.replace(/^@/, '').trim().toLowerCase();
  const users = getAllUsers();
  return users.find(u => 
    u.login.toLowerCase() === clean || 
    u.name.toLowerCase() === clean ||
    u.id === clean
  ) || null;
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
}

export async function registerUser(
  login: string,
  name: string,
  email: string,
  rawPassword: string,
  role: 'developer' | 'project' = 'developer'
): Promise<UserAccount> {
  const trimmedLogin = login.trim().toLowerCase();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedLogin || trimmedLogin.length < 3) {
    throw new Error('Логин должен содержать минимум 3 символа.');
  }

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw new Error('Укажите корректный адрес электронной почты.');
  }

  if (!rawPassword || rawPassword.length < 6) {
    throw new Error('Пароль должен содержать минимум 6 символов.');
  }

  const users = getAllUsers();

  if (users.some(u => u.login.toLowerCase() === trimmedLogin)) {
    throw new Error('Пользователь с таким логином уже существует в базе данных.');
  }

  if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
    throw new Error('Пользователь с таким email уже зарегистрирован.');
  }

  const passwordHash = await hashPassword(rawPassword);

  const newUser: UserAccount = {
    id: 'usr_' + Date.now(),
    login: trimmedLogin,
    name: trimmedName || trimmedLogin,
    email: trimmedEmail,
    passwordHash,
    role,
    linkedWallet: null,
    createdAt: new Date().toISOString().split('T')[0],
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  return newUser;
}

export async function loginUser(loginOrEmail: string, rawPassword: string): Promise<UserAccount> {
  const query = loginOrEmail.trim().toLowerCase();
  const users = getAllUsers();

  const user = users.find(u => u.login.toLowerCase() === query || u.email.toLowerCase() === query);
  if (!user) {
    throw new Error('Пользователь с таким логином или email не найден.');
  }

  const inputHash = await hashPassword(rawPassword);
  if (user.passwordHash !== inputHash) {
    throw new Error('Неверный пароль. Проверьте правильность ввода.');
  }

  setCurrentUser(user);
  return user;
}

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(DB_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null) {
  if (user) {
    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DB_SESSION_KEY);
  }
}

export function logoutUser(): void {
  localStorage.removeItem(DB_SESSION_KEY);
}

export function updateUserProfile(
  userId: string,
  updates: { name?: string; role?: 'developer' | 'project'; linkedWallet?: string | null }
): UserAccount {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    throw new Error('Пользователь не найден в базе.');
  }

  const updated: UserAccount = {
    ...users[idx],
    name: updates.name !== undefined ? updates.name.trim() : users[idx].name,
    role: updates.role !== undefined ? updates.role : users[idx].role,
    linkedWallet: updates.linkedWallet !== undefined ? updates.linkedWallet : users[idx].linkedWallet,
  };

  users[idx] = updated;
  saveUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(updated);
  }

  return updated;
}

export async function changeUserPassword(
  userId: string,
  oldRawPassword: string,
  newRawPassword: string
): Promise<void> {
  if (newRawPassword.length < 6) {
    throw new Error('Новый пароль должен содержать не менее 6 символов.');
  }

  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error('Пользователь не найден.');
  }

  const oldHash = await hashPassword(oldRawPassword);
  if (user.passwordHash !== oldHash) {
    throw new Error('Текущий пароль указан неверно.');
  }

  user.passwordHash = await hashPassword(newRawPassword);
  saveUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(user);
  }
}

// Password Reset Simulation (Verification Code to Email)
interface ResetCodeEntry {
  email: string;
  code: string;
  expiresAt: number;
}

export function requestPasswordReset(loginOrEmail: string): { email: string; code: string } {
  const query = loginOrEmail.trim().toLowerCase();
  const users = getAllUsers();
  const user = users.find(u => u.login.toLowerCase() === query || u.email.toLowerCase() === query);

  if (!user) {
    throw new Error('Аккаунт с таким логином или почтой не найден.');
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const entry: ResetCodeEntry = {
    email: user.email,
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  };

  localStorage.setItem(DB_RESET_CODES_KEY + '_' + user.email, JSON.stringify(entry));

  return { email: user.email, code };
}

export async function resetPasswordWithCode(
  emailOrLogin: string,
  code: string,
  newPassword: string
): Promise<void> {
  if (newPassword.length < 6) {
    throw new Error('Новый пароль должен содержать не менее 6 символов.');
  }

  const query = emailOrLogin.trim().toLowerCase();
  const users = getAllUsers();
  const user = users.find(u => u.login.toLowerCase() === query || u.email.toLowerCase() === query);

  if (!user) {
    throw new Error('Пользователь не найден.');
  }

  const rawEntry = localStorage.getItem(DB_RESET_CODES_KEY + '_' + user.email);
  if (!rawEntry) {
    throw new Error('Код восстановления не запрашивался или устарел. Запросите код заново.');
  }

  const entry: ResetCodeEntry = JSON.parse(rawEntry);
  if (Date.now() > entry.expiresAt) {
    throw new Error('Срок действия кода восстановления истек.');
  }

  if (entry.code !== code.trim()) {
    throw new Error('Неверный код подтверждения из почты.');
  }

  user.passwordHash = await hashPassword(newPassword);
  saveUsers(users);
  localStorage.removeItem(DB_RESET_CODES_KEY + '_' + user.email);

  const current = getCurrentUser();
  if (current && current.id === user.id) {
    setCurrentUser(user);
  }
}
