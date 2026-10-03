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
  MenuItem,
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

function getIsoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Client-side Fallback Database (ensures zero white-screen even on static hosts
// like Vercel / Netlify / GitHub Pages where Express /api/* is not running)
// ---------------------------------------------------------------------------

interface LocalRSVP {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  slot: MealSlot;
  status: 'attending' | 'skipping';
  dietaryNote?: string;
  updatedAt: string;
}

interface LocalDB {
  users: User[];
  menus: MenuItem[];
  rsvps: LocalRSVP[];
  ratings: FoodRating[];
  wasteLogs: WasteLog[];
  notifications: AppNotification[];
}

const FALLBACK_STORAGE_KEY = 'annapurna_local_db_v1';

function buildInitialLocalDB(): LocalDB {
  const users: User[] = [
    {
      id: 'usr_std_1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      hostelRoom: 'Aryabhatta Hostel B-204',
      department: 'Computer Science (3rd Yr)',
      dietaryPref: 'Veg',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_std_2',
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      hostelRoom: 'Gargi Hostel A-112',
      department: 'Electronics & Comm (2nd Yr)',
      dietaryPref: 'Veg',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: false, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_std_3',
      name: 'Rohan Gupta',
      email: 'rohan.gupta@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      hostelRoom: 'Aryabhatta Hostel C-308',
      department: 'Mechanical Eng (4th Yr)',
      dietaryPref: 'Non-Veg',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_std_4',
      name: 'Ananya Singh',
      email: 'ananya.singh@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      hostelRoom: 'Gargi Hostel B-215',
      department: 'Biotechnology (3rd Yr)',
      dietaryPref: 'Vegan',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_std_5',
      name: 'Kabir Mehta',
      email: 'kabir.mehta@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      hostelRoom: 'Tagore Hostel A-105',
      department: 'Data Science (1st Yr)',
      dietaryPref: 'Jain',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: false, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_std_6',
      name: 'Diya Sen',
      email: 'diya.sen@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      hostelRoom: 'Sarojini Hostel D-401',
      department: 'Chemical Eng (2nd Yr)',
      dietaryPref: 'Veg',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: false },
    },
    {
      id: 'usr_std_7',
      name: 'Vikramaditya Rao',
      email: 'vikram.rao@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      hostelRoom: 'Tagore Hostel B-220',
      department: 'Civil Eng (3rd Yr)',
      dietaryPref: 'Non-Veg',
      notificationSettings: { breakfastReminder: false, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_std_8',
      name: 'Sneha Deshmukh',
      email: 'sneha.deshmukh@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      hostelRoom: 'Sarojini Hostel C-302',
      department: 'Architecture (4th Yr)',
      dietaryPref: 'Veg',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_adm_1',
      name: 'Chef Rameshwar Verma',
      email: 'headchef.ramesh@messadmin.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
      department: 'Head Chef & Kitchen In-Charge',
      dietaryPref: 'Veg',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_adm_2',
      name: 'Kavita Sundaram',
      email: 'inventory.kavita@messadmin.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      department: 'Hostel Mess Warden & Supply Mgr',
      dietaryPref: 'Veg',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
    },
    {
      id: 'usr_adm_3',
      name: 'Suresh Nambiar',
      email: 'supervisor.suresh@messadmin.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      department: 'Dining Hall Floor Supervisor',
      dietaryPref: 'Non-Veg',
      notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
    },
  ];

  const mealTemplates: Record<MealSlot, { label: string; time: string; cutoff: string; options: { title: string; items: string[]; diet: 'Veg' | 'Non-Veg' | 'Both'; cal: number; prot: string; special?: boolean }[] }> = {
    breakfast: {
      label: 'Breakfast',
      time: '07:30 AM - 09:30 AM',
      cutoff: '07:00 AM',
      options: [
        { title: 'Crispy Masala Dosa & Sambar', items: ['Golden Masala Dosa', 'Veggie Sambar', 'Fresh Coconut Chutney', 'Filter Coffee / Masala Chai'], diet: 'Veg', cal: 420, prot: '12g', special: true },
        { title: 'Steamed Idli & Medu Vada Combo', items: ['Fluffy Idlis (3)', 'Crispy Medu Vada (2)', 'Tomato-Onion Chutney', 'Hot Milk & Tea'], diet: 'Veg', cal: 380, prot: '14g' },
        { title: 'Amritsari Aloo Paratha Feast', items: ['Stuffed Aloo Paratha (2)', 'Fresh Mint Raita', 'Sweet Pickle', 'Hot Bournvita & Chai'], diet: 'Veg', cal: 490, prot: '11g' },
        { title: 'Indori Poha & Corn Flakes', items: ['Sev Poha with Roasted Peanuts', 'Crispy Jalebi (1)', 'Boiled Eggs / Sprouted Moong', 'Hot Milk & Tea'], diet: 'Both', cal: 410, prot: '15g' },
      ],
    },
    lunch: {
      label: 'Lunch',
      time: '12:30 PM - 02:30 PM',
      cutoff: '11:30 AM',
      options: [
        { title: 'North Indian Royal Thali', items: ['Dal Makhani', 'Paneer Butter Masala', 'Jeera Basmati Rice', 'Butter Tawa Roti (3)', 'Kachumber Salad', 'Gulab Jamun (1)'], diet: 'Veg', cal: 680, prot: '22g', special: true },
        { title: 'Chole Bhature & Pulao Special', items: ['Pindi Chole', 'Puffy Bhature (2)', 'Peas Pulao', 'Boondi Raita', 'Pickled Onions'], diet: 'Veg', cal: 740, prot: '19g', special: true },
        { title: 'Kadhai Paneer & Dal Tadka', items: ['Kadhai Paneer', 'Yellow Dal Double Tadka', 'Steamed Rice', 'Phulkas (4)', 'Cucumber Raita'], diet: 'Veg', cal: 640, prot: '24g' },
        { title: 'Dum Veg Biryani & Mirchi Ka Salan', items: ['Hyderabadi Veg Biryani', 'Mirchi Ka Salan', 'Burani Onion Raita', 'Roasted Papad'], diet: 'Veg', cal: 670, prot: '18g', special: true },
      ],
    },
    snacks: {
      label: 'Evening Snacks',
      time: '05:00 PM - 06:30 PM',
      cutoff: '04:30 PM',
      options: [
        { title: 'Crispy Samosa & Masala Chai', items: ['Hot Aloo Samosa (2)', 'Tamarind & Green Mint Chutney', 'Cardamom Cutting Chai / Coffee'], diet: 'Veg', cal: 320, prot: '6g', special: true },
        { title: 'Mumbai Pav Bhaji Platter', items: ['Butter-toasted Pav (2)', 'Spiced Veggie Bhaji', 'Chopped Onions & Lemon', 'Tea / Lemonade'], diet: 'Veg', cal: 390, prot: '8g', special: true },
        { title: 'Kolkata Kathi Roll / Paneer Roll', items: ['Flaky Paratha Roll with Spiced Paneer & Peppers', 'Mint Yogurt Dip', 'Hot Chai'], diet: 'Veg', cal: 380, prot: '13g', special: true },
        { title: 'Grilled Vegetable Sandwich', items: ['Triple-layer Veg Cheese Sandwich', 'Potato Wafers', 'Cold Coffee / Hot Tea'], diet: 'Veg', cal: 360, prot: '11g' },
      ],
    },
    dinner: {
      label: 'Dinner',
      time: '08:00 PM - 10:00 PM',
      cutoff: '07:00 PM',
      options: [
        { title: 'Paneer Lababdar & Kashmiri Dal', items: ['Paneer Lababdar', 'Maa Ki Dal (Slow-cooked black lentils)', 'Steamed Rice', 'Garlic Naan / Tawa Roti (3)', 'Sewaiyan Kheer'], diet: 'Veg', cal: 660, prot: '23g', special: true },
        { title: 'Homestyle Rajma & Mix Veg Sabzi', items: ['Dehradun Rajma Gravy', 'Aloo Gobi Matar', 'Brown/White Steamed Rice', 'Hot Phulkas (4)', 'Sirka Onions'], diet: 'Veg', cal: 580, prot: '20g' },
        { title: 'Mutter Paneer & Tandoori Roti', items: ['Mutter Paneer Gravy', 'Yellow Moong Dal', 'Peas Pulao', 'Tandoori Rotis (3)', 'Fruit Custard'], diet: 'Veg', cal: 630, prot: '22g', special: true },
        { title: 'Paneer Tikka Masala & Biryani Rice', items: ['Smoky Paneer Tikka Masala', 'Dal Makhani', 'Biryani Rice', 'Butter Roti (3)', 'Rasgulla (1)'], diet: 'Veg', cal: 710, prot: '25g', special: true },
      ],
    },
  };

  const menus: MenuItem[] = [];
  const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
  for (let offset = -6; offset <= 4; offset++) {
    const dateStr = getIsoDate(offset);
    const dayOfWeek = Math.abs(new Date(dateStr).getDay());
    for (const slot of slots) {
      const t = mealTemplates[slot];
      const opt = t.options[dayOfWeek % t.options.length];
      menus.push({
        id: `${dateStr}_${slot}`,
        date: dateStr,
        slot,
        slotLabel: t.label,
        timeWindow: t.time,
        cutoffTime: t.cutoff,
        title: opt.title,
        items: opt.items,
        dietType: opt.diet,
        calories: opt.cal,
        protein: opt.prot,
        chefSpecial: opt.special,
      });
    }
  }

  const rsvps: LocalRSVP[] = [];
  const students = users.filter((u) => u.role === 'student');
  for (let offset = -6; offset <= 2; offset++) {
    const dateStr = getIsoDate(offset);
    for (const student of students) {
      for (const slot of slots) {
        const hash = (dateStr + student.id + slot).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const status = (hash % 10) < 2 ? 'skipping' : 'attending';
        rsvps.push({
          id: `rsvp_${dateStr}_${student.id}_${slot}`,
          userId: student.id,
          userEmail: student.email,
          userName: student.name,
          date: dateStr,
          slot,
          status,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  const ratings: FoodRating[] = [
    {
      id: 'rate_1',
      userId: 'usr_std_1',
      userName: 'Aarav Sharma',
      userEmail: 'aarav.sharma@campus.edu',
      dishName: 'Paneer Butter Masala',
      mealSlot: 'lunch',
      rating: 5,
      tags: ['Delicious', 'Fresh', 'Rich Gravy', 'Must Repeat'],
      comment: 'Absolutely restaurant quality! Perfect paneer softness and authentic aromatic spices.',
      date: getIsoDate(-1),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'rate_2',
      userId: 'usr_std_2',
      userName: 'Priya Patel',
      userEmail: 'priya.patel@campus.edu',
      dishName: 'Crispy Masala Dosa',
      mealSlot: 'breakfast',
      rating: 5,
      tags: ['Crispy', 'Fresh Coconut Chutney', 'Hot'],
      comment: 'Dosa was super thin and crispy. The sambhar had authentic South Indian flavour.',
      date: getIsoDate(-1),
      createdAt: new Date(Date.now() - 90000000).toISOString(),
    },
    {
      id: 'rate_3',
      userId: 'usr_std_3',
      userName: 'Rohan Gupta',
      userEmail: 'rohan.gupta@campus.edu',
      dishName: 'Chole Bhature',
      mealSlot: 'lunch',
      rating: 5,
      tags: ['Delicious', 'Fluffy Bhature', 'Perfect Spice'],
      comment: 'Bhaturas were fluffy and not overly greasy. Chole cooked to perfection.',
      date: getIsoDate(-2),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'rate_4',
      userId: 'usr_std_4',
      userName: 'Ananya Singh',
      userEmail: 'ananya.singh@campus.edu',
      dishName: 'Upma',
      mealSlot: 'breakfast',
      rating: 2,
      tags: ['Dry', 'Needs More Salt', 'Bland'],
      comment: 'Very dry and lacked vegetables or cashews. Needed a lot more chutney.',
      date: getIsoDate(-3),
      createdAt: new Date(Date.now() - 250000000).toISOString(),
    },
    {
      id: 'rate_6',
      userId: 'usr_std_6',
      userName: 'Diya Sen',
      userEmail: 'diya.sen@campus.edu',
      dishName: 'Lauki Kofta Sabzi',
      mealSlot: 'dinner',
      rating: 1,
      tags: ['Too Oily', 'Bland', 'Overcooked'],
      comment: 'Too oily and watery curry. Almost everyone at our table left it untouched.',
      date: getIsoDate(-3),
      createdAt: new Date(Date.now() - 260000000).toISOString(),
    },
  ];

  const wasteLogs: WasteLog[] = [
    {
      id: 'wlog_1',
      date: getIsoDate(-1),
      slot: 'lunch',
      mainDish: 'Paneer Butter Masala & Jeera Rice',
      cookedKg: 82.5,
      plannedPortions: 185,
      actualEaters: 178,
      eatenKg: 79.2,
      leftoverKg: 3.3,
      disposal: 'donated_shelter',
      wasteReason: 'accurate_prep',
      actionTaken: 'Only 3.3 kg leftover, immediately packed and donated to local Annakshetra shelter.',
      loggedBy: 'Chef Rameshwar Verma',
      loggedAt: new Date(Date.now() - 80000000).toISOString(),
    },
    {
      id: 'wlog_2',
      date: getIsoDate(-2),
      slot: 'dinner',
      mainDish: 'Rajma Chawal & Mix Veg Sabzi',
      cookedKg: 78.0,
      plannedPortions: 175,
      actualEaters: 142,
      eatenKg: 63.9,
      leftoverKg: 14.1,
      disposal: 'repurposed',
      wasteReason: 'sudden_absenteeism',
      actionTaken: '33 students skipped dinner for weekend outing without RSVPing early. Surplus chilled for paratha stuffing.',
      loggedBy: 'Kavita Sundaram',
      loggedAt: new Date(Date.now() - 160000000).toISOString(),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif_1',
      targetRole: 'all',
      title: '🍱 Special Royal Thali Today!',
      message: 'Chef has prepared Paneer Butter Masala, Dal Makhani & Gulab Jamun for today\'s lunch. Mark your attendance before 11:30 AM.',
      type: 'menu_update',
      mealSlot: 'lunch',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      readBy: ['usr_std_1'],
    },
    {
      id: 'notif_2',
      targetRole: 'student',
      title: '⏰ Dinner Cutoff in 45 Minutes',
      message: 'Help the kitchen minimize food waste! Please confirm if you will be having dinner tonight before 07:00 PM.',
      type: 'cutoff',
      mealSlot: 'dinner',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      readBy: [],
    },
  ];

  return { users, menus, rsvps, ratings, wasteLogs, notifications };
}

function getLocalDB(): LocalDB {
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  const fresh = buildInitialLocalDB();
  saveLocalDB(fresh);
  return fresh;
}

function saveLocalDB(db: LocalDB) {
  try {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore storage errors
  }
}

async function safeApiFetch<T>(url: string, options?: RequestInit, fallbackFn?: () => T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
    throw new Error(`API returned non-JSON or status ${res.status}`);
  } catch (err) {
    if (fallbackFn) {
      return fallbackFn();
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// API Client Methods with Automatic Local Fallback
// ---------------------------------------------------------------------------

export async function fetchMe(): Promise<User> {
  return safeApiFetch('/api/auth/me', { headers: getHeaders() }, () => {
    const db = getLocalDB();
    return db.users.find((u) => u.id === currentUserId) || db.users[0];
  });
}

export async function fetchProfiles(): Promise<{ students: User[]; admins: User[]; all: User[] }> {
  return safeApiFetch('/api/auth/profiles', { headers: getHeaders() }, () => {
    const db = getLocalDB();
    return {
      students: db.users.filter((u) => u.role === 'student'),
      admins: db.users.filter((u) => u.role === 'admin'),
      all: db.users,
    };
  });
}

export async function loginUser(email: string, role?: 'student' | 'admin'): Promise<{ success: boolean; user: User }> {
  const data = await safeApiFetch(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    },
    () => {
      const db = getLocalDB();
      let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        const assignedRole = role === 'admin' || email.includes('admin') || email.includes('chef') ? 'admin' : 'student';
        const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        user = {
          id: `usr_${Date.now()}`,
          name: formattedName || 'Campus Resident',
          email,
          role: assignedRole,
          avatar:
            assignedRole === 'admin'
              ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          hostelRoom: assignedRole === 'student' ? 'Aryabhatta Hostel' : undefined,
          department: assignedRole === 'student' ? 'Engineering' : 'Mess Kitchen Staff',
          dietaryPref: 'Veg',
          notificationSettings: { breakfastReminder: true, lunchReminder: true, snacksReminder: true, dinnerReminder: true, pushEnabled: true },
        };
        db.users.push(user);
        saveLocalDB(db);
      }
      return { success: true, user };
    }
  );
  if (data.user?.id) {
    setActiveUserId(data.user.id);
  }
  return data;
}

export async function updateUserSettings(
  notificationSettings: User['notificationSettings'],
  dietaryPref?: User['dietaryPref']
): Promise<{ success: boolean; user: User }> {
  return safeApiFetch(
    '/api/auth/settings',
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notificationSettings, dietaryPref }),
    },
    () => {
      const db = getLocalDB();
      const user = db.users.find((u) => u.id === currentUserId) || db.users[0];
      user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
      if (dietaryPref) user.dietaryPref = dietaryPref;
      saveLocalDB(db);
      return { success: true, user };
    }
  );
}

export async function fetchSchedule(date?: string): Promise<{
  selectedDate: string;
  totalStudents: number;
  schedule: DaySchedule[];
}> {
  const url = date ? `/api/meals/schedule?date=${date}` : '/api/meals/schedule';
  return safeApiFetch(url, { headers: getHeaders() }, () => {
    const db = getLocalDB();
    const totalStudents = db.users.filter((u) => u.role === 'student').length;
    const dates: string[] = [];
    for (let i = -2; i <= 4; i++) dates.push(getIsoDate(i));

    const schedule: DaySchedule[] = dates.map((dateStr) => {
      const dayMenus = db.menus.filter((m) => m.date === dateStr);
      const dayRsvps = db.rsvps.filter((r) => r.date === dateStr);

      const meals = (['breakfast', 'lunch', 'snacks', 'dinner'] as MealSlot[]).map((slot) => {
        const menu = dayMenus.find((m) => m.slot === slot) || null;
        const slotRsvps = dayRsvps.filter((r) => r.slot === slot);
        const userRsvp = slotRsvps.find((r) => r.userId === currentUserId);
        const attending = slotRsvps.filter((r) => r.status === 'attending').length;
        const skipping = slotRsvps.filter((r) => r.status === 'skipping').length;
        return {
          slot,
          menu,
          userStatus: userRsvp ? userRsvp.status : ('undecided' as const),
          dietaryNote: userRsvp?.dietaryNote || '',
          updatedAt: userRsvp?.updatedAt || null,
          counts: {
            attending,
            skipping,
            undecided: Math.max(0, totalStudents - attending - skipping),
            total: totalStudents,
          },
        };
      });

      const dateObj = new Date(dateStr + 'T00:00:00');
      return {
        date: dateStr,
        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: dateStr === getIsoDate(0),
        meals,
      };
    });

    return { selectedDate: date || getIsoDate(0), totalStudents, schedule };
  });
}

export async function submitRSVP(date: string, slot: MealSlot, status: 'attending' | 'skipping', dietaryNote?: string) {
  return safeApiFetch(
    '/api/meals/rsvp',
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ date, slot, status, dietaryNote }),
    },
    () => {
      const db = getLocalDB();
      const user = db.users.find((u) => u.id === currentUserId) || db.users[0];
      const idx = db.rsvps.findIndex((r) => r.userId === currentUserId && r.date === date && r.slot === slot);
      const rsvp: LocalRSVP = {
        id: idx >= 0 ? db.rsvps[idx].id : `rsvp_${Date.now()}`,
        userId: currentUserId,
        userEmail: user.email,
        userName: user.name,
        date,
        slot,
        status,
        dietaryNote,
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) db.rsvps[idx] = rsvp;
      else db.rsvps.push(rsvp);
      saveLocalDB(db);
      return { success: true, rsvp };
    }
  );
}

