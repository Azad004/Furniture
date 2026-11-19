import React, { useState } from 'react';
import { Check, Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminContent: React.FC = () => {
  const { content, updateContent, navigate } = useStore();

  const [title, setTitle] = useState(content.privacyPolicyTitle);
  const [body, setBody] = useState(content.privacyPolicyBody);
  const [announcementBar, setAnnouncementBar] = useState(content.announcementBar);
  const [showAnnouncement, setShowAnnouncement] = useState(content.showAnnouncementBar);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent({
      privacyPolicyTitle: title.trim(),
      privacyPolicyBody: body,
      announcementBar: announcementBar.trim(),
      showAnnouncementBar: showAnnouncement,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">Content Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Edit the storefront Privacy Policy and global announcement banner. Changes publish immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate({ page: 'privacy' })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 cursor-pointer self-start sm:self-auto"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Eye className="w-4 h-4" />
          <span>Preview Live Privacy Page</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Announcement Banner Control */}
        <section
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium">Storefront Top Announcement</h2>
            <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={showAnnouncement}
                onChange={(e) => setShowAnnouncement(e.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              <span>Visible on Storefront</span>
            </label>
          </div>
          <input
            type="text"
            value={announcementBar}
            onChange={(e) => setAnnouncementBar(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </section>

        {/* Privacy Policy Editor */}
        <section
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-medium">Privacy Policy Editor</h2>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Last published: {content.privacyPolicyUpdatedAt}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Policy Page Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Policy Sections &amp; Body Text</label>
            <textarea
              rows={13}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-3 text-sm leading-relaxed rounded-lg border bg-transparent"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-2">
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <Check className="w-4 h-4" />
                <span>Saved &amp; published to storefront</span>
              </span>
            )}
            <button
              type="submit"
              className="vespera-btn-primary px-6 py-2.5 text-sm font-semibold cursor-pointer"
            >
              Publish Policy Changes
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};
