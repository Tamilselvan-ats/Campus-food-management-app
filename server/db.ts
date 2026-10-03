import fs from 'fs';
import path from 'path';

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

export type MealSlot = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export interface MenuItem {
  id: string;
  date: string; // YYYY-MM-DD
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

export interface MealRSVP {
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

export interface FoodRating {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  dishName: string;
  mealSlot: MealSlot;
  rating: number; // 1-5
  tags: string[];
  comment: string;
  date: string;
  createdAt: string;
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

export interface AppNotification {
  id: string;
  targetUserId?: string; // null means broadcast to all
  targetRole?: 'all' | 'student' | 'admin';
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'cutoff' | 'menu_update' | 'waste_achievement';
  mealSlot?: MealSlot;
  createdAt: string;
  readBy: string[]; // user IDs who read it
}

export interface DatabaseSchema {
  users: User[];
  menus: MenuItem[];
  rsvps: MealRSVP[];
  ratings: FoodRating[];
  wasteLogs: WasteLog[];
  notifications: AppNotification[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'mess_db.json');

// Ensure directory exists safely (supports read-only container filesystems)
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Running with in-memory database (filesystem is read-only):', err);
}

// Generate dates helper around today
export function getIsoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const INITIAL_USERS: User[] = [
  // Students
  {
    id: 'usr_std_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    hostelRoom: 'Aryabhatta Hostel B-204',
    department: 'Computer Science (3rd Yr)',
    dietaryPref: 'Veg',
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: true,
    },
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
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: false,
      dinnerReminder: true,
      pushEnabled: true,
    },
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
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: true,
    },
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
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: true,
    },
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
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: false,
      dinnerReminder: true,
      pushEnabled: true,
    },
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
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: false,
    },
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
    notificationSettings: {
      breakfastReminder: false,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: true,
    },
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
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: true,
    },
  },
  // Admins & Mess Staff
  {
    id: 'usr_adm_1',
    name: 'Chef Rameshwar Verma',
    email: 'headchef.ramesh@messadmin.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    department: 'Head Chef & Kitchen In-Charge',
    dietaryPref: 'Veg',
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: true,
    },
  },
  {
    id: 'usr_adm_2',
    name: 'Kavita Sundaram',
    email: 'inventory.kavita@messadmin.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Hostel Mess Warden & Supply Mgr',
    dietaryPref: 'Veg',
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: true,
    },
  },
  {
    id: 'usr_adm_3',
    name: 'Suresh Nambiar',
    email: 'supervisor.suresh@messadmin.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    department: 'Dining Hall Floor Supervisor',
    dietaryPref: 'Non-Veg',
    notificationSettings: {
      breakfastReminder: true,
      lunchReminder: true,
      snacksReminder: true,
      dinnerReminder: true,
      pushEnabled: true,
    },
  },
];

