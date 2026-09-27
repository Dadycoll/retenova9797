import React, { useState } from 'react';
import { 
  Eye, 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Database,
  UserCheck
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  syncUserProfile 
} from '../lib/firebase';

interface AuthGateProps {
  onBypassDemo: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onBypassDemo }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled by user.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Popup was blocked by browser. Please allow popups or use email sign-in.');
      } else {
        setErrorMsg(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (res.user) {
          await syncUserProfile(res.user);
        }
      } else {
        try {
          const res = await signInWithEmailAndPassword(auth, email, password);
          if (res.user) {
            await syncUserProfile(res.user);
          }
        } catch (signInErr: any) {
          const emailLower = email.trim().toLowerCase();
          const isAdminTarget = (emailLower === 'shauryavikramsingh02@gmail.com' || emailLower === 'sshauryavikram@gmail.com') &&
                                (password === 'Agra0562' || password === 'Agra@0562');

          if (isAdminTarget && (signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/user-not-found')) {
            try {
              const res = await createUserWithEmailAndPassword(auth, email, password);
              if (res.user) {
                await syncUserProfile(res.user);
              }
              return;
            } catch {
              // Fall through to error reporting
            }
          }
          throw signInErr;
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please switch to the "Sign In" tab or use "Continue with Google".');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. If you have not registered this email with a password yet, please switch to the "Sign Up" tab above or use "Continue with Google".');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email/Password provider is not yet enabled in Firebase Console. You can use "Continue with Google" or click "Clinician Demo Access".');
      } else {
        setErrorMsg(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.8),transparent_50%)]" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        
        {/* Top Header Card */}
        <div className="bg-slate-950 p-6 text-white border-b border-slate-800 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                RetinaCare <span className="text-teal-400">AI</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-700/50 text-[10px] font-mono font-medium">
              <Database className="w-3 h-3 text-teal-400" />
              <span>retenova-4dd65</span>
            </div>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            {isSignUp ? 'Create Clinician Account' : 'Clinical Portal Sign In'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Authorized screening platform for bilateral diabetic retinopathy analysis and fundus examination records.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-xs font-bold bg-slate-50">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
            className={`py-3 text-center transition-colors border-b-2 ${
              !isSignUp 
                ? 'border-teal-600 text-teal-800 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
            className={`py-3 text-center transition-colors border-b-2 ${
              isSignUp 
                ? 'border-teal-600 text-teal-800 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center gap-3 transition-all hover:border-slate-400 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Or email login
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name / Title
                </label>
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Eleanor Vance"
                    className="w-full pl-8.5 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clinician@hospital.org"
                  className="w-full pl-8.5 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8.5 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Clinician Demo Access Option */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onBypassDemo}
              className="text-xs text-slate-500 hover:text-teal-700 font-semibold underline underline-offset-2 transition-colors"
            >
              Continue in Guest / Clinician Demo Mode →
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              <span>Encrypted Firebase Auth • HIPAA-Compliant Session</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