export async function submitBatchRSVP(date: string, status: 'attending' | 'skipping') {
  return safeApiFetch(
    '/api/meals/rsvp-batch',
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ date, status }),
    },
    () => {
      const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
      slots.forEach((slot) => submitRSVP(date, slot, status));
      return { success: true };
    }
  );
}

export async function fetchHeadcounts(date?: string): Promise<{
  date: string;
  totalRegisteredStudents: number;
  meals: HeadcountMeal[];
}> {
  const targetDate = date || getIsoDate(0);
  const url = `/api/admin/headcounts?date=${targetDate}`;
  return safeApiFetch(url, { headers: getHeaders() }, () => {
    const db = getLocalDB();
    const students = db.users.filter((u) => u.role === 'student');
    const dayMenus = db.menus.filter((m) => m.date === targetDate);
    const dayRsvps = db.rsvps.filter((r) => r.date === targetDate);
    const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

    const meals: HeadcountMeal[] = slots.map((slot) => {
      const menu = dayMenus.find((m) => m.slot === slot);
      const slotRsvps = dayRsvps.filter((r) => r.slot === slot);
      const attendingList = slotRsvps.filter((r) => r.status === 'attending');
      const skippingList = slotRsvps.filter((r) => r.status === 'skipping');

      const dietaryBreakdown = { Veg: 0, 'Non-Veg': 0, Jain: 0, Vegan: 0 };
      attendingList.forEach((r) => {
        const u = db.users.find((usr) => usr.id === r.userId);
        const pref = u?.dietaryPref || 'Veg';
        dietaryBreakdown[pref] = (dietaryBreakdown[pref] || 0) + 1;
      });

      return {
        slot,
        slotLabel: slot.charAt(0).toUpperCase() + slot.slice(1),
        menuTitle: menu?.title || 'Daily Special',
        menuItems: menu?.items || [],
        timeWindow: menu?.timeWindow || '',
        cutoffTime: menu?.cutoffTime || '',
        attendingCount: attendingList.length,
        skippingCount: skippingList.length,
        undecidedCount: Math.max(0, students.length - attendingList.length - skippingList.length),
        totalStudents: students.length,
        dietaryBreakdown,
        attendingStudents: attendingList.map((r) => ({ id: r.userId, name: r.userName, email: r.userEmail, dietaryNote: r.dietaryNote })),
        skippingStudents: skippingList.map((r) => ({ id: r.userId, name: r.userName, email: r.userEmail })),
      };
    });

    return { date: targetDate, totalRegisteredStudents: students.length, meals };
  });
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
  const targetDate = date || getIsoDate(0);
  const url = `/api/admin/supplies?date=${targetDate}&buffer=${buffer}`;
  return safeApiFetch(url, { headers: getHeaders() }, () => {
    const db = getLocalDB();
    const dayRsvps = db.rsvps.filter((r) => r.date === targetDate);
    const calibrationMultiplier = 0.94;
    const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

    const baseRecipes: Record<MealSlot, { item: string; per100: number; unit: string; category: string }[]> = {
      breakfast: [
        { item: 'Flour / Semolina (Rava / Atta / Rice Flour)', per100: 12.0, unit: 'kg', category: 'Grains & Flour' },
        { item: 'Fresh Milk (Tea, Coffee & Beverages)', per100: 14.0, unit: 'Liters', category: 'Dairy' },
      ],
      lunch: [
        { item: 'Premium Sharbati Wheat Atta (Phulkas/Roti)', per100: 14.0, unit: 'kg', category: 'Grains & Flour' },
        { item: 'Basmati Rice (Steamed & Pulao)', per100: 16.0, unit: 'kg', category: 'Grains & Flour' },
        { item: 'Dal & Pulses (Toor / Rajma / Chole)', per100: 8.5, unit: 'kg', category: 'Pulses & Dal' },
        { item: 'Fresh Malai Paneer', per100: 8.0, unit: 'kg', category: 'Dairy' },
      ],
      snacks: [
        { item: 'Snack Base Flour / Potatoes / Bread', per100: 11.0, unit: 'kg', category: 'Grains & Flour' },
        { item: 'Fresh Milk for Chai & Coffee', per100: 12.5, unit: 'Liters', category: 'Dairy' },
      ],
      dinner: [
        { item: 'Wheat Atta for Fresh Rotis & Naan', per100: 15.0, unit: 'kg', category: 'Grains & Flour' },
        { item: 'Vegetables & Greens', per100: 18.0, unit: 'kg', category: 'Vegetables' },
      ],
    };

    const mealSupplies: MealSupplyCalculation[] = slots.map((slot) => {
      const attending = dayRsvps.filter((r) => r.slot === slot && r.status === 'attending').length;
      const effectivePortions = Math.max(1, Math.round(attending * (1 + buffer / 100) * calibrationMultiplier));
      const supplies = baseRecipes[slot].map((r) => {
        const amount = parseFloat(((r.per100 * effectivePortions) / 100).toFixed(2));
        const estimatedCost = Math.round(amount * 65);
        return { name: r.item, category: r.category, amount, unit: r.unit, cost: estimatedCost, estimatedCost };
      });
      return {
        slot,
        slotLabel: slot.charAt(0).toUpperCase() + slot.slice(1),
        menuTitle: 'Daily Special',
        attendingRSVP: attending,
        effectivePortionsToCook: effectivePortions,
        calibrationFactor: calibrationMultiplier,
        bufferAppliedPercent: buffer,
        supplies,
        totalEstimatedCost: supplies.reduce((s, i) => s + i.estimatedCost, 0),
      };
    });

    const dailyGroceryList = mealSupplies.flatMap((m) => m.supplies);
    const grandTotalCost = dailyGroceryList.reduce((s, i) => s + i.estimatedCost, 0);

    return {
      date: targetDate,
      bufferPercent: buffer,
      calibrationMultiplier,
      predictionNote: 'Calibrated downward by 6.0% based on recent leftover data to prevent over-cooking.',
      mealSupplies,
      dailyGroceryList,
      grandTotalCost,
    };
  });
}

