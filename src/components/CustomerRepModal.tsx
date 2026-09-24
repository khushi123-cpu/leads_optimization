import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Copy, 
  Check, 
  Zap, 
  Globe
} from 'lucide-react';
import { Lead } from '../types/crm';
import { calculateHoursDifference } from '../utils/analytics';

interface CustomerRepModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

export const CustomerRepModal: React.FC<CustomerRepModalProps> = ({
  lead,
  onClose,
  onUpdateLead,
}) => {
  if (!lead) return null;

  const [activeActionTab, setActiveActionTab] = useState<'prepone' | 'reconfirm' | 'status'>('prepone');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [repNote, setRepNote] = useState<string>(lead.last_activity_note || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local state for toggles
  const [isJoined, setIsJoined] = useState<boolean>(lead.demo_joined);
  const [isCompleted, setIsCompleted] = useState<boolean>(lead.demo_completed);
  const [isConverted, setIsConverted] = useState<boolean>(lead.converted);

  // Format dates for display
  const formatDate = (isoStr: string) => {
    if (!isoStr) return 'Not scheduled';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return isoStr;
    }
  };

  // Google Calendar style suggested earlier slots
  const getSlotDate = (hoursAhead: number) => {
    return new Date(Date.now() + hoursAhead * 3600000);
  };

  const formatSlotTimeOnly = (d: Date) => {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatSlotDayOnly = (d: Date) => {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const slot1 = getSlotDate(16);
  const slot2 = getSlotDate(22);
  const slot3 = getSlotDate(27);
  const slot4 = getSlotDate(44);

  const suggestedSlots = [
    {
      dayLabel: formatSlotDayOnly(slot1),
      timeLabel: '11:00 AM',
      iso: slot1.toISOString().split('T')[0] + 'T11:00:00',
      period: 'Morning Prime'
    },
    {
      dayLabel: formatSlotDayOnly(slot2),
      timeLabel: '04:30 PM',
      iso: slot2.toISOString().split('T')[0] + 'T16:30:00',
      period: 'Afternoon Peak'
    },
    {
      dayLabel: formatSlotDayOnly(slot3),
      timeLabel: '07:00 PM',
      iso: slot3.toISOString().split('T')[0] + 'T19:00:00',
      period: 'Evening'
    },
    {
      dayLabel: formatSlotDayOnly(slot4),
      timeLabel: '05:00 PM',
      iso: slot4.toISOString().split('T')[0] + 'T17:00:00',
      period: 'Day 2 Open'
    }
  ];

  // Pre-drafted messages
  const preponedMessage = `Hi! Regarding your scheduled live demo for Lead ${lead.lead_id} (scheduled for ${formatDate(lead.demo_scheduled_at)}): An earlier priority slot opened up tomorrow at 4:30 PM! Would you like to prepone so we can get started sooner? Reply YES to confirm earlier slot, or let us know what time works best!`;

  const reconfirmMessage = `Hi! Just checking in regarding your live 1-on-1 demo scheduled for ${formatDate(lead.demo_scheduled_at)} (Lead ${lead.lead_id}). Our team has reserved this dedicated time for you. Please reply "CONFIRM" to ensure your seat remains reserved!`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Action: Pre-pone demo to earlier slot
  const handleConfirmPrepone = (slotIso: string) => {
    const newHours = calculateHoursDifference(lead.created_at, slotIso);
    const updated: Lead = {
      ...lead,
      demo_scheduled_at: slotIso,
      hours_to_demo: newHours,
      is_long_wait: newHours > 48,
      rescue_status: 'slot_preponed',
      follow_up_attempts: lead.follow_up_attempts + 1,
      last_activity_note: `⚡ Slot rescheduled to ${formatDate(slotIso)}.`
    };
    onUpdateLead(updated);
    showToast(`Slot updated to ${formatDate(slotIso)}!`);
  };

  // Action: Mark as explicitly reconfirmed
  const handleMarkReconfirmed = () => {
    const updated: Lead = {
      ...lead,
      rescue_status: 'reconfirmed',
      follow_up_attempts: lead.follow_up_attempts + 1,
      last_activity_note: `✓ Attendance reconfirmed with customer for ${formatDate(lead.demo_scheduled_at)}.`
    };
    onUpdateLead(updated);
    showToast("Attendance reconfirmed!");
  };

  // Action: Save Milestones
  const handleSaveMilestones = () => {
    const updated: Lead = {
      ...lead,
      demo_joined: isJoined,
      demo_completed: isCompleted,
      converted: isConverted,
      rescue_status: isConverted 
        ? 'converted' 
        : (!isJoined && (lead.hours_to_demo ?? 0) > 48 ? 'unrescued_noshow' : lead.rescue_status),
      last_activity_note: repNote
    };
    onUpdateLead(updated);
    showToast('Demo milestones saved.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center space-x-2 text-xs font-bold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Simple Unobtrusive Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-800 text-sm">
              Lead: {lead.lead_id}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {lead.geography}
            </span>
            {lead.converted && (
              <span className="px-2 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                Won
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlighted Timing Section (Google Calendar Style) */}
        <div className="mx-5 mt-4 p-4 rounded-xl bg-indigo-50/80 border border-indigo-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-indigo-700 uppercase">
              Current Scheduled Demo
            </span>
            <span className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {lead.parent_timezone || 'UTC'}
            </span>
          </div>

          <div className="mt-1 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-base font-bold text-slate-900 tracking-tight">
              {formatDate(lead.demo_scheduled_at)}
            </div>
          </div>
        </div>

        {/* Action Tabs for Rep */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 pt-3 mt-3 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveActionTab('prepone')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeActionTab === 'prepone'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Offer Earlier Slots</span>
          </button>

          <button
            onClick={() => setActiveActionTab('reconfirm')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeActionTab === 'reconfirm'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reconfirm Message</span>
          </button>

          <button
            onClick={() => setActiveActionTab('status')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeActionTab === 'status'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Milestone Outcome</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: OFFER EARLIER SLOTS (CALENDAR TIMING SELECTION) */}
          {activeActionTab === 'prepone' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Available Earlier Slot:
                </span>
                <span className="text-[11px] text-slate-500">
                  Preponing restores demo freshness
                </span>
              </div>

              {/* Timing Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {suggestedSlots.map((slot, idx) => {
                  const isSelected = selectedSlot === slot.iso;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot(slot.iso)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">{slot.dayLabel}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {slot.timeLabel}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {slot.period}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Date & Time Picker */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Or pick custom date & time:
                </label>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => {
                    setCustomDateTime(e.target.value);
                    setSelectedSlot(e.target.value);
                  }}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Confirm Reschedule Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => handleConfirmPrepone(selectedSlot)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Confirm & Reschedule Demo</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RECONFIRM MESSAGE */}
          {activeActionTab === 'reconfirm' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Attendance Reconfirmation Script
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send reconfirmation note or prompt for attendance confirmation.
                </p>
              </div>

              {/* Preponed Script Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 relative">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Earlier Slot Offer Message
                </span>
                <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                  {preponedMessage}
                </p>
                <button
                  onClick={() => handleCopy(preponedMessage)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Message'}</span>
                </button>
              </div>

              {/* Reconfirm Script Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 relative">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Reconfirmation Reminder
                </span>
                <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                  {reconfirmMessage}
                </p>
                <button
                  onClick={() => handleCopy(reconfirmMessage)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Message'}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleMarkReconfirmed}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Attendance Reconfirmed</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STATUS & MILESTONES */}
          {activeActionTab === 'status' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Update Demo Milestones
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record actual demo outcome and notes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isJoined}
                    onChange={(e) => setIsJoined(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-800">Demo Joined</span>
                </label>

                <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-800">Demo Completed</span>
                </label>

                <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isConverted}
                    onChange={(e) => setIsConverted(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-emerald-900">Converted (Won)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Activity Notes:
                </label>
                <textarea
                  rows={3}
                  value={repNote}
                  onChange={(e) => setRepNote(e.target.value)}
                  placeholder="Add notes about customer interaction..."
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveMilestones}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Milestones</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Simple Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
