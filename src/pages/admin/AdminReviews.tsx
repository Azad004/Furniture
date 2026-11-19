import React, { useState } from 'react';
import { Check, EyeOff, Star, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ReviewStatus } from '../../types/store';

export const AdminReviews: React.FC = () => {
  const { reviews, updateReviewStatus, deleteReview } = useStore();
  const [filter, setFilter] = useState<ReviewStatus | 'All'>('All');

  const filtered = reviews.filter((r) => (filter === 'All' ? true : r.status === filter));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium">Reviews &amp; Ratings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Moderate client feedback before publishing to product pages and the Home Page showcase.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-lg border w-fit" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
        {(['All', 'Pending', 'Approved', 'Hidden'] as const).map((tab) => {
          const active = filter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                active ? 'vespera-btn-primary' : 'hover:bg-black/5'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Reviews Table -> Stacked Mobile Cards */}
      <div
        className="rounded-xl border overflow-hidden md:overflow-visible"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="p-3 md:p-0">
          <table className="admin-responsive-table">
            <thead>
              <tr>
                <th>Client &amp; Piece</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Status</th>
                <th className="text-right">Moderation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rev) => (
                <tr key={rev.id}>
                  <td data-primary="true">
                    <div>
                      <p className="font-medium">{rev.authorName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {rev.productName}
                      </p>
                    </div>
                  </td>
                  <td data-label="Rating">
                    <div className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--color-brass)' }} />
                      <span className="font-mono-tabular text-xs font-semibold">{rev.rating}/5</span>
                    </div>
                  </td>
                  <td data-label="Feedback" className="max-w-md">
                    <p className="text-xs leading-relaxed line-clamp-2 text-right md:text-left">
                      {rev.comment}
                    </p>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`text-xs font-semibold ${
                        rev.status === 'Approved'
                          ? 'text-emerald-700'
                          : rev.status === 'Pending'
                          ? 'text-amber-700'
                          : 'text-neutral-500'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </td>
                  <td data-label="Moderation" className="md:text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {rev.status !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() => updateReviewStatus(rev.id, 'Approved')}
                          className="px-2.5 py-1.5 rounded-md border text-xs font-medium text-emerald-700 inline-flex items-center gap-1 hover:bg-emerald-50 cursor-pointer"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {rev.status !== 'Hidden' && (
                        <button
                          type="button"
                          onClick={() => updateReviewStatus(rev.id, 'Hidden')}
                          className="px-2.5 py-1.5 rounded-md border text-xs font-medium inline-flex items-center gap-1 hover:bg-black/5 cursor-pointer"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteReview(rev.id)}
                        aria-label="Delete review"
                        className="px-2 py-1.5 rounded-md border text-xs text-rose-700 hover:bg-rose-50 cursor-pointer"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
