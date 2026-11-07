import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Moon, Sun, Mail, Lock, User, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthPageProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export default function AuthPage({ toggleTheme, theme }: AuthPageProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setSuccess('Password reset link sent to your email.');
      } else if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        if (!name) throw new Error('Name is required');
        await signUpWithEmail(email, password, name);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'An error occurred during authentication';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email is already in use';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is not enabled in Firebase Console';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError('Google sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleView = (view: 'login' | 'signup' | 'forgot') => {
    setError(null);
    setSuccess(null);
    if (view === 'login') {
      setIsLogin(true);
      setIsForgotPassword(false);
    } else if (view === 'signup') {
      setIsLogin(false);
      setIsForgotPassword(false);
    } else if (view === 'forgot') {
      setIsForgotPassword(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Theme Toggle */}
      <div className="absolute top-8 right-8">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:scale-105"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img 
            src="/src/assets/images/abitora_abstract_logo_1794047912747.jpg" 
            alt="Abitora Logo" 
            className="w-14 h-14 rounded-2xl mx-auto mb-4 shadow-xl"
          />
          <h1 className="text-3xl font-extrabold mb-1">
            {isForgotPassword ? 'Reset password' : (isLogin ? 'Welcome back' : 'Create an account')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isForgotPassword ? 'Enter your email to receive a reset link' : (isLogin ? 'Enter your details to access your habits' : 'Start your journey to better habits today')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex gap-3 items-center"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex gap-3 items-center"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required={!isLogin && !isForgotPassword}
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all dark:text-white"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Password</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => toggleView('forgot')}
                      className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required={!isForgotPassword}
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all dark:text-white"
                  />
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account'))}
            </button>
          </form>
          
          {isForgotPassword ? (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <button 
                onClick={() => toggleView('login')}
                className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-bold tracking-widest">or</span>
                </div>
              </div>

              <button 
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
              
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <button 
                  onClick={() => toggleView(isLogin ? 'signup' : 'login')}
                  className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4 items-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Landing Page
          </button>
          
          <button 
            onClick={() => window.location.href = '/privacy'}
            className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-400 transition-all"
          >
            Privacy Policy
          </button>
        </div>
      </motion.div>
    </div>
  );
}