// Helper to seed 7 days of menus (-2 days to +4 days)
function seedMenus(): MenuItem[] {
  const menus: MenuItem[] = [];
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
        { title: 'Fluffy Puri Bhaji Breakfast', items: ['Crispy Wheat Puris (4)', 'Spiced Aloo Bhaji', 'Halwa (Suji)', 'Filter Coffee'], diet: 'Veg', cal: 520, prot: '10g', special: true },
        { title: 'South Indian Upma & Boiled Egg', items: ['Rava Veggie Upma', 'Coconut & Gunpowder Podi', 'Boiled Eggs (2) or Sprouts', 'Chai'], diet: 'Both', cal: 370, prot: '16g' },
        { title: 'Paneer Stuffed Kulcha & Curd', items: ['Tandoori Paneer Kulcha (2)', 'Chilled Dahi with Roasted Cumin', 'Ginger Tea'], diet: 'Veg', cal: 480, prot: '18g', special: true },
      ],
    },
    lunch: {
      label: 'Lunch',
      time: '12:30 PM - 02:30 PM',
      cutoff: '11:30 AM',
      options: [
        { title: 'North Indian Royal Thali', items: ['Dal Makhani', 'Paneer Butter Masala', 'Jeera Basmati Rice', 'Butter Tawa Roti (3)', 'Kachumber Salad', 'Gulab Jamun (1)'], diet: 'Veg', cal: 680, prot: '22g', special: true },
        { title: 'Chole Bhature & Pulao Special', items: ['Pindi Chole', 'Puffy Bhature (2)', 'Peas Pulao', 'Boondi Raita', 'Pickled Onions'], diet: 'Veg', cal: 740, prot: '19g', special: true },
        { title: 'South Indian Meals & Sambar', items: ['Steamed Ponni Rice', 'Drumstick Sambar', 'Mysore Rasam', 'Beans Poriyal', 'Crispy Appalam', 'Curd & Pickle'], diet: 'Veg', cal: 590, prot: '15g' },
        { title: 'Kadhai Paneer & Dal Tadka', items: ['Kadhai Paneer', 'Yellow Dal Double Tadka', 'Steamed Rice', 'Phulkas (4)', 'Cucumber Raita'], diet: 'Veg', cal: 640, prot: '24g' },
        { title: 'Dum Veg Biryani & Mirchi Ka Salan', items: ['Hyderabadi Veg Biryani', 'Mirchi Ka Salan', 'Burani Onion Raita', 'Roasted Papad'], diet: 'Veg', cal: 670, prot: '18g', special: true },
        { title: 'Kadhi Pakora & Rajma Masala', items: ['Punjabi Kadhi Pakora', 'Slow-cooked Rajma', 'Steamed Basmati Rice', 'Ghee Rotis', 'Green Salad'], diet: 'Veg', cal: 620, prot: '21g' },
        { title: 'Malai Kofta & Kashmiri Pulao', items: ['Creamy Malai Kofta', 'Dal Palak', 'Kashmiri Sweet Pulao', 'Roomali Roti', 'Gajar Ka Halwa'], diet: 'Veg', cal: 720, prot: '17g', special: true },
      ],
    },
    snacks: {
      label: 'Evening Snacks',
      time: '05:00 PM - 06:30 PM',
      cutoff: '04:30 PM',
      options: [
        { title: 'Crispy Samosa & Masala Chai', items: ['Hot Aloo Samosa (2)', 'Tamarind & Green Mint Chutney', 'Cardamom Cutting Chai / Coffee'], diet: 'Veg', cal: 320, prot: '6g', special: true },
        { title: 'Mumbai Pav Bhaji Platter', items: ['Butter-toasted Pav (2)', 'Spiced Veggie Bhaji', 'Chopped Onions & Lemon', 'Tea / Lemonade'], diet: 'Veg', cal: 390, prot: '8g', special: true },
        { title: 'Mix Veg Pakora & Dip', items: ['Onion & Paneer Pakoras (5)', 'Coriander Dip', 'Adrak Masala Chai'], diet: 'Veg', cal: 340, prot: '9g' },
        { title: 'Grilled Vegetable Sandwich', items: ['Triple-layer Veg Cheese Sandwich', 'Potato Wafers', 'Cold Coffee / Hot Tea'], diet: 'Veg', cal: 360, prot: '11g' },
        { title: 'Kolkata Kathi Roll / Paneer Roll', items: ['Flaky Paratha Roll with Spiced Paneer & Peppers', 'Mint Yogurt Dip', 'Hot Chai'], diet: 'Veg', cal: 380, prot: '13g', special: true },
        { title: 'Crispy Vada Pav & Fried Chilli', items: ['Batata Vada in Soft Pav (2)', 'Dry Garlic Chutney', 'Sweet Cutting Chai'], diet: 'Veg', cal: 350, prot: '7g' },
        { title: 'Maggi Noodle Bowl & Veg Cutlet', items: ['Cheesy Veggie Maggi', 'Crispy Beetroot Cutlet (1)', 'Iced Lemon Tea'], diet: 'Veg', cal: 330, prot: '8g' },
      ],
    },
    dinner: {
      label: 'Dinner',
      time: '08:00 PM - 10:00 PM',
      cutoff: '07:00 PM',
      options: [
        { title: 'Paneer Lababdar & Kashmiri Dal', items: ['Paneer Lababdar', 'Maa Ki Dal (Slow-cooked black lentils)', 'Steamed Rice', 'Garlic Naan / Tawa Roti (3)', 'Sewaiyan Kheer'], diet: 'Veg', cal: 660, prot: '23g', special: true },
        { title: 'Homestyle Rajma & Mix Veg Sabzi', items: ['Dehradun Rajma Gravy', 'Aloo Gobi Matar', 'Brown/White Steamed Rice', 'Hot Phulkas (4)', 'Sirka Onions'], diet: 'Veg', cal: 580, prot: '20g' },
        { title: 'Aloo Palak & Chana Dal Fry', items: ['Desi Ghee Aloo Palak', 'Chana Dal Tadka', 'Jeera Rice', 'Multigrain Rotis (3)', 'Papad & Pickle'], diet: 'Veg', cal: 540, prot: '18g' },
        { title: 'Mutter Paneer & Tandoori Roti', items: ['Mutter Paneer Gravy', 'Yellow Moong Dal', 'Peas Pulao', 'Tandoori Rotis (3)', 'Fruit Custard'], diet: 'Veg', cal: 630, prot: '22g', special: true },
        { title: 'South Indian Lemon Rice & Korma', items: ['Zesty Lemon Rice', 'Veg Kurma with Coconut Gravy', 'Curd Rice with Pomegranate', 'Fried Appalam'], diet: 'Veg', cal: 560, prot: '14g' },
        { title: 'Veg Kolhapuri & Dal Panchmel', items: ['Spicy Veg Kolhapuri', 'Panchmel Dal (5 lentils)', 'Steamed Basmati Rice', 'Bajra/Wheat Rotis', 'Jaggery'], diet: 'Veg', cal: 610, prot: '19g' },
        { title: 'Paneer Tikka Masala & Biryani Rice', items: ['Smoky Paneer Tikka Masala', 'Dal Makhani', 'Biryani Rice', 'Butter Roti (3)', 'Rasgulla (1)'], diet: 'Veg', cal: 710, prot: '25g', special: true },
      ],
    },
  };

  const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
  for (let offset = -4; offset <= 4; offset++) {
    const dateStr = getIsoDate(offset);
    const dayOfWeek = (new Date(dateStr).getDay() + 7) % 7; // 0: Sun ... 6: Sat

    for (const slot of slots) {
      const template = mealTemplates[slot];
      const opt = template.options[dayOfWeek % template.options.length];
      menus.push({
        id: `${dateStr}_${slot}`,
        date: dateStr,
        slot,
        slotLabel: template.label,
        timeWindow: template.time,
        cutoffTime: template.cutoff,
        title: opt.title,
        items: opt.items,
        dietType: opt.diet,
        calories: opt.cal,
        protein: opt.prot,
        chefSpecial: opt.special,
      });
    }
  }

  return menus;
}

