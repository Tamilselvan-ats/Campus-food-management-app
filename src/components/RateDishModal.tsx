import React, { useState } from 'react';
import { MealSlot } from '../types';
import { Star, X, Check, Heart, ThumbsDown } from 'lucide-react';
import { submitRating } from '../services/api';
import { fireEcoConfetti } from '../services/notificationService';

interface RateDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDishName?: string;
  defaultSlot?: MealSlot;
  onRatingSubmitted: () => void;
}

const AVAILABLE_TAGS = [
  'Delicious',
  'Too Oily',
  'Perfect Spice',
  'Bland',
  'Cold',
  'Fresh & Hot',
  'Crispy',
  'Needs More Salt',
  'Authentic Taste',
  'Great Portion',
  'Must Repeat',
];

export const RateDishModal: React.FC<RateDishModalProps> = ({
  isOpen,
  onClose,
  defaultDishName = '',
  defaultSlot = 'lunch',
  onRatingSubmitted,
}) => {
  const [dishName, setDishName] = useState(defaultDishName || 'Paneer Butter Masala');
  const [mealSlot, setMealSlot] = useState<MealSlot>(defaultSlot);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Delicious', 'Fresh & Hot']);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    try {
      setIsSubmitting(true);
      await submitRating({
        dishName: dishName.trim(),
        mealSlot,
        rating,
        tags: selectedTags,
        comment: comment.trim(),
      });

      if (rating >= 4) {
        fireEcoConfetti();
      }

      setSuccessMsg('Thank you! Your rating helps the mess council improve the menu.');
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMsg('');
        onRatingSubmitted();
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Rate Mess Food Quality</h3>
            <p className="text-xs text-slate-400">Directly impacts the chef's future menu choices</p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <p className="font-semibold text-emerald-300">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dish selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dish Name</label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="e.g. Masala Dosa, Dal Makhani, Paneer Butter Masala"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Meal Slot */}
            <div className="grid grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealSlot[]).map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setMealSlot(slot)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize border transition ${
                    mealSlot === slot
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {/* Star Rating */}
            <div className="text-center py-2 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-2">How satisfied were you?</div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        } transition-colors`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-xs font-semibold mt-1 text-amber-300">
                {rating === 5 && '🌟 Outstanding! Loved it.'}
                {rating === 4 && '👍 Very good and tasty.'}
                {rating === 3 && '😐 Average / acceptable.'}
                {rating === 2 && '👎 Needs improvement.'}
                {rating === 1 && '⚠️ Very poor / barely edible.'}
              </div>
            </div>

            {/* Feedback Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Quality Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-medium'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback / Suggestions</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell the chef what worked well or what was wrong (salt, oiliness, spice level, temperature)..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Submitting Review...' : 'Submit Food Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
