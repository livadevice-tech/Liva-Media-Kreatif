import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  UserPlus, 
  Check, 
  X, 
  Bell, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ContentPost, ContentStatus } from '../../types/app';

interface RightInspectorPanelProps {
  post: Partial<ContentPost> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<ContentPost>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const COLOR_SWATCHES = [
  { name: 'Red', hex: '#f87171', bg: 'bg-red-400' },
  { name: 'Orange', hex: '#fb923c', bg: 'bg-orange-400' },
  { name: 'Pink', hex: '#f472b6', bg: 'bg-pink-400' },
  { name: 'Yellow', hex: '#facc15', bg: 'bg-yellow-400' },
  { name: 'Green', hex: '#4ade80', bg: 'bg-emerald-400' },
  { name: 'Cyan', hex: '#22d3ee', bg: 'bg-cyan-400' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Purple', hex: '#818cf8', bg: 'bg-indigo-500' },
  { name: 'Rainbow', hex: 'rainbow', bg: 'bg-gradient-to-tr from-pink-500 via-amber-400 to-indigo-500' }
];

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<ContentPost>>({
    title: '',
    scheduled_at: new Date().toISOString().slice(0, 10),
    start_time: '15:00',
    end_time: '16:00',
    is_all_day: false,
    meet_link: 'https://meet.google.com/izp-srsk-kxf',
    location: 'Jakarta, Indonesia',
    color: '#818cf8',
    notes: "You're invited to join our Google Meet session for an important discussion.\n\nLink: https://meet.google.com/izp-srsk-kxf\n\nWe look forward to your participation!",
    assignee_copy: 'Nazmi Javier',
    assignee_design: 'Emilia Inder',
    platform: 'instagram',
    content_type: 'feed_single',
    status: 'scheduled'
  });

  const [saving, setSaving] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [newParticipant, setNewParticipant] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        title: post.title || '',
        scheduled_at: post.scheduled_at ? post.scheduled_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
        start_time: post.start_time || '15:00',
        end_time: post.end_time || '16:00',
        is_all_day: post.is_all_day || false,
        meet_link: post.meet_link || 'https://meet.google.com/izp-srsk-kxf',
        location: post.location || 'Jakarta, Indonesia',
        color: post.color || '#818cf8',
        notes: post.notes || "You're invited to join our Google Meet session for an important discussion.",
        assignee_copy: post.assignee_copy || 'Nazmi Javier',
        assignee_design: post.assignee_design || 'Emilia Inder',
        platform: post.platform || 'instagram',
        content_type: post.content_type || 'feed_single',
        status: post.status || 'scheduled'
      });
    }
  }, [post]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return 'Thursday, 18 September';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <aside className="w-80 lg:w-[350px] shrink-0 border-l border-slate-200/90 bg-white flex flex-col h-full z-20 shadow-[-4px_0_20px_rgba(0,0,0,0.02)] transition-all">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Header Close on Mobile or Small Viewports */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 lg:hidden">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Details</span>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title Input */}
          <div className="pt-1">
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              className="w-full text-base font-semibold text-slate-900 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
              autoFocus
            />
          </div>

          {/* Date Selector Box */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700">
            <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={formData.scheduled_at || ''}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="bg-transparent border-none text-slate-800 font-medium text-xs focus:outline-none cursor-pointer w-full"
            />
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="time"
              value={formData.start_time || '15:00'}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="bg-transparent border-none text-slate-800 font-medium text-xs focus:outline-none w-20 cursor-pointer"
            />
            <span className="text-slate-400 font-normal">-</span>
            <input
              type="time"
              value={formData.end_time || '16:00'}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="bg-transparent border-none text-slate-800 font-medium text-xs focus:outline-none w-20 cursor-pointer"
            />
          </div>

          {/* Toggles: All Day & Yearly */}
          <div className="flex items-center gap-6 pt-1 text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_all_day || false}
                onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>All day</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isYearly}
                onChange={(e) => setIsYearly(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>Yearly</span>
            </label>
          </div>

          {/* Participants */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddParticipant(!showAddParticipant)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-slate-400" />
              <span>Add participant</span>
            </button>

            {showAddParticipant && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Employee name..."
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newParticipant.trim()) {
                      setFormData({ ...formData, assignee_copy: newParticipant.trim() });
                      setNewParticipant('');
                      setShowAddParticipant(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium"
                >
                  Add
                </button>
              </div>
            )}

            {/* List of Participants */}
            <div className="space-y-1.5 pt-1">
              {formData.assignee_copy && (
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                      {formData.assignee_copy.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-800">{formData.assignee_copy}</span>
                  </div>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                </div>
              )}

              {formData.assignee_design && (
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px]">
                      {formData.assignee_design.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-800">{formData.assignee_design}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Link */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-700">
            <Video className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={formData.meet_link || ''}
              onChange={(e) => setFormData({ ...formData, meet_link: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="bg-transparent border-none text-slate-700 text-xs focus:outline-none w-full truncate"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Location (e.g. Jakarta, Indonesia)"
              className="bg-transparent border-none text-slate-700 text-xs focus:outline-none w-full"
            />
          </div>

          {/* Description & Notes */}
          <div>
            <textarea
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes, link info or agenda..."
              className="w-full text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed custom-scrollbar resize-none"
            />
          </div>

          {/* Add Reminders Button */}
          <div>
            <button
              type="button"
              className="w-full py-2 px-3 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Reminders</span>
            </button>
          </div>

          {/* Color Swatches */}
          <div className="pt-2">
            <div className="flex items-center justify-between gap-1.5 px-1">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected = formData.color === swatch.hex;
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: swatch.hex })}
                    title={swatch.name}
                    className={`w-5 h-5 rounded-full ${swatch.bg} transition-transform flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions: Cancel and Save */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-[#4f46e5] hover:bg-indigo-700 shadow-sm transition-all"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </aside>
  );
};