// Generate realistic past RSVPs & ratings & waste logs
function seedRSVPs(users: User[]): MealRSVP[] {
  const rsvps: MealRSVP[] = [];
  const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const students = users.filter((u) => u.role === 'student');

  for (let offset = -4; offset <= 2; offset++) {
    const dateStr = getIsoDate(offset);
    const isWeekend = [0, 6].includes(new Date(dateStr).getDay());

    for (const student of students) {
      for (const slot of slots) {
        // Weekend breakfast & evening snacks usually have higher skip rates
        let skipChance = 0.15;
        if (isWeekend && slot === 'breakfast') skipChance = 0.55;
        if (isWeekend && slot === 'dinner') skipChance = 0.35;
        if (slot === 'snacks') skipChance = 0.25;

        // Custom student biases for realism:
        if (student.name === 'Vikramaditya Rao' && slot === 'breakfast') skipChance = 0.8;
        if (student.name === 'Diya Sen' && slot === 'snacks') skipChance = 0.6;

        // Determine deterministic pseudo-random status based on date+student+slot
        const hash = (dateStr + student.id + slot).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const rand = (hash % 100) / 100;
        const status = rand < skipChance ? 'skipping' : 'attending';

        rsvps.push({
          id: `rsvp_${dateStr}_${student.id}_${slot}`,
          userId: student.id,
          userEmail: student.email,
          userName: student.name,
          date: dateStr,
          slot,
          status,
          updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        });
      }
    }
  }
  return rsvps;
}

