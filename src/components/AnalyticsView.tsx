import React from 'react';
import { StatsOverview, DishLeaderboardItem, FoodRating } from '../types';
import {
  TrendingUp,
  Leaf,
  DollarSign,
  Award,
  Star,
  ThumbsDown,
  Heart,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Flame,
} from 'lucide-react';

interface AnalyticsViewProps {
  stats: StatsOverview | null;
  ratingsData: {
    dishes: DishLeaderboardItem[];
    mostFavorite: DishLeaderboardItem[];
    mostDisliked: DishLeaderboardItem[];
    recentReviews: FoodRating[];
    totalRatingsCount: number;
  } | null;
  onOpenRateModal: (dishName: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, ratingsData, onOpenRateModal }) => {
  if (!stats || !ratingsData) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Loading database analytics & trends...</p>
      </div>
    );
  }

  const { attendanceTrends, wasteReduction, studentPersonalStats, slotDistribution } = stats;
  const { mostFavorite, mostDisliked, recentReviews } = ratingsData;

  // Find max attendance count for chart scale
  const maxDayTotal = Math.max(...attendanceTrends.map((d) => d.totalEaten), 20);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Real Database Metrics
          </span>
          <span className="text-xs text-slate-400">Live Campus Mess Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Meal Trends & Waste Reduction Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Dynamic calculations based on daily student RSVPs, actual waste logs, and food reviews.
        </p>
      </div>

      {/* Top 4 Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Food Waste Avoided */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Food Waste Prevented
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white">
              {wasteReduction.totalHostelFoodSavedKg}
            </span>
            <span className="text-sm font-semibold text-emerald-400">kg saved</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Equivalent to ~{wasteReduction.totalMealsSaved} full plates saved from landfills.
          </p>
        </div>

        {/* Metric 2: Carbon Emissions Averted */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              CO₂ Carbon Averted
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white">
              {wasteReduction.totalCo2SavedKg}
            </span>
            <span className="text-sm font-semibold text-teal-400">kg CO₂e</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Greenhouse gas emissions neutralized by early skip declarations.
          </p>
        </div>

        {/* Metric 3: Budget Saved */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hostel Budget Optimized
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white">
              ₹{wasteReduction.totalMoneySaved.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-amber-400">saved</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Funds redirected to higher quality ingredients & festive feasts.
          </p>
        </div>

        {/* Metric 4: Waste Diversion Rate */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Waste Diversion Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white">
              {wasteReduction.wasteDiversionRate}%
            </span>
            <span className="text-sm font-semibold text-indigo-400">efficiency</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Surplus food hygienically repurposed or donated to Annakshetra.
          </p>
        </div>
      </div>

      {/* 7-Day Meal Attendance Trends Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-base">7-Day Attendance Trends per Meal Slot</h3>
            </div>
            <p className="text-xs text-slate-400">
              Total number of confirmed student eaters across breakfast, lunch, evening snacks, and dinner.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-amber-400" /> Breakfast
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-orange-500" /> Lunch
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Snacks
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-indigo-500" /> Dinner
            </span>
          </div>
        </div>

        {/* Visual Stacked Bar Chart */}
        <div className="space-y-4 pt-2">
          {attendanceTrends.map((day) => {
            const bWidth = (day.breakfast / maxDayTotal) * 100;
            const lWidth = (day.lunch / maxDayTotal) * 100;
            const sWidth = (day.snacks / maxDayTotal) * 100;
            const dWidth = (day.dinner / maxDayTotal) * 100;

            return (
              <div key={day.date} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{day.dayLabel}</span>
                  <span className="text-slate-400">
                    <span className="font-bold text-emerald-400">{day.totalEaten}</span> total meals ({day.attendanceRate}% turnout)
                  </span>
                </div>

                {/* Stacked bar */}
                <div className="w-full bg-slate-950 h-5 rounded-xl overflow-hidden flex border border-slate-800">
                  <div
                    style={{ width: `${bWidth}%` }}
                    className="bg-amber-400 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-slate-950 font-bold"
                    title={`Breakfast: ${day.breakfast}`}
                  >
                    {day.breakfast > 0 && day.breakfast}
                  </div>
                  <div
                    style={{ width: `${lWidth}%` }}
                    className="bg-orange-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
                    title={`Lunch: ${day.lunch}`}
                  >
                    {day.lunch > 0 && day.lunch}
                  </div>
                  <div
                    style={{ width: `${sWidth}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-slate-950 font-bold"
                    title={`Snacks: ${day.snacks}`}
                  >
                    {day.snacks > 0 && day.snacks}
                  </div>
                  <div
                    style={{ width: `${dWidth}%` }}
                    className="bg-indigo-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
                    title={`Dinner: ${day.dinner}`}
                  >
                    {day.dinner > 0 && day.dinner}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ratings Section: Most Favorite vs Disliked Foods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Favorite Dishes */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Top Rated & Favorite Dishes</h3>
                <p className="text-xs text-slate-400">Student favorites with highest 5-star ratings</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              Kitchen High Priority
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {mostFavorite.map((dish, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <h4 className="font-bold text-sm text-slate-100">{dish.dishName}</h4>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 capitalize">
                      ({dish.category})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dish.topTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-medium"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>

                  {dish.comments.length > 0 && (
                    <p className="text-xs text-slate-400 italic mt-2 line-clamp-1">
                      "{dish.comments[0]}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-base">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{dish.avgRating}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{dish.ratingCount} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Disliked / Needs Improvement Dishes */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ThumbsDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Disliked / Recipe Review Flagged</h3>
                <p className="text-xs text-slate-400">Dishes with high student complaints or skip correlation</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
              Needs Recipe Overhaul
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {mostDisliked.map((dish, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-rose-500/40 transition flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center">
                      !
                    </span>
                    <h4 className="font-bold text-sm text-slate-100">{dish.dishName}</h4>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 capitalize">
                      ({dish.category})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dish.topTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium"
                      >
                        ⚠ {tag}
                      </span>
                    ))}
                  </div>

                  {dish.comments.length > 0 && (
                    <p className="text-xs text-slate-400 italic mt-2 line-clamp-1">
                      "{dish.comments[0]}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-rose-400 font-bold text-base">
                    <Star className="w-4 h-4 fill-rose-400" />
                    <span>{dish.avgRating}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{dish.ratingCount} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
