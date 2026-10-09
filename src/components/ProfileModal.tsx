import React, { useState } from 'react';
import { UserAccount } from '../types';
import { updateUserProfile, changeUserPassword } from '../utils/userDb';
import { 
  X, User, Lock, Wallet, KeyRound, LogOut, Check, 
  Copy, AlertCircle, CheckCircle2, ShieldCheck, Mail, Calendar, Sparkles,
  Code2, Building2
} from 'lucide-react';

interface ProfileModalProps {
  user: UserAccount;
  currentConnectedWallet: string | null;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  currentConnectedWallet,
  onClose,
  onUpdateUser,
  onLogout,
}) => {
  // Name edit state
  const [name, setName] = useState(user.name);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Password edit state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Wallet link state
  const [walletMsg, setWalletMsg] = useState('');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [roleSuccess, setRoleSuccess] = useState(false);

  const handleUpdateRole = (newRole: 'developer' | 'project') => {
    if (newRole === user.role) return;
    try {
      const updated = updateUserProfile(user.id, { role: newRole });
      onUpdateUser(updated);
      setRoleSuccess(true);
      setTimeout(() => setRoleSuccess(false), 2500);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setNameSaving(true);
    setNameSuccess(false);

    try {
      const updated = updateUserProfile(user.id, { name: name.trim() });
      onUpdateUser(updated);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2500);
    } catch (err: any) {
      alert(err?.message || 'Ошибка обновления имени');
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwdError('Новый пароль и подтверждение не совпадают.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('Пароль должен содержать минимум 6 символов.');
      return;
    }

    setPwdSaving(true);

    try {
      await changeUserPassword(user.id, oldPassword, newPassword);
      setPwdSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: any) {
      setPwdError(err?.message || 'Ошибка смены пароля');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleLinkCurrentWallet = () => {
    if (!currentConnectedWallet) return;
    try {
      const updated = updateUserProfile(user.id, { linkedWallet: currentConnectedWallet });
      onUpdateUser(updated);
      setWalletMsg('Кошелек успешно привязан к вашему аккаунту!');
      setTimeout(() => setWalletMsg(''), 3000);
    } catch (err: any) {
      alert(err?.message);
    }
  };

  const handleUnlinkWallet = () => {
    try {
      const updated = updateUserProfile(user.id, { linkedWallet: null });
      onUpdateUser(updated);
      setWalletMsg('Кошелек отвязан от аккаунта.');
      setTimeout(() => setWalletMsg(''), 3000);
    } catch (err: any) {
      alert(err?.message);
    }
  };

  const handleCopyWallet = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#14F195]" />
            <h2 className="text-base font-bold text-white">Профиль пользователя</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Account Overview Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9945FF] to-[#14F195] p-0.5 flex items-center justify-center font-bold text-slate-950 font-mono text-base">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{user.name}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">@{user.login}</div>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                user.role === 'developer' 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                  : 'bg-purple-950/40 text-purple-300 border-purple-900/60'
              }`}>
                {user.role === 'developer' ? (
                  <>
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Разработчик</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Заказчик</span>
                  </>
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Регистрация: {user.createdAt}</span>
              </div>
            </div>
          </div>

          {/* ROLE SWITCHER */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#14F195]" />
                <span>Смена статуса аккаунта</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                Текущий: <strong className="text-white">{user.role === 'developer' ? 'Разработчик' : 'Заказчик'}</strong>
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Вы можете переключать свой статус в профиле: выполнять задания как разработчик или публиковать свои микро-задачи как заказчик.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleUpdateRole('developer')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  user.role === 'developer'
                    ? 'border-[#14F195] bg-[#14F195]/10 text-white font-semibold shadow-xs ring-1 ring-[#14F195]/30'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Code2 className={`w-4 h-4 shrink-0 ${user.role === 'developer' ? 'text-[#14F195]' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold">Разработчик</div>
                  <div className="text-[10px] text-slate-400">Сдача PR & вознаграждения</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateRole('project')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  user.role === 'project'
                    ? 'border-purple-500 bg-purple-950/30 text-white font-semibold shadow-xs ring-1 ring-purple-500/40'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Building2 className={`w-4 h-4 shrink-0 ${user.role === 'project' ? 'text-purple-400' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold">Заказчик</div>
                  <div className="text-[10px] text-slate-400">Создание задач & Escrow</div>
                </div>
              </button>
            </div>

            {roleSuccess && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 animate-in fade-in duration-200">
                <Check className="w-3.5 h-3.5" />
                <span>Статус аккаунта успешно обновлен!</span>
              </div>
            )}
          </div>

          {/* EDIT NICKNAME / NAME */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#14F195]" />
              <span>Редактирование имени / никнейма</span>
            </h4>

            <form onSubmit={handleSaveName} className="flex gap-2">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={nameSaving || name.trim() === user.name}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {nameSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>

            {nameSuccess && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Имя успешно обновлено!</span>
              </div>
            )}
          </div>

          {/* LINKED SOLANA WALLET (Unique to this account) */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-purple-400" />
              <span>Привязанный Solana-кошелёк аккаунта</span>
            </h4>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              У каждого пользователя в базе данных хранится свой собственный кошелек для получения выплат и ончейн Proof of Code.
            </p>

            {user.linkedWallet ? (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-300 truncate max-w-[260px]">{user.linkedWallet}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyWallet(user.linkedWallet!)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      title="Скопировать адрес"
                    >
                      {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleUnlinkWallet}
                      className="text-rose-400 hover:text-rose-300 text-[11px] underline cursor-pointer"
                    >
                      Отвязать
                    </button>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Кошелек сохранен в вашем профиле</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-slate-500 text-[11px]">К вашему аккаунту пока не привязан кошелек.</div>
                {currentConnectedWallet ? (
                  <button
                    onClick={handleLinkCurrentWallet}
                    className="w-full py-2 px-3 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 text-purple-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 font-semibold text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#14F195]" />
                    <span>Привязать активный Phantom ({currentConnectedWallet.slice(0, 4)}...{currentConnectedWallet.slice(-4)})</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-amber-400/90">
                    Подключите Phantom в правом верхнем углу, чтобы привязать его к этому профилю.
                  </div>
                )}
              </div>
            )}

            {walletMsg && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{walletMsg}</span>
              </div>
            )}
          </div>

          {/* EDIT PASSWORD */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Смена пароля</span>
            </h4>

            <form onSubmit={handleChangePassword} className="space-y-2.5">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Текущий пароль</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Новый пароль</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Мин. 6 символов"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Повторите пароль</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-[#14F195] rounded-xl text-white placeholder-slate-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {pwdError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pwdError}</span>
                </div>
              )}

              {pwdSuccess && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Пароль успешно обновлен!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pwdSaving || !oldPassword || !newPassword}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {pwdSaving ? 'Обновление пароля...' : 'Изменить пароль'}
              </button>
            </form>
          </div>

          {/* LOGOUT BUTTON */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Завершить сессию на этом устройстве</span>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-300 font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