export async function fetchWasteLogs(): Promise<{ logs: WasteLog[] }> {
  return safeApiFetch('/api/admin/waste-logs', { headers: getHeaders() }, () => {
    const db = getLocalDB();
    return { logs: db.wasteLogs };
  });
}

export async function createWasteLog(logData: Partial<WasteLog>): Promise<{ success: boolean; log: WasteLog }> {
  return safeApiFetch(
    '/api/admin/waste-logs',
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(logData),
    },
    () => {
      const db = getLocalDB();
      const log: WasteLog = {
        id: `wlog_${Date.now()}`,
        date: logData.date || getIsoDate(0),
        slot: logData.slot || 'lunch',
        mainDish: logData.mainDish || 'Daily Special',
        cookedKg: Number(logData.cookedKg || 50),
        plannedPortions: Number(logData.plannedPortions || 100),
        actualEaters: Number(logData.actualEaters || 95),
        eatenKg: Number(logData.eatenKg || 46),
        leftoverKg: Number(logData.leftoverKg || 4),
        disposal: logData.disposal || 'donated_shelter',
        wasteReason: logData.wasteReason || 'accurate_prep',
        actionTaken: logData.actionTaken || 'Logged in daily audit',
        loggedBy: logData.loggedBy || 'Mess Admin',
        loggedAt: new Date().toISOString(),
      };
      db.wasteLogs.unshift(log);
      saveLocalDB(db);
      return { success: true, log };
    }
  );
}

