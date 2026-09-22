import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Compass,
  ClipboardList,
  Inbox,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Avatar } from '../ui/Avatar';
import type { Profile } from '../../types';

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.get<Profile>('/profiles/me')
      .then((data) => {
        if (isMounted && data) setProfile(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Search People', to: '/search', icon: Users },
    { name: 'Give Work', to: '/give-work', icon: Briefcase },
    { name: 'Take Work', to: '/browse-work', icon: Compass },
    { name: 'My Work', to: '/my-work', icon: ClipboardList },
    { name: 'Requests', to: '/requests', icon: Inbox },
    { name: 'Profile', to: '/profile', icon: UserIcon },
  ];

  const displayName =
    profile?.full_name?.trim() ||
    (user?.email ? user.email.split('@')[0].replace(/[0-9._]/g, ' ').trim() : 'User');

  const formattedName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <>
      {/* ================= DESKTOP VERTICAL COLLAPSIBLE SIDEBAR ================= */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen z-50 bg-white border-r border-slate-200/90 shadow-sm flex-col justify-between transition-all duration-300 ease-in-out w-[72px] hover:w-64 group hover:shadow-2xl hover:shadow-indigo-500/10"
      >
        {/* Top: Brand Logo */}
        <div>
          <div className="h-16 flex items-center px-4 border-b border-slate-100 overflow-hidden">
            <Link to="/dashboard" className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base tracking-tight">WorkBridge</span>
                  <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    SaaS
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Two-Way Marketplace</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={`relative flex items-center h-11 rounded-xl transition-all duration-200 font-medium text-sm overflow-hidden ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                  title={item.name}
                >
                  {/* Active vertical pill indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full group-hover:block" />
                  )}

                  {/* Icon centered in 44px container */}
                  <div className="w-11 h-11 flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}`} />
                  </div>

                  {/* Label revealed on hover */}
                  <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden text-sm font-semibold pl-1 pr-4">
                    {item.name}
                  </span>

                  {/* Subtle chevron indicator when active and expanded */}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <Link
            to="/profile"
            className="flex items-center h-12 rounded-xl p-1.5 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200/80 transition-all duration-200 overflow-hidden group/user"
            title="View Profile Settings"
          >
            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
              <Avatar
                url={profile?.profile_photo_url}
                name={formattedName}
                size="sm"
                className="w-9 h-9 ring-2 ring-indigo-500/20"
              />
            </div>
            <div className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden pl-3 text-left flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{formattedName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Active'}</p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="mt-1.5 flex items-center h-10 w-full rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50/80 transition-colors duration-200 overflow-hidden"
            title="Sign Out"
          >
            <div className="w-11 h-10 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden text-xs font-semibold pl-1 pr-4">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE TOP BAR & SLIDEOUT DRAWER ================= */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">WorkBridge</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Avatar url={profile?.profile_photo_url} name={formattedName} size="sm" className="w-7 h-7" />
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
          <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900">WorkBridge</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-3 mb-3 px-2">
                <Avatar url={profile?.profile_photo_url} name={formattedName} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{formattedName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}
    </>
  );
};

export default Sidebar;
