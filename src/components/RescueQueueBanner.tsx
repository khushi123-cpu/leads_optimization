import React from 'react';
import { ShieldAlert, ArrowRight, Zap } from 'lucide-react';

interface RescueQueueBannerProps {
  onViewRescueQueue: () => void;
  activeTab?: string;
}

export const RescueQueueBanner: React.FC<RescueQueueBannerProps> = ({
  onViewRescueQueue,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white rounded-xl p-3.5 sm:p-4 mb-5 shadow-xs border border-rose-700/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Highlighted Active Leak Detected + Title + Static general context */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center shrink-0 text-amber-300">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              48-Hour Demo Freshness Queue
            </h2>
            <p className="text-xs text-rose-200/80 mt-0.5">
              Demos scheduled beyond 48 hours experience high drop-off. Prepone slots or reconfirm attendance.
            </p>
          </div>
        </div>

        {/* Right: Open Rescue Queue CTA */}
        <div className="shrink-0 self-start sm:self-center">
          <button
            onClick={onViewRescueQueue}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Open Rescue Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