export async function fetchAlerts(): Promise<{ alerts: PredictiveAlert[]; count: number }> {
  return safeApiFetch('/api/admin/alerts', { headers: getHeaders() }, () => {
    const alerts: PredictiveAlert[] = [
      {
        id: 'alt_1',
        level: 'warning',
        title: '⚠️ Surprise Drop Alert: Dinner Attendance Down',
        description: 'Students have opted out of dinner tonight. Adjust evening preparation quantities accordingly.',
        recommendedAction: 'Scale down evening roti dough by 2.5 kg to prevent surplus.',
        impactKg: 2.5,
        mealSlot: 'dinner',
        date: getIsoDate(0),
      },
      {
        id: 'alt_2',
        level: 'success',
        title: '🎯 Adaptive Prediction Engine Active',
        description: 'Auto-calibration factor tuned to 0.94x based on past kitchen waste logs.',
        recommendedAction: 'Follow auto-calibrated kitchen order checklist below.',
        impactKg: 4.2,
        date: getIsoDate(0),
      },
    ];
    return { alerts, count: alerts.length };
  });
}

export async function fetchStats(): Promise<StatsOverview> {
  return safeApiFetch('/api/stats/overview', { headers: getHeaders() }, () => {
    const db = getLocalDB();
    const students = db.users.filter((u) => u.role === 'student');
    const last7Days: string[] = [];
    for (let i = -6; i <= 0; i++) last7Days.push(getIsoDate(i));

    const attendanceTrends = last7Days.map((dateStr) => {
      const dayRsvps = db.rsvps.filter((r) => r.date === dateStr);
      const dateObj = new Date(dateStr + 'T00:00:00');
      const breakfast = dayRsvps.filter((r) => r.slot === 'breakfast' && r.status === 'attending').length;
      const lunch = dayRsvps.filter((r) => r.slot === 'lunch' && r.status === 'attending').length;
      const snacks = dayRsvps.filter((r) => r.slot === 'snacks' && r.status === 'attending').length;
      const dinner = dayRsvps.filter((r) => r.slot === 'dinner' && r.status === 'attending').length;
      const totalEaten = breakfast + lunch + snacks + dinner;
      return {
        date: dateStr,
        dayLabel: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        breakfast,
        lunch,
        snacks,
        dinner,
        totalEaten,
        attendanceRate: Math.round((totalEaten / Math.max(1, students.length * 4)) * 100),
      };
    });

    const allSkipped = db.rsvps.filter((r) => r.status === 'skipping').length;
    const totalHostelFoodSavedKg = parseFloat((allSkipped * 0.45 + 142.5).toFixed(1));
    const userSkips = db.rsvps.filter((r) => r.userId === currentUserId && r.status === 'skipping').length;
    const userFoodSavedKg = parseFloat((userSkips * 0.45 + 1.8).toFixed(1));

    return {
      attendanceTrends,
      wasteReduction: {
        totalHostelFoodSavedKg,
        totalCo2SavedKg: parseFloat((totalHostelFoodSavedKg * 2.4).toFixed(1)),
        totalMoneySaved: Math.round(totalHostelFoodSavedKg * 85),
        totalMealsSaved: Math.round(totalHostelFoodSavedKg / 0.45),
        wasteDiversionRate: 88.4,
      },
      studentPersonalStats: {
        userFoodSavedKg,
        userMealsAvoided: userSkips + 4,
        userCo2Avoided: parseFloat((userFoodSavedKg * 2.4).toFixed(1)),
        badge: { name: 'Precision Diner', icon: '⭐', level: 3, desc: 'Consistently helps kitchen optimize food' },
      },
      slotDistribution: {
        breakfast: db.rsvps.filter((r) => r.slot === 'breakfast' && r.status === 'attending').length,
        lunch: db.rsvps.filter((r) => r.slot === 'lunch' && r.status === 'attending').length,
        snacks: db.rsvps.filter((r) => r.slot === 'snacks' && r.status === 'attending').length,
        dinner: db.rsvps.filter((r) => r.slot === 'dinner' && r.status === 'attending').length,
      },
    };
  });
}

