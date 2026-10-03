export type MealSlot = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar: string;
  hostelRoom?: string;
  department?: string;
  dietaryPref: 'Veg' | 'Non-Veg' | 'Jain' | 'Vegan';
  notificationSettings: {
    breakfastReminder: boolean;
    lunchReminder: boolean;
    snacksReminder: boolean;
    dinnerReminder: boolean;
    pushEnabled: boolean;
  };
}

export interface MenuItem {
  id: string;
  date: string;
  slot: MealSlot;
  slotLabel: string;
  timeWindow: string;
  cutoffTime: string;
  title: string;
  items: string[];
  dietType: 'Veg' | 'Non-Veg' | 'Both';
  calories: number;
  protein: string;
  chefSpecial?: boolean;
}

export interface MealSlotSchedule {
  slot: MealSlot;
  menu: MenuItem | null;
  userStatus: 'attending' | 'skipping' | 'undecided';
  dietaryNote?: string;
  updatedAt: string | null;
  counts: {
    attending: number;
    skipping: number;
    undecided: number;
    total: number;
  };
}

export interface DaySchedule {
  date: string;
  dayName: string;
  formattedDate: string;
  isToday: boolean;
  meals: MealSlotSchedule[];
}

export interface FoodRating {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  dishName: string;
  mealSlot: MealSlot;
  rating: number;
  tags: string[];
  comment: string;
  date: string;
  createdAt: string;
}

export interface DishLeaderboardItem {
  dishName: string;
  category: string;
  ratingCount: number;
  avgRating: number;
  topTags: string[];
  comments: string[];
}

export interface WasteLog {
  id: string;
  date: string;
  slot: MealSlot;
  mainDish: string;
  cookedKg: number;
  plannedPortions: number;
  actualEaters: number;
  eatenKg: number;
  leftoverKg: number;
  disposal: 'composted' | 'donated_shelter' | 'repurposed' | 'discarded';
  wasteReason: 'accurate_prep' | 'sudden_absenteeism' | 'unpopular_dish' | 'overcooked_buffer' | 'weather_drop';
  actionTaken: string;
  loggedBy: string;
  loggedAt: string;
}

export interface PredictiveAlert {
  id: string;
  level: 'warning' | 'info' | 'critical' | 'success';
  title: string;
  description: string;
  recommendedAction: string;
  impactKg: number;
  mealSlot?: MealSlot;
  date: string;
}

export interface AppNotification {
  id: string;
  targetUserId?: string;
  targetRole?: 'all' | 'student' | 'admin';
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'cutoff' | 'menu_update' | 'waste_achievement';
  mealSlot?: MealSlot;
  createdAt: string;
  readBy: string[];
}

export interface SupplyItem {
  name: string;
  category: string;
  amount: number;
  unit: string;
  cost?: number;
  estimatedCost: number;
}

export interface MealSupplyCalculation {
  slot: MealSlot;
  slotLabel: string;
  menuTitle: string;
  attendingRSVP: number;
  effectivePortionsToCook: number;
  calibrationFactor: number;
  bufferAppliedPercent: number;
  supplies: SupplyItem[];
  totalEstimatedCost: number;
}

export interface HeadcountMeal {
  slot: MealSlot;
  slotLabel: string;
  menuTitle: string;
  menuItems: string[];
  timeWindow: string;
  cutoffTime: string;
  attendingCount: number;
  skippingCount: number;
  undecidedCount: number;
  totalStudents: number;
  dietaryBreakdown: {
    Veg: number;
    'Non-Veg': number;
    Jain: number;
    Vegan: number;
  };
  attendingStudents: {
    id: string;
    name: string;
    email: string;
    dietaryNote?: string;
  }[];
  skippingStudents: {
    id: string;
    name: string;
    email: string;
  }[];
}

export interface AttendanceTrendDay {
  date: string;
  dayLabel: string;
  breakfast: number;
  lunch: number;
  snacks: number;
  dinner: number;
  totalEaten: number;
  attendanceRate: number;
}

export interface StatsOverview {
  attendanceTrends: AttendanceTrendDay[];
  wasteReduction: {
    totalHostelFoodSavedKg: number;
    totalCo2SavedKg: number;
    totalMoneySaved: number;
    totalMealsSaved: number;
    wasteDiversionRate: number;
  };
  studentPersonalStats: {
    userFoodSavedKg: number;
    userMealsAvoided: number;
    userCo2Avoided: number;
    badge: {
      name: string;
      icon: string;
      level: number;
      desc: string;
    };
  };
  slotDistribution: Record<MealSlot, number>;
}
