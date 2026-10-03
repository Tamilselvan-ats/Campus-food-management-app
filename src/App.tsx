import React, { useState, useEffect, useCallback } from 'react';
import { User, DaySchedule, StatsOverview, DishLeaderboardItem, FoodRating, AppNotification, MealSlot } from './types';
import {
  fetchMe,
  fetchProfiles,
  loginUser,
  fetchSchedule,
  fetchStats,
  fetchRatings,
  fetchNotifications,
  markNotificationAsRead,
  triggerTestReminder,
  setActiveUserId,
  getActiveUserId,
} from './services/api';
import { requestBrowserNotificationPermission } from './services/notificationService';
import { Navbar } from './components/Navbar';
import { NotificationBanner } from './components/NotificationBanner';
import { StudentView } from './components/StudentView';
import { AdminView } from './components/AdminView';
import { AnalyticsView } from './components/AnalyticsView';
import { RatingsView } from './components/RatingsView';
import { RateDishModal } from './components/RateDishModal';
import {
  UtensilsCrossed,
  Shield,
  GraduationCap,
  Sparkles,
  BarChart3,
  Star,
  RefreshCw,
  BellRing,
} from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<{ students: User[]; admins: User[] }>({ students: [], admins: [] });
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [ratingsData, setRatingsData] = useState<{
    dishes: DishLeaderboardItem[];
    mostFavorite: DishLeaderboardItem[];
    mostDisliked: DishLeaderboardItem[];
    recentReviews: FoodRating[];
    totalRatingsCount: number;
  } | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [activeView, setActiveView] = useState<'dashboard' | 'analytics' | 'ratings'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Rate Modal state
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateModalDish, setRateModalDish] = useState('');
  const [rateModalSlot, setRateModalSlot] = useState<MealSlot>('lunch');

  // Load core application data
  const loadData = useCallback(async () => {
    try {
      const [userRes, profRes, schedRes, statsRes, rateRes, notifRes] = await Promise.all([
        fetchMe(),
        fetchProfiles(),
        fetchSchedule(),
        fetchStats(),
        fetchRatings(),
        fetchNotifications(),
      ]);

      setCurrentUser(userRes);
      setProfiles({ students: profRes.students, admins: profRes.admins });
      setSchedule(schedRes.schedule);
      setStats(statsRes);
      setRatingsData(rateRes);
      setNotifications(notifRes.notifications);
      setUnreadCount(notifRes.unreadCount);
    } catch (err) {
      console.error('Failed to load initial application data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Request notification permission smoothly
    requestBrowserNotificationPermission();

    // Auto-refresh interval every 30s
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Role / User Switcher handler
  const handleSwitchUser = async (userId: string) => {
    setActiveUserId(userId);
    setIsLoading(true);
    await loadData();
  };

  // Custom Gmail login handler
  const handleLoginCustomEmail = async (email: string, role: 'student' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, role);
      if (res.user?.id) {
        setActiveUserId(res.user.id);
      }
      await loadData();
    } catch (err) {
      console.error('Error logging in with custom email', err);
      setIsLoading(false);
    }
  };

  // Notification actions
  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && currentUser ? { ...n, readBy: [...n.readBy, currentUser.id] } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleTriggerTestReminder = async (slot?: MealSlot) => {
    await triggerTestReminder(slot);
    const notifRes = await fetchNotifications();
    setNotifications(notifRes.notifications);
    setUnreadCount(notifRes.unreadCount);
  };

  const handleOpenRateModal = (dishName = '', slot: MealSlot = 'lunch') => {
    setRateModalDish(dishName);
    setRateModalSlot(slot);
    setRateModalOpen(true);
  };

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center animate-pulse">
          <UtensilsCrossed className="w-6 h-6 text-slate-950" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">Annapurna Zero-Waste Mess</div>
          <div className="text-xs text-slate-400 mt-1">Connecting hostel database...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Floating Push Notification Banner for browser simulation */}
      <NotificationBanner />

      {/* Main Header / Navigation */}
      <Navbar
        currentUser={currentUser}
        profiles={profiles}
        onSwitchUser={handleSwitchUser}
        onLoginCustomEmail={handleLoginCustomEmail}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={handleMarkNotificationRead}
        onTriggerTestReminder={handleTriggerTestReminder}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Render by active view */}
        {activeView === 'dashboard' && (
          <>
            {currentUser?.role === 'admin' ? (
              <AdminView currentUser={currentUser} onRefreshData={loadData} />
            ) : (
              <StudentView
                currentUser={currentUser!}
                schedule={schedule}
                stats={stats}
                onRefresh={loadData}
                onOpenRateModal={handleOpenRateModal}
              />
            )}
          </>
        )}

        {activeView === 'analytics' && (
          <AnalyticsView
            stats={stats}
            ratingsData={ratingsData}
            onOpenRateModal={(dish) => handleOpenRateModal(dish || 'Lunch Special')}
          />
        )}

        {activeView === 'ratings' && (
          <RatingsView
            ratingsData={ratingsData}
            onOpenRateModal={(dish) => handleOpenRateModal(dish || 'Chef Special')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-6 flex items-center justify-around">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            activeView === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          {currentUser?.role === 'admin' ? <Shield className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
          <span>{currentUser?.role === 'admin' ? 'Kitchen' : 'Meals'}</span>
        </button>
        <button
          onClick={() => setActiveView('analytics')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            activeView === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Waste Trends</span>
        </button>
        <button
          onClick={() => setActiveView('ratings')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            activeView === 'ratings' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Star className="w-5 h-5" />
          <span>Ratings</span>
        </button>
      </nav>

      {/* Rate Dish Modal */}
      <RateDishModal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        defaultDishName={rateModalDish}
        defaultSlot={rateModalSlot}
        onRatingSubmitted={loadData}
      />
    </div>
  );
}

export default App;
