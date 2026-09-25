import React, { useState } from 'react';
import { X, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function FeedbackModal({ song, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState('recommendation_match');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !song) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitFeedback({
        song_id: song.id,
        rating,
        feedback_type: feedbackType,
        comment: comment.trim() || undefined,
      });
      showToast('Thank you for rating! This refines your AI recommendations.', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#131522] border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Rate Recommendation</h3>
        <p className="text-xs text-slate-400 mb-4">
          How well does <span className="text-purple-300 font-semibold">{song.title}</span> match your taste?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="flex justify-center items-center space-x-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 text-slate-600 hover:scale-110 transition focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center text-xs font-semibold text-amber-300">
            {rating === 5 && '🌟 Spot on! Exactly my taste'}
            {rating === 4 && '👍 Great recommendation, really liked it'}
            {rating === 3 && '👌 Decent track, fairly neutral'}
            {rating === 2 && '👎 Not quite my current mood'}
            {rating === 1 && '❌ Completely not my taste'}
          </div>

          {/* Feedback Type Category */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Feedback Category</label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full bg-[#1b1e2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="recommendation_match">Fits my taste & demographic profile</option>
              <option value="loved_vibe">Loved the vibe & energy</option>
              <option value="not_my_taste">Dislike this genre or artist</option>
              <option value="too_repetitive">Heard this track too frequently</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Comments (Optional)
            </label>
            <textarea
              rows="2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell MusicMind AI what worked or what to adjust..."
              className="w-full bg-[#1b1e2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
