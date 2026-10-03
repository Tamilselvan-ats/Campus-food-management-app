import {
  User,
  DaySchedule,
  HeadcountMeal,
  MealSupplyCalculation,
  SupplyItem,
  WasteLog,
  PredictiveAlert,
  StatsOverview,
  DishLeaderboardItem,
  FoodRating,
  AppNotification,
  MealSlot,
} from '../types';

let currentUserId: string = localStorage.getItem('annapurna_user_id') || 'usr_std_1';

export function getActiveUserId(): string {
  return currentUserId;
}

export function setActiveUserId(id: string) {
  currentUserId = id;
  localStorage.setItem('annapurna_user_id', id);
}

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
  };
}

export async function fetchMe(): Promise<User> {
  const res = await fetch('/api/auth/me', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function fetchProfiles(): Promise<{ students: User[]; admins: User[]; all: User[] }> {
  const res = await fetch('/api/auth/profiles', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json();
}

export async function loginUser(email: string, role?: 'student' | 'admin'): Promise<{ success: boolean; user: User }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) throw new Error('Failed to login');
  const data = await res.json();
  if (data.user?.id) {
    setActiveUserId(data.user.id);
  }
  return data;
}

export async function updateUserSettings(
  notificationSettings: User['notificationSettings'],
  dietaryPref?: User['dietaryPref']
): Promise<{ success: boolean; user: User }> {
  const res = await fetch('/api/auth/settings', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ notificationSettings, dietaryPref }),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function fetchSchedule(date?: string): Promise<{
  selectedDate: string;
  totalStudents: number;
  schedule: DaySchedule[];
}> {
  const url = date ? `/api/meals/schedule?date=${date}` : '/api/meals/schedule';
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function submitRSVP(date: string, slot: MealSlot, status: 'attending' | 'skipping', dietaryNote?: string) {
  const res = await fetch('/api/meals/rsvp', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ date, slot, status, dietaryNote }),
  });
  if (!res.ok) throw new Error('Failed to submit RSVP');
  return res.json();
}

export async function submitBatchRSVP(date: string, status: 'attending' | 'skipping') {
  const res = await fetch('/api/meals/rsvp-batch', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ date, status }),
  });
  if (!res.ok) throw new Error('Failed to submit batch RSVP');
  return res.json();
}

export async function fetchHeadcounts(date?: string): Promise<{
  date: string;
  totalRegisteredStudents: number;
  meals: HeadcountMeal[];
}> {
  const url = date ? `/api/admin/headcounts?date=${date}` : '/api/admin/headcounts';
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch headcounts');
  return res.json();
}

export async function fetchSupplies(date?: string, buffer = 5): Promise<{
  date: string;
  bufferPercent: number;
  calibrationMultiplier: number;
  predictionNote: string;
  mealSupplies: MealSupplyCalculation[];
  dailyGroceryList: SupplyItem[];
  grandTotalCost: number;
}> {
  const url = `/api/admin/supplies?date=${date || ''}&buffer=${buffer}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch supplies');
  return res.json();
}

export async function fetchWasteLogs(): Promise<{ logs: WasteLog[] }> {
  const res = await fetch('/api/admin/waste-logs', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch waste logs');
  return res.json();
}

export async function createWasteLog(logData: Partial<WasteLog>): Promise<{ success: boolean; log: WasteLog }> {
  const res = await fetch('/api/admin/waste-logs', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(logData),
  });
  if (!res.ok) throw new Error('Failed to create waste log');
  return res.json();
}

export async function fetchAlerts(): Promise<{ alerts: PredictiveAlert[]; count: number }> {
  const res = await fetch('/api/admin/alerts', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch predictive alerts');
  return res.json();
}

export async function fetchStats(): Promise<StatsOverview> {
  const res = await fetch('/api/stats/overview', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchRatings(): Promise<{
  dishes: DishLeaderboardItem[];
  mostFavorite: DishLeaderboardItem[];
  mostDisliked: DishLeaderboardItem[];
  recentReviews: FoodRating[];
  totalRatingsCount: number;
}> {
  const res = await fetch('/api/ratings', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch ratings');
  return res.json();
}

export async function submitRating(reviewData: {
  dishName: string;
  mealSlot: MealSlot;
  rating: number;
  tags: string[];
  comment: string;
  date?: string;
}): Promise<{ success: boolean; rating: FoodRating }> {
  const res = await fetch('/api/ratings', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) throw new Error('Failed to submit rating');
  return res.json();
}

export async function fetchNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  const res = await fetch('/api/notifications', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationAsRead(id: string) {
  const res = await fetch('/api/notifications/mark-read', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function broadcastNotification(title: string, message: string, mealSlot?: MealSlot, type?: string) {
  const res = await fetch('/api/notifications/broadcast', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, message, mealSlot, type }),
  });
  if (!res.ok) throw new Error('Failed to broadcast notification');
  return res.json();
}

export async function triggerTestReminder(slot?: MealSlot) {
  const res = await fetch('/api/notifications/test-reminder', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ slot }),
  });
  if (!res.ok) throw new Error('Failed to trigger test reminder');
  return res.json();
}
