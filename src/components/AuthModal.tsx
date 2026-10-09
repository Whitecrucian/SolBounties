import React, { useState } from 'react';
import { UserAccount } from '../types';
import { 
  loginUser, registerUser, requestPasswordReset, resetPasswordWithCode 
} from '../utils/userDb';
import { 
  X, Lock, Mail, User, ShieldCheck, KeyRound, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, Building2, Terminal 
} from 'lucide-react';

interface AuthModalProps {
  initialTab?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialTab = 'login', onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regLogin, setRegLogin] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'developer' | 'project'>('developer');

  // Forgot password form state
  const [resetEmailOrLogin, setResetEmailOrLogin] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [sentCodeInfo, setSentCodeInfo] = useState<{ email: string; code: string } | null>(null);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await loginUser(loginIdentifier, loginPassword);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await registerUser(regLogin, regName, regEmail, regPassword, regRole);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTestLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await loginUser('test', 'password123');
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = requestPasswordReset(resetEmailOrLogin);
      setSentCodeInfo(res);
      setResetStep(2);
      setSuccessMsg(`Код подтверждения отправлен на ${res.email}`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ошибка запроса сброса');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await resetPasswordWithCode(resetEmailOrLogin, resetCode, resetNewPassword);
      setSuccessMsg('Пароль успешно изменен! Теперь вы можете войти с новым паролем.');
      setTimeout(() => {
        setTab('login');
        setLoginIdentifier(resetEmailOrLogin);
        setLoginPassword(resetNewPassword);
        setResetStep(1);
        setSentCodeInfo(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ошибка сброса пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'login' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'register' ? 'bg-slate-800 text-[#14F195] shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Регистрация
            </button>
            <button
              onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'forgot' ? 'bg-slate-800 text-purple-300 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Забыли пароль?
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Quick Demo Test Account Banner */}
          <div className="p-3 bg-gradient-to-r from-purple-950/40 via-slate-900 to-emerald-950/30 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#14F195]" />
                <span>Тестовый аккаунт</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Логин: <strong className="text-slate-200">test</strong> · Пароль: <strong className="text-slate-200">password123</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickTestLogin}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#14F195] font-semibold rounded-lg border border-slate-700/80 transition-colors cursor-pointer shrink-0"
            >
              Войти как test
            </button>
          </div>

          {/* LOGIN TAB */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Логин или Email *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Введите логин или почту"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">Пароль *</label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-slate-400 hover:text-[#14F195] cursor-pointer"
                  >
                    Забыли пароль?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] disabled:opacity-50 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Войти в аккаунт</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER TAB */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Имя / Никнейм *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Например: Иван Иванов или sol_builder"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Логин *
                  </label>
                  <input
                    type="text"
                    required
                    value={regLogin}
                    onChange={(e) => setRegLogin(e.target.value)}
                    placeholder="my_login"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Роль
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none cursor-pointer text-[11px]"
                  >
                    <option value="developer">Разработчик (Developer)</option>
                    <option value="project">Заказчик (Client / Employer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Электронная почта (для сброса пароля) *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="dev@example.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Пароль (мин. 6 символов) *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-[#9945FF] to-purple-600 hover:opacity-90 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Создать аккаунт</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD TAB */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              {resetStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Укажите email или логин от вашего аккаунта. Мы отправим одноразовый проверочный код для восстановления доступа.
                  </p>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Логин или Почта *
                    </label>
                    <input
                      type="text"
                      required
                      value={resetEmailOrLogin}
                      onChange={(e) => setResetEmailOrLogin(e.target.value)}
                      placeholder="test или test@solbounties.dev"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-purple-400 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Отправить код восстановления</span>
                    <Mail className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {sentCodeInfo && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-[11px]">
                      <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Письмо отправлено на {sentCodeInfo.email}</span>
                      </div>
                      <div className="text-slate-400">
                        Ваш код из письма: <strong className="font-mono text-white text-sm tracking-widest">{sentCodeInfo.code}</strong>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Код подтверждения из письма *
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="6 цифр"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-white font-mono text-center text-sm tracking-widest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Придумайте новый пароль *
                    </label>
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Новый пароль (мин. 6 символов)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-[#14F195] rounded-xl text-white font-mono focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-[#14F195] hover:bg-[#12da86] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Установить новый пароль</span>
                    <KeyRound className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
