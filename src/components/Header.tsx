import React, { useState } from 'react';
import { 
  Eye, 
  Sparkles, 
  PlusCircle, 
  Users, 
  FileText, 
  Menu, 
  X,
  LogOut,
  LogIn,
  UserCheck,
  ShieldCheck,
  Stethoscope,
  Download,
  FileCode
} from 'lucide-react';
import { NavigationTab } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  pendingScreeningCount?: number;
  user: User | null;
  isDemoMode: boolean;
  onSignOut: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  onNavigate, 
  user, 
  isDemoMode, 
  onSignOut, 
  onOpenAuth 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; highlight?: boolean }[] = [
    { id: 'new_screening', label: 'New Screening', icon: PlusCircle },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Nearby Doctors', icon: Stethoscope },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck, highlight: true }
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || (isDemoMode ? 'Clinician (Demo)' : 'Guest');
  const userInitial = displayName.charAt(0).toUpperCase() || 'C';

  return (
    <header className="sticky top-0 z-40 h-14 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo & Brand */}
          <div 
            id="brand-logo"
            onClick={() => handleNavClick('new_screening')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
              <Eye className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-800">
                RetinaCare
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-4 text-xs font-semibold h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 h-full border-b-2 transition-all ${
                    isActive 
                      ? 'text-teal-700 border-teal-600 font-bold' 
                      : item.highlight
                      ? 'text-slate-700 hover:text-slate-900 border-transparent hover:border-slate-300'
                      : 'text-slate-500 hover:text-teal-600 border-transparent hover:border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${
                    isActive 
                      ? 'text-teal-600' 
                      : item.highlight 
                      ? 'text-slate-700' 
                      : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-bold uppercase tracking-tight">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Clinician Profile & Auth Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <a
              href="/RetinaCare_Complete_Source_Code.pdf"
              download="RetinaCare_Complete_Source_Code.pdf"
              target="_blank"
              rel="noopener noreferrer"
              title="Download Complete Codebase PDF (42 files, 180 pages, 10,680 lines)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-300 transition-colors shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-teal-600" />
              <span>Codebase PDF</span>
              <Download className="w-3 h-3 text-slate-400" />
            </a>

            {user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-bold leading-none text-slate-800 truncate max-w-[130px]" title={displayName}>
                    {displayName}
                  </p>
                  <p className="text-[10px] text-teal-700 uppercase tracking-wider mt-0.5 font-semibold">
                    Verified Clinician
                  </p>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-teal-300 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center font-bold text-xs text-teal-800">
                    {userInitial}
                  </div>
                )}
                <button
                  type="button"
                  id="auth-signout-btn"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isDemoMode ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-bold leading-none text-slate-700">Demo Clinician</p>
                  <p className="text-[10px] text-amber-600 font-semibold">Unauthenticated</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Up</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 rounded text-slate-500 hover:text-rose-600"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-2 py-1 rounded bg-teal-600 text-white text-xs font-bold"
              >
                Sign In
              </button>
            )}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-btn-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-cyan-50 text-cyan-800 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <a
              href="/RetinaCare_Complete_Source_Code.pdf"
              download="RetinaCare_Complete_Source_Code.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              <FileCode className="w-4 h-4 text-teal-600" />
              <span>Download Complete Codebase PDF</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