function seedRatings(): FoodRating[] {
  return [
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
      id: 'rate_5',
      userId: 'usr_std_5',
      userName: 'Kabir Mehta',
      userEmail: 'kabir.mehta@campus.edu',
      dishName: 'Kolkata Kathi Roll',
      mealSlot: 'snacks',
      rating: 5,
      tags: ['Crispy', 'Delicious', 'Great Portion'],
      comment: 'Loved the roll! Crispy flaky paratha with succulent paneer cubes.',
      date: getIsoDate(-2),
      createdAt: new Date(Date.now() - 180000000).toISOString(),
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
    {
      id: 'rate_7',
      userId: 'usr_std_7',
      userName: 'Vikramaditya Rao',
      userEmail: 'vikram.rao@campus.edu',
      dishName: 'Hyderabadi Veg Biryani',
      mealSlot: 'lunch',
      rating: 5,
      tags: ['Aromatic', 'Delicious', 'Perfect Spice'],
      comment: 'Proper fragrant basmati long grain rice and fried onions. 10/10.',
      date: getIsoDate(-2),
      createdAt: new Date(Date.now() - 170000000).toISOString(),
    },
    {
      id: 'rate_8',
      userId: 'usr_std_8',
      userName: 'Sneha Deshmukh',
      userEmail: 'sneha.deshmukh@campus.edu',
      dishName: 'Aloo Paratha',
      mealSlot: 'breakfast',
      rating: 4,
      tags: ['Generous Filling', 'Hot'],
      comment: 'Nice crispy parathas, dahi was fresh and cold.',
      date: getIsoDate(-1),
      createdAt: new Date(Date.now() - 95000000).toISOString(),
    },
    {
      id: 'rate_9',
      userId: 'usr_std_1',
      userName: 'Aarav Sharma',
      userEmail: 'aarav.sharma@campus.edu',
      dishName: 'Karela Masala',
      mealSlot: 'dinner',
      rating: 2,
      tags: ['Too Bitter', 'Burnt', 'Small Portion'],
      comment: 'Too bitter and pieces were burnt around the edges.',
      date: getIsoDate(-4),
      createdAt: new Date(Date.now() - 340000000).toISOString(),
    },
    {
      id: 'rate_10',
      userId: 'usr_std_3',
      userName: 'Rohan Gupta',
      userEmail: 'rohan.gupta@campus.edu',
      dishName: 'Samosa & Chai',
      mealSlot: 'snacks',
      rating: 5,
      tags: ['Crispy', 'Hot', 'Great Chai'],
      comment: 'Best snack ever after 4 hours of lab sessions!',
      date: getIsoDate(-1),
      createdAt: new Date(Date.now() - 88000000).toISOString(),
    },
    {
      id: 'rate_11',
      userId: 'usr_std_2',
      userName: 'Priya Patel',
      userEmail: 'priya.patel@campus.edu',
      dishName: 'Tinda Sabzi',
      mealSlot: 'lunch',
      rating: 1,
      tags: ['Watery', 'Bland', 'Cold'],
      comment: 'Tasteless watery gravy, nobody wanted second helpings.',
      date: getIsoDate(-4),
      createdAt: new Date(Date.now() - 350000000).toISOString(),
    },
    {
      id: 'rate_12',
      userId: 'usr_std_4',
      userName: 'Ananya Singh',
      userEmail: 'ananya.singh@campus.edu',
      dishName: 'Gulab Jamun',
      mealSlot: 'lunch',
      rating: 5,
      tags: ['Soft', 'Sweet', 'Delicious'],
      comment: 'Melt-in-mouth warm gulab jamuns. We need this twice a week!',
      date: getIsoDate(-1),
      createdAt: new Date(Date.now() - 85000000).toISOString(),
    },
  ];
}