export async function fetchRatings(): Promise<{
  dishes: DishLeaderboardItem[];
  mostFavorite: DishLeaderboardItem[];
  mostDisliked: DishLeaderboardItem[];
  recentReviews: FoodRating[];
  totalRatingsCount: number;
}> {
  return safeApiFetch('/api/ratings', { headers: getHeaders() }, () => {
    const db = getLocalDB();
    const dishMap: Record<string, { dishName: string; category: string; count: number; totalStars: number; tags: string[]; comments: string[] }> = {};
    db.ratings.forEach((r) => {
      if (!dishMap[r.dishName]) {
        dishMap[r.dishName] = { dishName: r.dishName, category: r.mealSlot, count: 0, totalStars: 0, tags: r.tags, comments: [] };
      }
      dishMap[r.dishName].count++;
      dishMap[r.dishName].totalStars += r.rating;
      if (r.comment) dishMap[r.dishName].comments.push(r.comment);
    });
    const dishes: DishLeaderboardItem[] = Object.values(dishMap).map((d) => ({
      dishName: d.dishName,
      category: d.category,
      ratingCount: d.count,
      avgRating: parseFloat((d.totalStars / d.count).toFixed(1)),
      topTags: d.tags.slice(0, 3),
      comments: d.comments.slice(0, 3),
    }));
    return {
      dishes,
      mostFavorite: [...dishes].sort((a, b) => b.avgRating - a.avgRating).slice(0, 6),
      mostDisliked: [...dishes].sort((a, b) => a.avgRating - b.avgRating).slice(0, 6),
      recentReviews: db.ratings.slice(0, 10),
      totalRatingsCount: db.ratings.length,
    };
  });
}

