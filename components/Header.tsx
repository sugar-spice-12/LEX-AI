import React from 'react';
import { User } from '../types';
import { DashboardIcon, NewSummaryIcon, ChatAssistantIcon, LogoutIcon, UserIcon, ClientRequestIcon } from './icons';

interface HeaderProps {
  page: string;
  setPage: (page: 'dashboard' | 'upload' | 'chatbot' | 'clientRequests') => void;
  onLogout: () => void;
  currentUser: User;
  isHighContrast: boolean;
  setIsHighContrast: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ page, setPage, onLogout, currentUser, isHighContrast, setIsHighContrast }) => {
  const NavButton: React.FC<{targetPage: 'dashboard' | 'upload' | 'chatbot' | 'clientRequests', children: React.ReactNode, icon: React.ReactNode}> = ({ targetPage, children, icon }) => {
    const isActive = page === targetPage;
    return (
      <button
        onClick={() => setPage(targetPage)}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-yellow-400 text-slate-900'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {icon}
        {children}
      </button>
    );
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
        case 'Admin': return 'bg-red-500/50 text-red-300 border-red-400/50';
        case 'Partner': return 'bg-purple-500/50 text-purple-300 border-purple-400/50';
        default: return 'bg-sky-500/50 text-sky-300 border-sky-400/50';
    }
  }
  
  const ThemeToggle = () => (
    <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-400">Contrast</span>
        <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="theme-toggle" className="sr-only peer" checked={isHighContrast} onChange={() => setIsHighContrast(!isHighContrast)} />
            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-yellow-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
        </label>
    </div>
  );


  return (
    <header className="p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white tracking-wider">
              LEX AI
            </h1>
        </div>
        <nav className="flex items-center space-x-2">
            <NavButton targetPage="dashboard" icon={<DashboardIcon />}>
                Dashboard
            </NavButton>
            <NavButton targetPage="clientRequests" icon={<ClientRequestIcon />}>
                Client Requests
            </NavButton>
            <NavButton targetPage="upload" icon={<NewSummaryIcon />}>
                New Summary
            </NavButton>
            <NavButton targetPage="chatbot" icon={<ChatAssistantIcon />}>
                Chat Assistant
            </NavButton>
        </nav>
        <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center gap-3">
                <UserIcon />
                <div className="text-right">
                    <p className="text-sm font-medium text-white">{currentUser.email}</p>
                    <p className={`text-xs px-2 py-0.5 rounded-full inline-block border ${getRoleColor(currentUser.role)}`}>{currentUser.role}</p>
                </div>
            </div>
             <button
                onClick={onLogout}
                className="flex items-center justify-center h-10 w-10 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                title="Logout"
            >
                <LogoutIcon />
            </button>
        </div>
      </div>
    </header>
  );
};