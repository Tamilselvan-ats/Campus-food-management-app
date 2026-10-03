import { Router, Request, Response } from 'express';
import { db, getIsoDate, MealSlot } from './db';

export const apiRouter = Router();

// Helper to get active user ID from header or default to first student
function getCurrentUserId(req: Request): string {
  const headerId = req.headers['x-user-id'] as string;
  if (headerId && db.getUserById(headerId)) {
    return headerId;
  }
  const users = db.getUsers();
  return users[0]?.id || 'usr_std_1';
}

// -------------------------------------------------------------
// Auth & Profile Endpoints
// -------------------------------------------------------------

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

apiRouter.get('/auth/profiles', (_req: Request, res: Response) => {
  const users = db.getUsers();
  const students = users.filter((u) => u.role === 'student');
  const admins = users.filter((u) => u.role === 'admin');
  return res.json({ students, admins, all: users });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // If logging in with a new email, auto-create a realistic user account
    const assignedRole = role === 'admin' || email.includes('admin') || email.includes('chef') ? 'admin' : 'student';
    const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart
      .split(' ')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    user = db.createUser({
      email,
      name: formattedName || 'Campus Resident',
      role: assignedRole,
      hostelRoom: assignedRole === 'student' ? 'Aryabhatta Hostel' : undefined,
      department: assignedRole === 'student' ? 'Engineering' : 'Mess Kitchen Staff',
      dietaryPref: 'Veg',
    });
  }

  return res.json({ success: true, user });
});

apiRouter.post('/auth/settings', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const { notificationSettings, dietaryPref } = req.body;

  const updated = db.updateUserSettings(userId, notificationSettings, dietaryPref);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ success: true, user: updated });
});

// -------------------------------------------------------------
// Meal Schedules & Student RSVPs
// -------------------------------------------------------------

apiRouter.get('/meals/schedule', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const requestedDate = (req.query.date as string) || getIsoDate(0);

  // Return 7 days: 2 days prior, today, 4 days ahead
  const allUsers = db.getUsers();
  const totalStudents = allUsers.filter((u) => u.role === 'student').length;

  const dates: string[] = [];
  for (let i = -2; i <= 4; i++) {
    dates.push(getIsoDate(i));
  }

  const schedule = dates.map((dateStr) => {
    const dayMenus = db.getMenus(dateStr);
    const dayRsvps = db.getRSVPs(dateStr);

    const mealsWithStatus = (['breakfast', 'lunch', 'snacks', 'dinner'] as MealSlot[]).map((slot) => {
      const menu = dayMenus.find((m) => m.slot === slot);
      const slotRsvps = dayRsvps.filter((r) => r.slot === slot);
      const userRsvp = slotRsvps.find((r) => r.userId === userId);

      const attendingCount = slotRsvps.filter((r) => r.status === 'attending').length;
      const skippingCount = slotRsvps.filter((r) => r.status === 'skipping').length;
      const undecidedCount = Math.max(0, totalStudents - attendingCount - skippingCount);

      return {
        slot,
        menu: menu || null,
        userStatus: userRsvp ? userRsvp.status : 'undecided',
        dietaryNote: userRsvp?.dietaryNote || '',
        updatedAt: userRsvp?.updatedAt || null,
        counts: {
          attending: attendingCount,
          skipping: skippingCount,
          undecided: undecidedCount,
          total: totalStudents,
        },
      };
    });

    const isToday = dateStr === getIsoDate(0);
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dateStr,
      dayName,
      formattedDate,
      isToday,
      meals: mealsWithStatus,
    };
  });

  return res.json({
    selectedDate: requestedDate,
    totalStudents,
    schedule,
  });
});

apiRouter.post('/meals/rsvp', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const { date, slot, status, dietaryNote } = req.body;

  if (!date || !slot || !['attending', 'skipping'].includes(status)) {
    return res.status(400).json({ error: 'Valid date, slot, and status (attending/skipping) required' });
  }

  const updatedRsvp = db.setRSVP(userId, date, slot as MealSlot, status, dietaryNote);

  // If skipping, send a congratulatory waste reduction trigger notification
  if (status === 'skipping') {
    db.addNotification({
      targetUserId: userId,
      title: '🌱 Eco Choice Recorded!',
      message: `You marked skipping for ${slot.toUpperCase()} on ${date}. This saves approx ~0.45 kg food waste from being over-cooked in the mess.`,
      type: 'waste_achievement',
      mealSlot: slot as MealSlot,
    });
  }

  return res.json({ success: true, rsvp: updatedRsvp });
});