function seedWasteLogs(): WasteLog[] {
  return [
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
      actionTaken: '33 students skipped dinner for weekend mall outing without RSVPing early. Surplus rajma chilled hygienically for morning rajma paratha stuffing.',
      loggedBy: 'Kavita Sundaram',
      loggedAt: new Date(Date.now() - 160000000).toISOString(),
    },
    {
      id: 'wlog_3',
      date: getIsoDate(-3),
      slot: 'breakfast',
      mainDish: 'Rava Upma & Chutney',
      cookedKg: 45.0,
      plannedPortions: 160,
      actualEaters: 110,
      eatenKg: 31.0,
      leftoverKg: 14.0,
      disposal: 'composted',
      wasteReason: 'unpopular_dish',
      actionTaken: 'High negative student sentiment for dry Upma. Remaining 14 kg transferred to campus organic vermicompost pit.',
      loggedBy: 'Chef Rameshwar Verma',
      loggedAt: new Date(Date.now() - 240000000).toISOString(),
    },
    {
      id: 'wlog_4',
      date: getIsoDate(-3),
      slot: 'dinner',
      mainDish: 'Lauki Kofta & Phulkas',
      cookedKg: 65.0,
      plannedPortions: 170,
      actualEaters: 125,
      eatenKg: 48.0,
      leftoverKg: 17.0,
      disposal: 'composted',
      wasteReason: 'unpopular_dish',
      actionTaken: 'Recipe poorly received. Chef council decided to replace Lauki with Paneer Bhurji in future rotations.',
      loggedBy: 'Suresh Nambiar',
      loggedAt: new Date(Date.now() - 230000000).toISOString(),
    },
    {
      id: 'wlog_5',
      date: getIsoDate(-4),
      slot: 'lunch',
      mainDish: 'Chole Bhature',
      cookedKg: 90.0,
      plannedPortions: 190,
      actualEaters: 198,
      eatenKg: 89.5,
      leftoverKg: 0.5,
      disposal: 'donated_shelter',
      wasteReason: 'accurate_prep',
      actionTaken: 'Near zero waste (0.5 kg). High student turnout due to favorite menu alert.',
      loggedBy: 'Chef Rameshwar Verma',
      loggedAt: new Date(Date.now() - 320000000).toISOString(),
    },
  ];
}

