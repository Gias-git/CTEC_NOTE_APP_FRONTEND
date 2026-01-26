
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (user: string, pass: string) => void;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md glass-card rounded-[3.5rem] shadow-2xl border border-white/60 p-10 md:p-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-indigo-200 mx-auto mb-6">
            C
          </div>
          <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">Admin Gate</h2>
          <p className="text-slate-400 font-medium mt-2">Authorization required to proceed</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black rounded-2xl text-center uppercase tracking-widest">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identify</label>
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-semibold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Key</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-semibold"
            />
          </div>
          <button
            type="submit"
            className="w-full py-5 bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            Confirm Access
          </button>
        </form>
        
        <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
           <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
             Authorized System Access Only
           </p>
        </div>
      </div>
    </div>
  );
};