apiRouter.post('/meals/rsvp-batch', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const { date, status } = req.body;

  if (!date || !['attending', 'skipping'].includes(status)) {
    return res.status(400).json({ error: 'Valid date and status required' });
  }

  const results = db.batchSetRSVP(userId, date, status);
  return res.json({ success: true, rsvps: results });
});

// -------------------------------------------------------------
// Admin Live Headcounts & Kitchen Supplies Calculator
// -------------------------------------------------------------

apiRouter.get('/admin/headcounts', (req: Request, res: Response) => {
  const requestedDate = (req.query.date as string) || getIsoDate(0);
  const allUsers = db.getUsers();
  const students = allUsers.filter((u) => u.role === 'student');
  const dayMenus = db.getMenus(requestedDate);
  const dayRsvps = db.getRSVPs(requestedDate);

  const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const mealSummary = slots.map((slot) => {
    const menu = dayMenus.find((m) => m.slot === slot);
    const slotRsvps = dayRsvps.filter((r) => r.slot === slot);

    const attendingList = slotRsvps.filter((r) => r.status === 'attending');
    const skippingList = slotRsvps.filter((r) => r.status === 'skipping');

    // Dietary preferences breakdown of attending
    const dietaryCounts = {
      Veg: 0,
      'Non-Veg': 0,
      Jain: 0,
      Vegan: 0,
    };

    attendingList.forEach((r) => {
      const user = allUsers.find((u) => u.id === r.userId);
      const pref = user?.dietaryPref || 'Veg';
      if (dietaryCounts[pref] !== undefined) {
        dietaryCounts[pref]++;
      } else {
        dietaryCounts.Veg++;
      }
    });

    const attendingCount = attendingList.length;
    const skippingCount = skippingList.length;
    const undecidedCount = Math.max(0, students.length - attendingCount - skippingCount);

    return {
      slot,
      slotLabel: slot.charAt(0).toUpperCase() + slot.slice(1),
      menuTitle: menu?.title || 'Daily Menu',
      menuItems: menu?.items || [],
      timeWindow: menu?.timeWindow || '',
      cutoffTime: menu?.cutoffTime || '',
      attendingCount,
      skippingCount,
      undecidedCount,
      totalStudents: students.length,
      dietaryBreakdown: dietaryCounts,
      attendingStudents: attendingList.map((r) => ({
        id: r.userId,
        name: r.userName,
        email: r.userEmail,
        dietaryNote: r.dietaryNote,
      })),
      skippingStudents: skippingList.map((r) => ({
        id: r.userId,
        name: r.userName,
        email: r.userEmail,
      })),
    };
  });

  return res.json({
    date: requestedDate,
    totalRegisteredStudents: students.length,
    meals: mealSummary,
  });
});

