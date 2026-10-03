import React, { useState } from 'react';
import { DishLeaderboardItem, FoodRating, MealSlot } from '../types';
import {
  Star,
  Plus,
  Search,
  Filter,
  MessageSquare,
  ThumbsUp,
  Tag,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingDown,
} from 'lucide-react';

interface RatingsViewProps {
  ratingsData: {
    dishes: DishLeaderboardItem[];
    mostFavorite: DishLeaderboardItem[];
    mostDisliked: DishLeaderboardItem[];
    recentReviews: FoodRating[];
    totalRatingsCount: number;
  } | null;
  onOpenRateModal: (dishName?: string) => void;
}

export const RatingsView: React.FC<RatingsViewProps> = ({ ratingsData, onOpenRateModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!ratingsData) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Loading dishes & ratings...</p>
      </div>
    );
  }

  const { dishes, recentReviews } = ratingsData;

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory === 'all' || dish.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = dish.dishName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/40 border border-amber-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Community Food Reviews
            </span>
            <span className="text-xs text-slate-400">Student Taste Council</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Mess Food Ratings & Feedback Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Your authentic ratings directly influence which items are repeated or removed from the campus menu.
          </p>
        </div>

        <button
          onClick={() => onOpenRateModal()}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Food Review</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'breakfast', 'lunch', 'snacks', 'dinner'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish (e.g. Paneer, Dosa)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Dishes Leaderboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => {
          const isHigh = dish.avgRating >= 4.0;
          const isLow = dish.avgRating <= 2.5;

          return (
            <div
              key={dish.dishName}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      {dish.category}
                    </span>
                    <h3 className="font-bold text-slate-100 text-base mt-0.5">{dish.dishName}</h3>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold text-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{dish.avgRating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {dish.topTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {dish.comments.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 italic">
                    "{dish.comments[0]}"
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">{dish.ratingCount} reviews</span>
                <button
                  onClick={() => onOpenRateModal(dish.dishName)}
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Rate this dish →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Student Reviews Stream */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base">Live Student Reviews Feed</h3>
          </div>
          <span className="text-xs text-slate-400">{recentReviews.length} recent reviews</span>
        </div>

        <div className="space-y-3">
          {recentReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-200">{rev.userName}</div>
                    <div className="text-[10px] text-slate-400">
                      Reviewed <span className="font-semibold text-slate-200">{rev.dishName}</span> ({rev.mealSlot})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              {rev.comment && <p className="text-xs text-slate-300 mt-2 leading-relaxed">{rev.comment}</p>}

              <div className="flex flex-wrap gap-1 mt-2">
                {rev.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
