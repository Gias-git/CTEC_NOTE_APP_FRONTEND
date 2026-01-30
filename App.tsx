
import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import { NoteViewer } from './components/NoteViewer';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginForm } from './components/LoginForm';
import { checkAuth, loginAdmin, logoutAdmin } from './store';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.VIEWER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  const handleLogin = (user: string, pass: string) => {
    if (loginAdmin(user, pass)) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setMode(AppMode.VIEWER);
  };

  return (
    <div className="min-h-screen relative">
      {/* Dynamic Navbar */}
      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-[2rem] px-6 h-16 flex justify-between items-center shadow-2xl shadow-indigo-100/50">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setMode(AppMode.VIEWER)}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg group-hover:rotate-12 transition-transform">
                C
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none uppercase">CTEC NOTE</h1>
                <p className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">Smart Resources</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="flex bg-slate-200/50 p-1 rounded-2xl">
                <button
                  onClick={() => setMode(AppMode.VIEWER)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === AppMode.VIEWER 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Explore
                </button>
                <button
                  onClick={() => setMode(AppMode.ADMIN)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === AppMode.ADMIN 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Admin
                </button>
              </nav>
              
              {isAuthenticated && mode === AppMode.ADMIN && (
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      {mode === AppMode.VIEWER && (
        <section className="relative overflow-hidden pt-12 pb-8">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6">
              CTEC NOTE APP
            </div>
            <h2 className="text-4xl md:text-6xl font-[900] text-slate-900 mb-6 tracking-tight leading-tight">
              BUTEX Affiliated Colleges Notes For <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Every Department</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base md:text-lg font-medium leading-relaxed mb-8">
              Seamlessly browse study materials across all academic years. 
              Built for performance, designed for clarity.
            </p>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="pb-24">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          {mode === AppMode.VIEWER ? (
            <NoteViewer />
          ) : (
            isAuthenticated ? (
              <AdminDashboard />
            ) : (
              <LoginForm onLogin={handleLogin} error={loginError} />
            )
          )}
        </div>
      </main>

      {/* Floating Footer */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
        <div className="glass-card py-3 px-6 rounded-full text-center shadow-xl shadow-indigo-100/50">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} CTEC Student Association • Student Version
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