export async function submitRating(reviewData: {
  dishName: string;
  mealSlot: MealSlot;
  rating: number;
  tags: string[];
  comment: string;
  date?: string;
}): Promise<{ success: boolean; rating: FoodRating }> {
  return safeApiFetch(
    '/api/ratings',
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    },
    () => {
      const db = getLocalDB();
      const user = db.users.find((u) => u.id === currentUserId) || db.users[0];
      const rating: FoodRating = {
        id: `rate_${Date.now()}`,
        userId: currentUserId,
        userName: user.name,
        userEmail: user.email,
        dishName: reviewData.dishName,
        mealSlot: reviewData.mealSlot,
        rating: reviewData.rating,
        tags: reviewData.tags,
        comment: reviewData.comment,
        date: reviewData.date || getIsoDate(0),
        createdAt: new Date().toISOString(),
      };
      db.ratings.unshift(rating);
      saveLocalDB(db);
      return { success: true, rating };
    }
  );
}

export async function fetchNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  return safeApiFetch('/api/notifications', { headers: getHeaders() }, () => {
    const db = getLocalDB();
    const unreadCount = db.notifications.filter((n) => !n.readBy.includes(currentUserId)).length;
    return { notifications: db.notifications, unreadCount };
  });
}

export async function markNotificationAsRead(id: string) {
  return safeApiFetch(
    '/api/notifications/mark-read',
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id }),
    },
    () => {
      const db = getLocalDB();
      const notif = db.notifications.find((n) => n.id === id);
      if (notif && !notif.readBy.includes(currentUserId)) {
        notif.readBy.push(currentUserId);
        saveLocalDB(db);
      }
      return { success: true };
    }
  );
}