function seedNotifications(): AppNotification[] {
  return [
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
    {
      id: 'notif_3',
      targetRole: 'all',
      title: '🌱 Campus Milestone: 384 kg Food Saved!',
      message: 'By submitting your meal choices in advance, our hostel prevented 384 kg of food waste this month, saving 920 kg of carbon emissions!',
      type: 'waste_achievement',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      readBy: ['usr_std_1', 'usr_std_2', 'usr_adm_1'],
    },
  ];
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Verify core arrays exist
        if (parsed.users && parsed.menus && parsed.rsvps) {
          // Merge any missing menus for today if needed
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse mess_db.json, re-initializing seed data', err);
      }
    }

    const freshUsers = INITIAL_USERS;
    const freshMenus = seedMenus();
    const freshRSVPs = seedRSVPs(freshUsers);
    const freshRatings = seedRatings();
    const freshWasteLogs = seedWasteLogs();
    const freshNotifs = seedNotifications();

    const initialDb: DatabaseSchema = {
      users: freshUsers,
      menus: freshMenus,
      rsvps: freshRSVPs,
      ratings: freshRatings,
      wasteLogs: freshWasteLogs,
      notifications: freshNotifs,
    };

    this.save(initialDb);
    return initialDb;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to mess_db.json', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Partial<User> & { email: string; name: string; role: 'student' | 'admin' }): User {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar || (userData.role === 'admin'
        ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
      hostelRoom: userData.hostelRoom || (userData.role === 'student' ? 'Aryabhatta Hostel' : undefined),
      department: userData.department || (userData.role === 'admin' ? 'Mess Staff' : 'Student'),
      dietaryPref: userData.dietaryPref || 'Veg',
      notificationSettings: userData.notificationSettings || {
        breakfastReminder: true,
        lunchReminder: true,
        snacksReminder: true,
        dinnerReminder: true,
        pushEnabled: true,
      },
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUserSettings(userId: string, settings: User['notificationSettings'], dietaryPref?: User['dietaryPref']): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    user.notificationSettings = { ...user.notificationSettings, ...settings };
    if (dietaryPref) user.dietaryPref = dietaryPref;
    this.save();
    return user;
  }

  // Menus
  getMenus(date?: string): MenuItem[] {
    if (date) {
      return this.data.menus.filter((m) => m.date === date);
    }
    return this.data.menus;
  }

  getMenuByDateAndSlot(date: string, slot: MealSlot): MenuItem | undefined {
    return this.data.menus.find((m) => m.date === date && m.slot === slot);
  }

  // RSVPs
  getRSVPs(date?: string, slot?: MealSlot): MealRSVP[] {
    let list = this.data.rsvps;
    if (date) list = list.filter((r) => r.date === date);
    if (slot) list = list.filter((r) => r.slot === slot);
    return list;
  }

  getUserRSVPs(userId: string, date?: string): MealRSVP[] {
    let list = this.data.rsvps.filter((r) => r.userId === userId);
    if (date) list = list.filter((r) => r.date === date);
    return list;
  }

  setRSVP(userId: string, date: string, slot: MealSlot, status: 'attending' | 'skipping', dietaryNote?: string): MealRSVP {
    const user = this.getUserById(userId);
    const existingIndex = this.data.rsvps.findIndex((r) => r.userId === userId && r.date === date && r.slot === slot);

    const rsvp: MealRSVP = {
      id: existingIndex >= 0 ? this.data.rsvps[existingIndex].id : `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userEmail: user ? user.email : '',
      userName: user ? user.name : 'Unknown User',
      date,
      slot,
      status,
      dietaryNote: dietaryNote || (existingIndex >= 0 ? this.data.rsvps[existingIndex].dietaryNote : undefined),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.rsvps[existingIndex] = rsvp;
    } else {
      this.data.rsvps.push(rsvp);
    }

    this.save();
    return rsvp;
  }

  batchSetRSVP(userId: string, date: string, status: 'attending' | 'skipping'): MealRSVP[] {
    const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const results: MealRSVP[] = [];
    for (const slot of slots) {
      results.push(this.setRSVP(userId, date, slot, status));
    }
    return results;
  }

  // Ratings
  getRatings(): FoodRating[] {
    return this.data.ratings;
  }

  addRating(ratingData: Omit<FoodRating, 'id' | 'createdAt'>): FoodRating {
    const newRating: FoodRating = {
      ...ratingData,
      id: `rate_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.ratings.unshift(newRating);
    this.save();
    return newRating;
  }

  // Waste Logs
  getWasteLogs(): WasteLog[] {
    return this.data.wasteLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addWasteLog(logData: Omit<WasteLog, 'id' | 'loggedAt'>): WasteLog {
    const newLog: WasteLog = {
      ...logData,
      id: `wlog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      loggedAt: new Date().toISOString(),
    };
    this.data.wasteLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  // Notifications
  getNotifications(userId?: string): AppNotification[] {
    const user = userId ? this.getUserById(userId) : undefined;
    return this.data.notifications
      .filter((n) => {
        if (!userId) return true;
        if (n.targetUserId && n.targetUserId !== userId) return false;
        if (n.targetRole && n.targetRole !== 'all' && user && n.targetRole !== user.role) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(notifData: Omit<AppNotification, 'id' | 'createdAt' | 'readBy'>): AppNotification {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      readBy: [],
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationRead(notifId: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === notifId);
    if (notif && !notif.readBy.includes(userId)) {
      notif.readBy.push(userId);
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new Database();
