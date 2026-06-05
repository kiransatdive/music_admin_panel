import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Disc, Shield, FileText, DollarSign, Youtube,
  TrendingUp, Bell, LogOut, Menu, X, Users,
  BookOpen, Sun, Moon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();

  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const [isOpen, setIsOpen] = useState(false); // Mobile sidebar drawer open/close

  // Unread notifications count
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get('/api/admin/notifications');
        if (response.data && response.data.success) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread notifications count', error);
      }
    };
    fetchUnreadCount();
  }, [location.pathname]); // Refresh count on navigation

  // Dark Mode state
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { path: '/admin/releases', label: 'Releases', icon: Disc },
    { path: '/admin/whitelist', label: 'Whitelist', icon: Shield },
    { path: '/admin/cms', label: 'CMS', icon: FileText },
    { path: '/admin/payments', label: 'Payments', icon: DollarSign },
    { path: '/admin/youtube', label: 'YouTube', icon: Youtube },
    { path: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
    { path: '/admin/music-publication', label: 'Music Publishing', icon: BookOpen },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  ];



  const renderNavLinks = (onItemClick?: () => void, isMobileView = false) => {
    const collapsedMode = isCollapsed && !isMobileView;

    return (
      <div className="space-y-1">
        {/* Dashboard Link */}
        <Link
          to="/admin"
          onClick={onItemClick}
          title={collapsedMode ? 'Dashboard' : undefined}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-medium group active:scale-[0.98] ${location.pathname === '/admin'
            ? 'bg-rose-600 text-white shadow-soft shadow-rose-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
            } ${collapsedMode ? 'justify-center px-0' : ''}`}
        >
          <LayoutDashboard size={20} className="shrink-0 transition-transform group-hover:scale-105" />
          {!collapsedMode && <span>Dashboard</span>}
        </Link>

        {/* Artists Link */}
        <Link
          to="/admin/artists"
          onClick={onItemClick}
          title={collapsedMode ? 'Artists' : undefined}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-medium group active:scale-[0.98] ${location.pathname === '/admin/artists'
            ? 'bg-rose-600 text-white shadow-soft shadow-rose-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
            } ${collapsedMode ? 'justify-center px-0' : ''}`}
        >
          <Users size={20} className="shrink-0 transition-transform group-hover:scale-105" />
          {!collapsedMode && <span>Artists</span>}
        </Link>

        {/* Other links */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              title={collapsedMode ? item.label : undefined}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-medium group active:scale-[0.98] ${isActive
                ? 'bg-rose-600 text-white shadow-soft shadow-rose-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                } ${collapsedMode ? 'justify-center px-0' : ''}`}
            >
              <div className="relative">
                <Icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-dark-card">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              {!collapsedMode && (
                <span className="flex-1">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border/40 p-4 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Toggle Collapse Button (Floating) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 p-1 rounded-full shadow-md z-10 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Container */}
        <div className={`mb-6 flex flex-col transition-all duration-300 ${isCollapsed ? 'items-center px-0' : 'px-2'}`}>
          {isCollapsed ? (
            <div className="w-17 h-17 overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/20 flex items-center justify-center bg-white dark:bg-white/10 dark:backdrop-blur-md dark:shadow-lg p-1.5 shadow-sm">
              <img
                src="/LOGOMusic.png"
                alt="Logo"
                className="w-full h-full object-cover object-left"
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <img src="/LOGOMusic.png" alt="Shivam Music Group" className="h-25 w-auto object-contain self-start dark:bg-white/10 dark:backdrop-blur-md dark:border dark:border-white/20 dark:shadow-lg dark:p-2 dark:rounded-xl" />
              <p className="text-[10px] text-rose-500 font-bold tracking-wider uppercase mt-1.5 pl-0.5">Admin portal</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto pr-1 select-none">
          {renderNavLinks()}
        </nav>

        {/* Bottom Actions: Theme Toggle & Logout */}
        <div className="border-t border-slate-100 dark:border-dark-border/40 pt-4 mt-4 space-y-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center gap-3 px-3.5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200 w-full font-medium text-slate-600 dark:text-slate-400 ${isCollapsed ? 'justify-center px-0' : ''
              }`}
            title={isCollapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {isDark ? (
              <>
                <Sun size={20} className="text-amber-500 shrink-0 animate-pulse-soft" />
                {!isCollapsed && <span className="text-amber-500">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon size={20} className="text-slate-500 shrink-0" />
                {!isCollapsed && <span>Dark Mode</span>}
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3.5 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 w-full font-medium ${isCollapsed ? 'justify-center px-0' : ''
              }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border/40 p-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <img src="/LOGOMusic.png" alt="Shivam Music Group" className="h-10 w-auto object-contain dark:bg-white/10 dark:backdrop-blur-md dark:border dark:border-white/20 dark:shadow-sm dark:p-1.5 dark:rounded-lg" />
            <span className="text-[10px] bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-bold px-1.5 py-0.5 rounded uppercase border border-rose-100 dark:border-rose-900/30">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {isDark ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
            </button>
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar overlay drawer */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border/40 p-4 shadow-lg sticky top-[73px] z-30 max-h-[calc(100vh-73px)] overflow-y-auto animate-slide-down">
            <nav className="space-y-4">
              {renderNavLinks(() => setIsOpen(false), true)}
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 w-full mt-4 font-semibold border border-red-100 dark:border-red-950/50"
              >
                <LogOut size={20} />
                Logout
              </button>
            </nav>
          </div>
        )}

        {/* Page Outlet */}
        <main className="flex-1 p-4 md:p-8 overflow-auto flex flex-col">
          <div className="w-full flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
