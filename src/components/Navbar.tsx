import React, { useState } from 'react';
import { User, AppNotification, MealSlot } from '../types';
import {
  UtensilsCrossed,
  Bell,
  CheckCircle,
  UserCheck,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Volume2,
  VolumeX,
  ExternalLink,
} from 'lucide-react';
import { triggerPushNotification, playNotificationSound } from '../services/notificationService';

interface NavbarProps {
  currentUser: User | null;
  profiles: { students: User[]; admins: User[] };
  onSwitchUser: (userId: string) => void;
  onLoginCustomEmail: (email: string, role: 'student' | 'admin') => void;
  notifications: AppNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onTriggerTestReminder: (slot?: MealSlot) => void;
  activeView: 'dashboard' | 'analytics' | 'ratings';
  setActiveView: (view: 'dashboard' | 'analytics' | 'ratings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  profiles,
  onSwitchUser,
  onLoginCustomEmail,
  notifications,
  unreadCount,
  onMarkRead,
  onTriggerTestReminder,
  activeView,
  setActiveView,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState<'student' | 'admin'>('student');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleTestNotification = () => {
    if (soundEnabled) playNotificationSound();
    triggerPushNotification(
      '🔔 Meal Cutoff Simulation',
      'Reminder: Kitchen locks meal prep numbers in 20 minutes! Please confirm your attendance.'
    );
    onTriggerTestReminder('dinner');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmail.trim()) {
      onLoginCustomEmail(customEmail.trim(), customRole);
      setCustomEmail('');
      setShowProfileMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <UtensilsCrossed className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                Annapurna
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Zero-Waste Mess
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Campus Food Opt-In & Predictive Kitchen Hub</p>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {currentUser?.role === 'admin' ? 'Kitchen Management' : 'Meal RSVPs & Schedule'}
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'analytics'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Waste & Trends
          </button>
          <button
            onClick={() => setActiveView('ratings')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'ratings'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Dish Ratings & Reviews
          </button>
        </nav>

        {/* Controls: Push notification test, Notifications Bell, User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Push Test button */}
          <button
            onClick={handleTestNotification}
            title="Simulate Instant Cutoff Push Reminder"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Test Push Reminder</span>
            <span className="sm:hidden">Push</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-semibold text-sm text-slate-100">Notification Feed</h4>
                  </div>
                  <span className="text-xs text-slate-400">{unreadCount} unread</span>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-sm text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = currentUser && !n.readBy.includes(currentUser.id);
                      return (
                        <div
                          key={n.id}
                          onClick={() => onMarkRead(n.id)}
                          className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                            isUnread
                              ? 'bg-slate-800/90 border-emerald-500/40 hover:border-emerald-500'
                              : 'bg-slate-800/40 border-slate-700/60 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-200">{n.title}</span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {n.mealSlot && <span className="uppercase text-emerald-400 font-medium">{n.mealSlot}</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={currentUser?.name}
                className="w-7 h-7 rounded-lg object-cover border border-slate-600"
              />
              <div className="hidden lg:block text-xs">
                <div className="font-medium text-slate-200 leading-tight">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  {currentUser?.role === 'admin' ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Staff Admin
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <GraduationCap className="w-2.5 h-2.5" /> Student
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Profile Switcher Modal/Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-100">Switch Account Role</h4>
                    <p className="text-xs text-slate-400">Select a student or kitchen staff profile</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      currentUser?.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Active: {currentUser?.role}
                  </span>
                </div>

                {/* Quick Role Toggle Bar */}
                <div className="my-3 grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      const firstStudent = profiles.students[0];
                      if (firstStudent) onSwitchUser(firstStudent.id);
                      setShowProfileMenu(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      currentUser?.role === 'student'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" /> Student View
                  </button>
                  <button
                    onClick={() => {
                      const firstAdmin = profiles.admins[0];
                      if (firstAdmin) onSwitchUser(firstAdmin.id);
                      setShowProfileMenu(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      currentUser?.role === 'admin'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Mess Admin View
                  </button>
                </div>

                {/* Student Profiles List */}
                <div className="space-y-1 mb-3">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 px-1">
                    Student Accounts ({profiles.students.length})
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {profiles.students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => {
                          onSwitchUser(student.id);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                          currentUser?.id === student.id
                            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                            : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={student.avatar} alt={student.name} className="w-6 h-6 rounded-md object-cover" />
                          <div>
                            <div className="font-medium text-slate-200">{student.name}</div>
                            <div className="text-[10px] text-slate-400">{student.email}</div>
                          </div>
                        </div>
                        {currentUser?.id === student.id && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Staff Profiles List */}
                <div className="space-y-1 mb-3">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 px-1">
                    Admin Staff ({profiles.admins.length})
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                    {profiles.admins.map((admin) => (
                      <button
                        key={admin.id}
                        onClick={() => {
                          onSwitchUser(admin.id);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                          currentUser?.id === admin.id
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                            : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={admin.avatar} alt={admin.name} className="w-6 h-6 rounded-md object-cover" />
                          <div>
                            <div className="font-medium text-slate-200">{admin.name}</div>
                            <div className="text-[10px] text-slate-400">{admin.email}</div>
                          </div>
                        </div>
                        {currentUser?.id === admin.id && <CheckCircle className="w-4 h-4 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sign in with custom Gmail form */}
                <form onSubmit={handleCustomLogin} className="pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-medium text-slate-300 mb-1.5">Sign in with your own Gmail:</div>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. ts4490797@gmail.com"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value as 'student' | 'admin')}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                  >
                    Login / Switch to Gmail
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