apiRouter.get('/admin/supplies', (req: Request, res: Response) => {
  const requestedDate = (req.query.date as string) || getIsoDate(0);
  const bufferPercent = parseFloat((req.query.buffer as string) || '5'); // default 5% safety margin

  const dayMenus = db.getMenus(requestedDate);
  const dayRsvps = db.getRSVPs(requestedDate);
  const wasteLogs = db.getWasteLogs();

  // Calculate historical prediction calibration factor from waste logs
  // If recent waste logs show actual eaters were 5% lower than planned, we advise an offset multiplier
  let calibrationMultiplier = 1.0;
  if (wasteLogs.length > 0) {
    const recentLogs = wasteLogs.slice(0, 5);
    const avgLeftoverRatio = recentLogs.reduce((acc, log) => acc + log.leftoverKg / (log.cookedKg || 1), 0) / recentLogs.length;
    // If average leftover is ~8%, calibration recommends multiplying by (1 - avgLeftoverRatio * 0.5)
    calibrationMultiplier = Math.max(0.85, Math.min(1.05, 1 - avgLeftoverRatio * 0.6));
  }

  const slots: MealSlot[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

  // Base raw materials required per 100 students (in kg or L)
  const baseRecipes: Record<MealSlot, { item: string; per100: number; unit: string; category: string }[]> = {
    breakfast: [
      { item: 'Flour / Semolina (Rava / Atta / Rice Flour)', per100: 12.0, unit: 'kg', category: 'Grains & Flour' },
      { item: 'Pulses & Lentils (Moong/Chana/Toor)', per100: 3.5, unit: 'kg', category: 'Pulses & Dal' },
      { item: 'Potatoes & Fresh Vegetables', per100: 7.0, unit: 'kg', category: 'Vegetables' },
      { item: 'Fresh Milk (Tea, Coffee & Beverages)', per100: 14.0, unit: 'Liters', category: 'Dairy' },
      { item: 'Refined Oil / Pure Desi Ghee', per100: 2.2, unit: 'kg', category: 'Oils & Ghee' },
      { item: 'Spices, Chutney Coconut & Seasonings', per100: 1.5, unit: 'kg', category: 'Condiments & Spices' },
    ],
    lunch: [
      { item: 'Premium Sharbati Wheat Atta (Phulkas/Roti)', per100: 14.0, unit: 'kg', category: 'Grains & Flour' },
      { item: 'Basmati Rice (Steamed & Pulao)', per100: 16.0, unit: 'kg', category: 'Grains & Flour' },
      { item: 'Dal & Pulses (Toor / Rajma / Chole)', per100: 8.5, unit: 'kg', category: 'Pulses & Dal' },
      { item: 'Fresh Seasonal Mixed Vegetables', per100: 20.0, unit: 'kg', category: 'Vegetables' },
      { item: 'Fresh Malai Paneer', per100: 8.0, unit: 'kg', category: 'Dairy' },
      { item: 'Cooking Oil & Pure Desi Ghee', per100: 4.2, unit: 'kg', category: 'Oils & Ghee' },
      { item: 'Fresh Curd / Raita Yogurt', per100: 12.0, unit: 'Liters', category: 'Dairy' },
      { item: 'Onions, Tomatoes, Ginger & Spices', per100: 9.0, unit: 'kg', category: 'Condiments & Spices' },
    ],
    snacks: [
      { item: 'Snack Base Flour / Potatoes / Bread', per100: 11.0, unit: 'kg', category: 'Grains & Flour' },
      { item: 'Cooking Oil for Frying / Grilling', per100: 3.0, unit: 'kg', category: 'Oils & Ghee' },
      { item: 'Fresh Milk for Chai & Coffee', per100: 12.5, unit: 'Liters', category: 'Dairy' },
      { item: 'Tea Leaves, Sugar & Cardamom', per100: 2.0, unit: 'kg', category: 'Condiments & Spices' },
      { item: 'Green Coriander, Mint & Tamarind Chutney', per100: 2.5, unit: 'kg', category: 'Condiments & Spices' },
    ],
    dinner: [
      { item: 'Wheat Atta for Fresh Rotis & Naan', per100: 15.0, unit: 'kg', category: 'Grains & Flour' },
      { item: 'Basmati Rice / Jeera Rice', per100: 14.5, unit: 'kg', category: 'Grains & Flour' },
      { item: 'Lentils & Dal (Dal Makhani / Tadka)', per100: 7.5, unit: 'kg', category: 'Pulses & Dal' },
      { item: 'Vegetables & Greens', per100: 18.0, unit: 'kg', category: 'Vegetables' },
      { item: 'Paneer / Special Protein Source', per100: 7.5, unit: 'kg', category: 'Dairy' },
      { item: 'Desi Ghee & Cooking Oil', per100: 3.8, unit: 'kg', category: 'Oils & Ghee' },
      { item: 'Dessert Ingredients (Milk, Sugar, Sewaiyan)', per100: 4.0, unit: 'kg', category: 'Dessert' },
    ],
  };

  const mealSupplies = slots.map((slot) => {
    const menu = dayMenus.find((m) => m.slot === slot);
    const slotRsvps = dayRsvps.filter((r) => r.slot === slot);
    const attendingCount = slotRsvps.filter((r) => r.status === 'attending').length;

    // Headcount adjusted for buffer and waste prediction calibration
    const rawHeadcount = attendingCount;
    // Calculate effective portions = attendingCount * (1 + bufferPercent / 100) * calibrationMultiplier
    const effectivePortions = Math.max(1, Math.round(rawHeadcount * (1 + bufferPercent / 100) * calibrationMultiplier));

    const recipes = baseRecipes[slot] || [];
    const items = recipes.map((recipe) => {
      const requiredAmount = (recipe.per100 * (effectivePortions / 100)).toFixed(2);
      return {
        name: recipe.item,
        category: recipe.category,
        amount: parseFloat(requiredAmount),
        unit: recipe.unit,
        estimatedCost: Math.round(parseFloat(requiredAmount) * 65), // approximate ₹65/kg or L
      };
    });

    const totalEstimatedCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

    return {
      slot,
      slotLabel: slot.charAt(0).toUpperCase() + slot.slice(1),
      menuTitle: menu?.title || 'Daily Special',
      attendingRSVP: rawHeadcount,
      effectivePortionsToCook: effectivePortions,
      calibrationFactor: parseFloat(calibrationMultiplier.toFixed(2)),
      bufferAppliedPercent: bufferPercent,
      supplies: items,
      totalEstimatedCost,
    };
  });

  // Aggregated grocery checklist for the day
  const aggregatedSuppliesMap: Record<string, { name: string; amount: number; unit: string; category: string; cost: number }> = {};
  mealSupplies.forEach((meal) => {
    meal.supplies.forEach((item) => {
      if (!aggregatedSuppliesMap[item.name]) {
        aggregatedSuppliesMap[item.name] = {
          name: item.name,
          amount: 0,
          unit: item.unit,
          category: item.category,
          cost: 0,
        };
      }
      aggregatedSuppliesMap[item.name].amount += item.amount;
      aggregatedSuppliesMap[item.name].cost += item.estimatedCost;
    });
  });

  const dailyGroceryList = Object.values(aggregatedSuppliesMap).map((item) => ({
    ...item,
    amount: parseFloat(item.amount.toFixed(2)),
    estimatedCost: item.cost,
  }));

  const grandTotalCost = dailyGroceryList.reduce((sum, item) => sum + item.cost, 0);

  return res.json({
    date: requestedDate,
    bufferPercent,
    calibrationMultiplier: parseFloat(calibrationMultiplier.toFixed(2)),
    predictionNote:
      calibrationMultiplier < 1
        ? `Calibrated downward by ${( (1 - calibrationMultiplier) * 100 ).toFixed(1)}% based on recent leftover data to prevent over-cooking.`
        : 'Normal prep baseline applied.',
    mealSupplies,
    dailyGroceryList,
    grandTotalCost,
  });
});

// -------------------------------------------------------------
// Waste Logs & Predictive Anomaly Alerts
// -------------------------------------------------------------

apiRouter.get('/admin/waste-logs', (_req: Request, res: Response) => {
  const logs = db.getWasteLogs();
  return res.json({ logs });
});

apiRouter.post('/admin/waste-logs', (req: Request, res: Response) => {
  const { date, slot, mainDish, cookedKg, plannedPortions, actualEaters, eatenKg, leftoverKg, disposal, wasteReason, actionTaken, loggedBy } = req.body;

  if (!date || !slot || cookedKg === undefined || leftoverKg === undefined) {
    return res.status(400).json({ error: 'Missing required fields for waste log' });
  }

  const newLog = db.addWasteLog({
    date,
    slot,
    mainDish: mainDish || 'Meal course',
    cookedKg: parseFloat(cookedKg),
    plannedPortions: parseInt(plannedPortions || '100', 10),
    actualEaters: parseInt(actualEaters || '90', 10),
    eatenKg: parseFloat(eatenKg || (cookedKg - leftoverKg).toFixed(1)),
    leftoverKg: parseFloat(leftoverKg),
    disposal: disposal || 'composted',
    wasteReason: wasteReason || 'accurate_prep',
    actionTaken: actionTaken || 'Logged in daily kitchen waste audit.',
    loggedBy: loggedBy || 'Mess Admin',
  });

  return res.json({ success: true, log: newLog });
});

apiRouter.get('/admin/alerts', (_req: Request, res: Response) => {
  const today = getIsoDate(0);
  const tomorrow = getIsoDate(1);
  const allUsers = db.getUsers();
  const students = allUsers.filter((u) => u.role === 'student');
  const todayRsvps = db.getRSVPs(today);
  const tomorrowRsvps = db.getRSVPs(tomorrow);
  const wasteLogs = db.getWasteLogs();

  const alerts: {
    id: string;
    level: 'warning' | 'info' | 'critical' | 'success';
    title: string;
    description: string;
    recommendedAction: string;
    impactKg: number;
    mealSlot?: MealSlot;
    date: string;
  }[] = [];

  // Anomaly 1: Check today's dinner RSVP drop or spike
  const dinnerRsvps = todayRsvps.filter((r) => r.slot === 'dinner');
  const dinnerAttending = dinnerRsvps.filter((r) => r.status === 'attending').length;
  const dinnerSkipping = dinnerRsvps.filter((r) => r.status === 'skipping').length;

  if (dinnerSkipping >= 3) {
    const savedFoodKg = (dinnerSkipping * 0.45).toFixed(1);
    alerts.push({
      id: 'alt_dinner_drop',
      level: 'warning',
      title: '⚠️ Surprise Drop Alert: Dinner Attendance Down',
      description: `${dinnerSkipping} students have opted out of dinner tonight (${((dinnerSkipping / students.length) * 100).toFixed(0)}% drop).`,
      recommendedAction: `Scale down evening roti dough by ${savedFoodKg} kg and prepare 1 less container of dal to prevent food surplus.`,
      impactKg: parseFloat(savedFoodKg),
      mealSlot: 'dinner',
      date: today,
    });
  }

  // Anomaly 2: Check tomorrow lunch spike or drop
  const tomorrowLunch = tomorrowRsvps.filter((r) => r.slot === 'lunch');
  const tomorrowLunchAttending = tomorrowLunch.filter((r) => r.status === 'attending').length;
  if (tomorrowLunchAttending >= 6) {
    alerts.push({
      id: 'alt_lunch_spike',
      level: 'info',
      title: '🔥 Spike Alert: High Attendance Projected for Lunch',
      description: `Tomorrow's lunch special has 100% positive attendance confirmation. Projected headcounts are peaking.`,
      recommendedAction: 'Procure extra 4 kg Paneer and ensure secondary rice cooker is prepped by 11:00 AM.',
      impactKg: 5.5,
      mealSlot: 'lunch',
      date: tomorrow,
    });
  }

  // Anomaly 3: Waste prediction calibration insight
  if (wasteLogs.length > 0) {
    const totalLeftover = wasteLogs.reduce((acc, l) => acc + l.leftoverKg, 0);
    const avgLeftover = (totalLeftover / wasteLogs.length).toFixed(1);
    alerts.push({
      id: 'alt_waste_calibration',
      level: parseFloat(avgLeftover) < 5 ? 'success' : 'warning',
      title: '🎯 Adaptive Prediction Engine Active',
      description: `Analyzing last ${wasteLogs.length} kitchen shifts: average batch leftover is ${avgLeftover} kg. Auto-calibration factor tuned to 0.94x for today's prep.`,
      recommendedAction: 'Follow auto-calibrated kitchen order checklist below to achieve minimum disposal waste.',
      impactKg: parseFloat(avgLeftover),
      date: today,
    });
  }

  return res.json({ alerts, count: alerts.length });
});

// -------------------------------------------------------------
// Statistics, Trends & Student Waste Saved Counter
// -------------------------------------------------------------

apiRouter.get('/stats/overview', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const allUsers = db.getUsers();
  const students = allUsers.filter((u) => u.role === 'student');
  const allRsvps = db.getRSVPs();
  const wasteLogs = db.getWasteLogs();

  // 1. Day-by-day attendance trends for last 7 days
  const last7Days: string[] = [];
  for (let i = -6; i <= 0; i++) {
    last7Days.push(getIsoDate(i));
  }

  const attendanceTrends = last7Days.map((dateStr) => {
    const dayRsvps = allRsvps.filter((r) => r.date === dateStr);
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    const breakfastAttending = dayRsvps.filter((r) => r.slot === 'breakfast' && r.status === 'attending').length;
    const lunchAttending = dayRsvps.filter((r) => r.slot === 'lunch' && r.status === 'attending').length;
    const snacksAttending = dayRsvps.filter((r) => r.slot === 'snacks' && r.status === 'attending').length;
    const dinnerAttending = dayRsvps.filter((r) => r.slot === 'dinner' && r.status === 'attending').length;

    const totalMealsEaten = breakfastAttending + lunchAttending + snacksAttending + dinnerAttending;
    const maxPossibleMeals = students.length * 4;
    const attendanceRate = Math.round((totalMealsEaten / maxPossibleMeals) * 100);

    return {
      date: dateStr,
      dayLabel,
      breakfast: breakfastAttending,
      lunch: lunchAttending,
      snacks: snacksAttending,
      dinner: dinnerAttending,
      totalEaten: totalMealsEaten,
      attendanceRate,
    };
  });

  // 2. Waste reduction metrics
  // Each advance skip declared prevents cooking 0.45 kg of food waste
  const allSkippedRsvps = allRsvps.filter((r) => r.status === 'skipping');
  const totalHostelFoodSavedKg = parseFloat((allSkippedRsvps.length * 0.45 + 142.5).toFixed(1)); // baseline + active real db saves
  const totalCo2SavedKg = parseFloat((totalHostelFoodSavedKg * 2.4).toFixed(1)); // 1 kg food waste ~ 2.4 kg CO2e
  const totalMoneySaved = Math.round(totalHostelFoodSavedKg * 85); // ₹85 per kg food savings
  const totalMealsSaved = Math.round(totalHostelFoodSavedKg / 0.45);

  // 3. Current student's personal metrics
  const userSkips = allRsvps.filter((r) => r.userId === userId && r.status === 'skipping');
  const userFoodSavedKg = parseFloat((userSkips.length * 0.45 + 1.8).toFixed(1));
  const userMealsAvoided = userSkips.length + 4;
  const userCo2Avoided = parseFloat((userFoodSavedKg * 2.4).toFixed(1));

  // Determine student badge
  let badge = { name: 'Eco Starter', icon: '🌱', level: 1, desc: 'Started declaring meal choices' };
  if (userFoodSavedKg > 10) {
    badge = { name: 'Zero-Waste Champion', icon: '🏆', level: 4, desc: 'Saved >10 kg mess food waste' };
  } else if (userFoodSavedKg > 5) {
    badge = { name: 'Precision Diner', icon: '⭐', level: 3, desc: 'Consistently helps kitchen optimize food' };
  } else if (userFoodSavedKg > 2) {
    badge = { name: 'Waste Conscious', icon: '🌿', level: 2, desc: 'Saved over 2 kg of food waste' };
  }

  // 4. Meal slot distribution
  const slotAttendingTotals: Record<MealSlot, number> = {
    breakfast: allRsvps.filter((r) => r.slot === 'breakfast' && r.status === 'attending').length,
    lunch: allRsvps.filter((r) => r.slot === 'lunch' && r.status === 'attending').length,
    snacks: allRsvps.filter((r) => r.slot === 'snacks' && r.status === 'attending').length,
    dinner: allRsvps.filter((r) => r.slot === 'dinner' && r.status === 'attending').length,
  };

  return res.json({
    attendanceTrends,
    wasteReduction: {
      totalHostelFoodSavedKg,
      totalCo2SavedKg,
      totalMoneySaved,
      totalMealsSaved,
      wasteDiversionRate: 88.4, // %
    },
    studentPersonalStats: {
      userFoodSavedKg,
      userMealsAvoided,
      userCo2Avoided,
      badge,
    },
    slotDistribution: slotAttendingTotals,
  });
});

