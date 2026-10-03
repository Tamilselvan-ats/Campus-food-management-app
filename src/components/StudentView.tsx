import React, { useState } from 'react';
import { User, DaySchedule, MealSlot, StatsOverview, MenuItem } from '../types';
import {
  Utensils,
  Leaf,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Flame,
  Award,
  Calendar,
  AlertCircle,
  ThumbsUp,
  Star,
  Coffee,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { submitRSVP, submitBatchRSVP } from '../services/api';
import { fireEcoConfetti, triggerPushNotification, playNotificationSound } from '../services/notificationService';

interface StudentViewProps {
  currentUser: User;
  schedule: DaySchedule[];
  stats: StatsOverview | null;
  onRefresh: () => void;
  onOpenRateModal: (dishName: string, slot: MealSlot) => void;
}

const SLOT_ICONS: Record<MealSlot, React.ReactNode> = {
  breakfast: <Sun className="w-5 h-5 text-amber-400" />,
  lunch: <Utensils className="w-5 h-5 text-orange-400" />,
  snacks: <Coffee className="w-5 h-5 text-emerald-400" />,
  dinner: <Moon className="w-5 h-5 text-indigo-400" />,
};

export const StudentView: React.FC<StudentViewProps> = ({
  currentUser,
  schedule,
  stats,
  onRefresh,
  onOpenRateModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = schedule.find((d) => d.isToday);
    return today ? today.date : schedule[0]?.date || '';
  });

  const [dietaryNotes, setDietaryNotes] = useState<Record<string, string>>({});
  const [submittingSlot, setSubmittingSlot] = useState<string | null>(null);

  const activeDay = schedule.find((d) => d.date === selectedDate) || schedule[0];

  const handleRSVP = async (slot: MealSlot, status: 'attending' | 'skipping') => {
    if (!activeDay) return;
    try {
      setSubmittingSlot(slot);
      const note = dietaryNotes[`${activeDay.date}_${slot}`] || '';
      await submitRSVP(activeDay.date, slot, status, note);

      if (status === 'skipping') {
        fireEcoConfetti();
        playNotificationSound();
        triggerPushNotification(
          '🌱 Eco Skip Recorded!',
          `You opted out of ${slot.toUpperCase()} on ${activeDay.date}. Kitchen won't over-cook ~0.45 kg of food!`
        );
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSlot(null);
    }
  };

  const handleBatch = async (status: 'attending' | 'skipping') => {
    if (!activeDay) return;
    try {
      setSubmittingSlot('batch');
      await submitBatchRSVP(activeDay.date, status);
      if (status === 'skipping') {
        fireEcoConfetti();
        triggerPushNotification(
          '🌱 Zero Waste Hero!',
          `Marked day off on ${activeDay.date}. You saved 1.8 kg of kitchen prep waste!`
        );
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSlot(null);
    }
  };

  const personalWasteKg = stats?.studentPersonalStats.userFoodSavedKg || 3.6;
  const collectiveWasteKg = stats?.wasteReduction.totalHostelFoodSavedKg || 384;
  const co2AvoidedKg = stats?.wasteReduction.totalCo2SavedKg || 920;
  const badge = stats?.studentPersonalStats.badge || {
    name: 'Zero-Waste Champion',
    icon: '🏆',
    level: 3,
    desc: 'Top 10% food conservation hero',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero: Welcome & Student-Facing Waste Saved Counter */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950/40 border border-emerald-500/20 shadow-xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: User Profile & Eco Impact */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Welcome back, {currentUser.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentUser.dietaryPref} Diet
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  {currentUser.hostelRoom || 'Hostel Resident'} • {currentUser.email}
                </p>
              </div>
            </div>

            {/* Student-Facing "Waste Saved This Month" Counter Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shrink-0 border border-emerald-500/30 shadow-inner">
                  {badge.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Waste Saved This Month
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                      {badge.name}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                    {personalWasteKg} <span className="text-sm font-semibold text-emerald-300">kg food waste avoided</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    By marking your skips early, the kitchen saved ~{Math.round(personalWasteKg / 0.45)} full meals!
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-medium">Hostel Collective Impact</div>
                <div className="text-lg font-bold text-emerald-300">{collectiveWasteKg} kg Saved</div>
                <div className="text-[10px] text-slate-500">🌱 {co2AvoidedKg} kg CO₂ emissions averted</div>
              </div>
            </div>
          </div>

          {/* Right: Cutoff Reminder & Push System Banner */}
          <div className="lg:col-span-5 bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="font-semibold text-sm text-slate-200">Daily Kitchen RSVP Cutoffs</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Strict Timings
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Breakfast Cutoff</div>
                <div className="font-bold text-slate-200">07:00 AM</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Lunch Cutoff</div>
                <div className="font-bold text-slate-200">11:30 AM</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Snacks Cutoff</div>
                <div className="font-bold text-slate-200">04:30 PM</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Dinner Cutoff</div>
                <div className="font-bold text-slate-200">07:00 PM</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              🔔 Turn on push reminders on your browser so you never miss the deadline to confirm your meals.
            </p>
          </div>
        </div>
      </div>

      {/* Date Navigation Bar (Yesterday, Today, Tomorrow, +2, +3, +4 days) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {schedule.map((day) => {
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap flex flex-col items-center ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider opacity-80">
                  {day.isToday ? 'Today' : day.dayName}
                </span>
                <span className="font-bold">{day.formattedDate}</span>
              </button>
            );
          })}
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-slate-800">
          <button
            onClick={() => handleBatch('attending')}
            disabled={submittingSlot === 'batch'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            title="Mark will eat for all 4 meals on this day"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Attend All 4</span>
          </button>
          <button
            onClick={() => handleBatch('skipping')}
            disabled={submittingSlot === 'batch'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
            title="Mark skipping for all 4 meals on this day (e.g. going out of campus)"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Skip All 4 (Out)</span>
          </button>
        </div>
      </div>

      {/* 4 Meal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeDay?.meals.map((mealSchedule) => {
          const { slot, menu, userStatus, counts } = mealSchedule;
          const isAttending = userStatus === 'attending';
          const isSkipping = userStatus === 'skipping';
          const noteKey = `${activeDay.date}_${slot}`;

          return (
            <div
              key={slot}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isAttending
                  ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : isSkipping
                  ? 'bg-slate-900/80 border-slate-800 opacity-90'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                    {SLOT_ICONS[slot]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-base capitalize">
                        {menu?.slotLabel || slot}
                      </h3>
                      {menu?.chefSpecial && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-amber-400" /> Chef Special
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{menu?.timeWindow}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">Cutoff: {menu?.cutoffTime}</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Headcounts Pills */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-emerald-400">
                    {counts.attending} Attending
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {counts.skipping} Skipping
                  </div>
                </div>
              </div>

              {/* Menu Details & Items */}
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <div className="text-sm font-semibold text-slate-200 mb-1">{menu?.title}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {menu?.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>⚡ {menu?.calories} kcal</span>
                  <span>💪 {menu?.protein} protein</span>
                  <span>🥗 {menu?.dietType} Friendly</span>
                </div>

                {/* Dietary Note Input */}
                <div>
                  <input
                    type="text"
                    value={dietaryNotes[noteKey] ?? mealSchedule.dietaryNote ?? ''}
                    onChange={(e) =>
                      setDietaryNotes((prev) => ({ ...prev, [noteKey]: e.target.value }))
                    }
                    placeholder="Add dietary note (e.g. Less spicy, vegan, fasting)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Attendance Choice Buttons & Rating trigger */}
              <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRSVP(slot, 'attending')}
                    disabled={submittingSlot === slot}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isAttending
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isAttending ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span>{isAttending ? 'Will Eat (Attending)' : 'Eat This Meal'}</span>
                  </button>

                  <button
                    onClick={() => handleRSVP(slot, 'skipping')}
                    disabled={submittingSlot === slot}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSkipping
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${isSkipping ? 'text-white' : 'text-rose-400'}`} />
                    <span>{isSkipping ? 'Skipping (Opted Out)' : 'Skip / Out'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {isAttending && '✅ You are confirmed for kitchen count'}
                    {isSkipping && '🌱 Kitchen notified to avoid cooking your portion'}
                    {!isAttending && !isSkipping && '⚠️ Please confirm before cutoff time'}
                  </span>

                  {/* Rate dish button */}
                  <button
                    onClick={() => onOpenRateModal(menu?.items[0] || menu?.title || 'Meal', slot)}
                    className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 py-1 px-2 rounded-lg hover:bg-amber-400/10 transition"
                  >
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>Rate Quality</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
