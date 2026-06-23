import { Suspense, lazy } from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

const NotesPage = lazy(() => import('./pages/NotesPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

const activeLink = 'text-cyan-300';
const inactiveLink = 'text-slate-300 hover:text-cyan-200';

function App() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),_radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.18),_transparent_28%)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),_radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.18),_transparent_28%)] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">AI Study Toolkit</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">AI Course Notes Summarizer</h1>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm font-medium items-center">
            <NavLink to="/" className={({ isActive }) => (isActive ? activeLink : inactiveLink)}>
              Home
            </NavLink>
            <NavLink to="/summarize" className={({ isActive }) => (isActive ? activeLink : inactiveLink)}>
              Notes Input
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => (isActive ? activeLink : inactiveLink)}>
              History
            </NavLink>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="text-slate-400 text-xs sm:text-sm">{user.name}</span>
            <button
              onClick={signOut}
              className="text-slate-300 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </header>

        <main className="space-y-6">
          <Suspense fallback={<div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">Loading page...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/summarize" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