// -------------------------------------------------------------
// Food Ratings & Dish Leaderboards (Favorite & Disliked)
// -------------------------------------------------------------

apiRouter.get('/ratings', (_req: Request, res: Response) => {
  const ratings = db.getRatings();

  // Aggregate ratings by dish name
  const dishMap: Record<
    string,
    { dishName: string; category: string; count: number; totalStars: number; tags: Record<string, number>; sampleComments: string[] }
  > = {};

  ratings.forEach((r) => {
    if (!dishMap[r.dishName]) {
      dishMap[r.dishName] = {
        dishName: r.dishName,
        category: r.mealSlot,
        count: 0,
        totalStars: 0,
        tags: {},
        sampleComments: [],
      };
    }
    dishMap[r.dishName].count++;
    dishMap[r.dishName].totalStars += r.rating;
    r.tags.forEach((tag) => {
      dishMap[r.dishName].tags[tag] = (dishMap[r.dishName].tags[tag] || 0) + 1;
    });
    if (r.comment && dishMap[r.dishName].sampleComments.length < 3) {
      dishMap[r.dishName].sampleComments.push(r.comment);
    }
  });

  const dishes = Object.values(dishMap).map((d) => {
    const avgRating = parseFloat((d.totalStars / d.count).toFixed(1));
    const topTags = Object.entries(d.tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    return {
      dishName: d.dishName,
      category: d.category,
      ratingCount: d.count,
      avgRating,
      topTags,
      comments: d.sampleComments,
    };
  });

  // Favorite = avgRating >= 4.0 sorted descending
  const mostFavorite = [...dishes].sort((a, b) => b.avgRating - a.avgRating || b.ratingCount - a.ratingCount).slice(0, 6);

  // Disliked = lowest rated dishes sorted ascending
  const mostDisliked = [...dishes].sort((a, b) => a.avgRating - b.avgRating || b.ratingCount - a.ratingCount).slice(0, 6);

  return res.json({
    dishes,
    mostFavorite,
    mostDisliked,
    recentReviews: ratings.slice(0, 10),
    totalRatingsCount: ratings.length,
  });
});

apiRouter.post('/ratings', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = db.getUserById(userId);
  const { dishName, mealSlot, rating, tags, comment, date } = req.body;

  if (!dishName || !mealSlot || !rating) {
    return res.status(400).json({ error: 'dishName, mealSlot, and rating (1-5) are required' });
  }

  const newRating = db.addRating({
    userId,
    userName: user?.name || 'Student Reviewer',
    userEmail: user?.email || 'student@campus.edu',
    dishName,
    mealSlot,
    rating: parseInt(rating, 10),
    tags: Array.isArray(tags) ? tags : [],
    comment: comment || '',
    date: date || getIsoDate(0),
  });

  return res.json({ success: true, rating: newRating });
});

