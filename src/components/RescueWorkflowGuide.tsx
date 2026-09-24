import React from 'react';
import { 
  Zap, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  TrendingUp, 
  X,
  ShieldCheck
} from 'lucide-react';

interface RescueWorkflowGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RescueWorkflowGuide: React.FC<RescueWorkflowGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-rose-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                The 48-Hour Demo Freshness SOP
              </h2>
              <p className="text-xs text-rose-200">
                Operating rules to eliminate the ₹6.16M/mo funnel leakage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Why this matters */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-amber-900 flex items-center gap-1.5 text-xs mb-1">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              The Empirical Evidence
            </h3>
            <p className="text-amber-800 leading-relaxed">
              When demos are booked within <strong>48 hours</strong> of inquiry, attendance is <strong>74.95%</strong>. 
              When pushed beyond 48 hours, attendance collapses to <strong>46.93%</strong> (a 28 percentage point decline!). 
              Long-wait leads that do show up convert at ~20.4%, proving the issue is purely <em>time decay</em>, not lead quality.
            </p>
          </div>

          {/* Step 1 to 5 */}
          <div className="space-y-3.5">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <strong className="text-slate-900 block font-bold text-xs">Automatic Flagging</strong>
                <p className="text-slate-600 mt-0.5">
                  Any lead where <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-rose-600 font-mono font-bold">demo_scheduled_at - created_at &gt; 48 hours</code> is automatically routed into the Daily Rescue Queue.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <strong className="text-slate-900 block font-bold text-xs">Offer Earlier Demo Slot (Pre-pone)</strong>
                <p className="text-slate-600 mt-0.5">
                  Rep contacts parent via WhatsApp or phone: <em>"A priority VIP slot opened up sooner tomorrow at 4:30 PM. Would you like Aarav to get started early?"</em> 
                  Preponing restores the demo to the 75% join probability tier.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <strong className="text-slate-900 block font-bold text-xs">Explicit Attendance Reconfirmation</strong>
                <p className="text-slate-600 mt-0.5">
                  If the parent cannot move the slot, demand an explicit reply (e.g. <em>"Reply CONFIRM to reserve mentor's 1-on-1 slot"</em>). Unconfirmed demos receive priority morning callouts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </div>
              <div>
                <strong className="text-slate-900 block font-bold text-xs">Daily Priority Dispatch</strong>
                <p className="text-slate-600 mt-0.5">
                  Reps must clear their 48h Freshness Queue every morning before calling cold inquiries, focusing effort where high-ticket deals are slipping away.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                5
              </div>
              <div>
                <strong className="text-slate-900 block font-bold text-xs">Milestone Tracking</strong>
                <p className="text-slate-600 mt-0.5">
                  Log the outcome: <span className="font-semibold text-indigo-700">Slot Preponed</span>, <span className="font-semibold text-emerald-700">Reconfirmed</span>, <span className="font-semibold text-slate-800">Joined</span>, or <span className="font-semibold text-emerald-800">Converted (₹60,000)</span>.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Got it, Let's Execute
          </button>
        </div>

      </div>
    </div>
  );
};