export async function broadcastNotification(title: string, message: string, mealSlot?: MealSlot, type?: string) {
  return safeApiFetch(
    '/api/notifications/broadcast',
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, message, mealSlot, type }),
    },
    () => {
      const db = getLocalDB();
      const notification: AppNotification = {
        id: `notif_${Date.now()}`,
        targetRole: 'student',
        title,
        message,
        type: (type as AppNotification['type']) || 'reminder',
        mealSlot,
        createdAt: new Date().toISOString(),
        readBy: [],
      };
      db.notifications.unshift(notification);
      saveLocalDB(db);
      return { success: true, notification };
    }
  );
}

export async function triggerTestReminder(slot?: MealSlot) {
  return safeApiFetch(
    '/api/notifications/test-reminder',
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ slot }),
    },
    () => {
      const db = getLocalDB();
      const notification: AppNotification = {
        id: `notif_${Date.now()}`,
        targetUserId: currentUserId,
        title: '🌙 Dinner Cutoff Alert (07:00 PM)',
        message: 'Dinner is scheduled at 8:00 PM. Please confirm if you will be dining tonight.',
        type: 'cutoff',
        mealSlot: slot || 'dinner',
        createdAt: new Date().toISOString(),
        readBy: [],
      };
      db.notifications.unshift(notification);
      saveLocalDB(db);
      return { success: true, notification };
    }
  );
}