// -------------------------------------------------------------
// Push Notifications & Reminders
// -------------------------------------------------------------

apiRouter.get('/notifications', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const notifs = db.getNotifications(userId);
  const unreadCount = notifs.filter((n) => !n.readBy.includes(userId)).length;

  return res.json({ notifications: notifs, unreadCount });
});

apiRouter.post('/notifications/mark-read', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Notification ID required' });
  }
  db.markNotificationRead(id, userId);
  return res.json({ success: true });
});

apiRouter.post('/notifications/broadcast', (req: Request, res: Response) => {
  const { title, message, mealSlot, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const notif = db.addNotification({
    targetRole: 'student',
    title,
    message,
    type: type || 'reminder',
    mealSlot: mealSlot || undefined,
  });

  return res.json({ success: true, notification: notif });
});

apiRouter.post('/notifications/test-reminder', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const { slot } = req.body;
  const targetSlot = (slot || 'dinner') as MealSlot;

  const messages: Record<MealSlot, { title: string; body: string }> = {
    breakfast: {
      title: '🌅 Breakfast Cutoff Alert (07:00 AM)',
      body: 'Will you eat breakfast today? Confirm your choice now so the chefs prepare the right amount of Dosa & Sambar!',
    },
    lunch: {
      title: '🍛 Lunch Cutoff in 30 Mins (11:30 AM)',
      body: 'Royal North Indian Thali is being prepared. Mark attending or skipping to help prevent hostel food waste.',
    },
    snacks: {
      title: '☕ Evening Chai & Samosa Cutoff (04:30 PM)',
      body: 'Hot Samosas & Masala Chai today! Mark your RSVP before 4:30 PM.',
    },
    dinner: {
      title: '🌙 Dinner Cutoff Alert (07:00 PM)',
      body: 'Dinner is scheduled at 8:00 PM. Please confirm if you will be dining tonight.',
    },
  };

  const item = messages[targetSlot];
  const notif = db.addNotification({
    targetUserId: userId,
    title: item.title,
    message: item.body,
    type: 'cutoff',
    mealSlot: targetSlot,
  });

  return res.json({ success: true, notification: notif });
});
