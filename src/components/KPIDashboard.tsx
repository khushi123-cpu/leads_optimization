import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  HelpCircle,
  BarChart,
  Users,
  Target
} from 'lucide-react';
import { FunnelSummary, Lead } from '../types/crm';
import { formatINR, formatMillionINR } from '../utils/analytics';

interface KPIDashboardProps {
  summary: FunnelSummary;
  leads: Lead[];
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ summary, leads }) => {
  const [rescuePercent, setRescuePercent] = useState<number>(50); // Default 50% conservative scenario
  const [breakdownTab, setBreakdownTab] = useState<'source' | 'geo' | 'rep'>('source');

  // Simulation calculations based on current slider
  const targetLongWaitRescued = Math.round((summary.longWaitCount * rescuePercent) / 100);
  const simAdditionalJoins = Math.round(targetLongWaitRescued * (summary.attendanceDropPctPoints / 100));
  const simConversions = Math.round(simAdditionalJoins * (summary.joinedToConvertedRate / 100));
  const simMonthlyRevenue = Math.round((simConversions * 60000) / 2);

  // Groupings for breakdown tabs
  const sourceStats = React.useMemo(() => {
    const map: Record<string, { total: number; scheduled: number; longWait: number; joined: number; converted: number }> = {};
    leads.forEach(l => {
      const s = l.lead_source || 'Unknown';
      if (!map[s]) map[s] = { total: 0, scheduled: 0, longWait: 0, joined: 0, converted: 0 };
      map[s].total++;
      if (l.demo_scheduled_at) map[s].scheduled++;
      if (l.is_long_wait) map[s].longWait++;
      if (l.demo_joined) map[s].joined++;
      if (l.converted) map[s].converted++;
    });
    return Object.entries(map).map(([source, data]) => ({
      source,
      ...data,
      joinRate: data.scheduled > 0 ? (data.joined / data.scheduled) * 100 : 0,
      conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
    })).sort((a, b) => b.total - a.total);
  }, [leads]);

  const geoStats = React.useMemo(() => {
    const map: Record<string, { total: number; scheduled: number; longWait: number; joined: number; converted: number }> = {};
    leads.forEach(l => {
      const g = l.geography || 'Other';
      if (!map[g]) map[g] = { total: 0, scheduled: 0, longWait: 0, joined: 0, converted: 0 };
      map[g].total++;
      if (l.demo_scheduled_at) map[g].scheduled++;
      if (l.is_long_wait) map[g].longWait++;
      if (l.demo_joined) map[g].joined++;
      if (l.converted) map[g].converted++;
    });
    return Object.entries(map).map(([geo, data]) => ({
      geo,
      ...data,
      joinRate: data.scheduled > 0 ? (data.joined / data.scheduled) * 100 : 0,
    })).sort((a, b) => b.total - a.total);
  }, [leads]);

  const repStats = React.useMemo(() => {
    const map: Record<string, { shift: string; total: number; scheduled: number; longWait: number; joined: number; converted: number }> = {};
    leads.forEach(l => {
      const r = l.rep_assigned || 'Unassigned';
      if (!map[r]) map[r] = { shift: l.rep_shift || '', total: 0, scheduled: 0, longWait: 0, joined: 0, converted: 0 };
      map[r].total++;
      if (l.demo_scheduled_at) map[r].scheduled++;
      if (l.is_long_wait) map[r].longWait++;
      if (l.demo_joined) map[r].joined++;
      if (l.converted) map[r].converted++;
    });
    return Object.entries(map).map(([rep, data]) => ({
      rep,
      ...data,
      joinRate: data.scheduled > 0 ? (data.joined / data.scheduled) * 100 : 0,
    })).sort((a, b) => b.total - a.total);
  }, [leads]);

  return (
    <div className="space-y-6">
      
      {/* 4 Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Estimated Economic Leakage */}
        <div className="bg-white rounded-xl p-5 border border-rose-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Primary Funnel Leak
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatMillionINR(summary.estimatedMonthlyLeakage)}
            </span>
            <span className="text-xs font-semibold text-rose-600">/ month</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.noShows.toLocaleString()} scheduled demo no-shows over 2 months (~{summary.expectedLostCustomers} lost customers @ ₹60,000 avg)
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>2-Month Cumulative:</span>
            <span className="font-bold text-rose-700">{formatMillionINR(summary.estimatedLeakageTotal)}</span>
          </div>
        </div>

        {/* Card 2: Recoverable Opportunity */}
        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Rescue Lever Potential
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatMillionINR(summary.conservativeMonthlyGain)} - {formatMillionINR(summary.potentialMonthlyGain)}
            </span>
            <span className="text-xs font-semibold text-emerald-600">/ mo</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            By preponing or reconfirming {summary.longWaitCount.toLocaleString()} demos scheduled &gt;48h out
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Potential Lift:</span>
            <span className="font-bold text-emerald-700">+{summary.potentialConversionsGain} customers (2mo)</span>
          </div>
        </div>

        {/* Card 3: Join Rate Gap (<48h vs >48h) */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              The 48h Attendance Chasm
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              -{(summary.attendanceDropPctPoints).toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-amber-700">drop</span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span>≤48h Wait Time:</span>
              <span>{summary.shortWaitJoinRate.toFixed(1)}% Join</span>
            </div>
            <div className="flex justify-between items-center text-rose-600 font-semibold">
              <span>&gt;48h Wait Time:</span>
              <span>{summary.longWaitJoinRate.toFixed(1)}% Join</span>
            </div>
          </div>
        </div>

        {/* Card 4: Converted Pipeline */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Enrolled Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(summary.converted * 60000)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.converted} customers enrolled ({summary.joinedToConvertedRate.toFixed(1)}% of demo joiners)
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Overall Funnel:</span>
            <span className="font-bold text-slate-900">{summary.overallConversionRate.toFixed(2)}% of total leads</span>
          </div>
        </div>

      </div>

      {/* Stage-by-Stage Funnel Waterfall with Leak Callout */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-indigo-600" />
              Stage-by-Stage Funnel Leak Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Tracing {summary.totalLeads.toLocaleString()} leads across 5 operational milestones
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Largest Actionable Leak: Scheduled → Joined
          </span>
        </div>

        {/* Funnel Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          
          {/* Stage 1: Total Leads */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Step 1</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{summary.totalLeads.toLocaleString()}</div>
            <div className="text-xs font-semibold text-slate-700">Total Leads</div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              Inbound & Paid acquisition
            </div>
          </div>

          {/* Stage 2: Scheduled */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Step 2</div>
            <div className="text-xl font-extrabold text-indigo-600 mt-1">{summary.demosScheduled.toLocaleString()}</div>
            <div className="text-xs font-semibold text-slate-700">Demos Scheduled</div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              {summary.scheduledRate.toFixed(1)}% booking rate
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Lost: {(summary.totalLeads - summary.demosScheduled).toLocaleString()} (₹5.96M/mo)
            </div>
          </div>

          {/* Stage 3: Joined (THE LEAK) */}
          <div className="bg-rose-50/70 rounded-xl p-4 border-2 border-rose-400 shadow-xs relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Step 3 (LEAK!)</span>
              <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-extrabold">
                CRITICAL
              </span>
            </div>
            <div className="text-xl font-extrabold text-rose-700 mt-1">{summary.demosJoined.toLocaleString()}</div>
            <div className="text-xs font-bold text-rose-900">Demos Joined</div>
            <div className="mt-3 pt-2 border-t border-rose-200 text-[11px] font-bold text-rose-700">
              {summary.noShows.toLocaleString()} No-Shows ({summary.joinRate.toFixed(1)}% attendance)
            </div>
            <div className="text-[10px] font-extrabold text-rose-800 mt-0.5">
              💸 Lost: ~₹6.16M / month
            </div>
          </div>

          {/* Stage 4: Completed */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Step 4</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{summary.demosCompleted.toLocaleString()}</div>
            <div className="text-xs font-semibold text-slate-700">Demos Completed</div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              {summary.completionRate.toFixed(1)}% completion rate
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Drop: {(summary.demosJoined - summary.demosCompleted).toLocaleString()} during session
            </div>
          </div>

          {/* Stage 5: Converted */}
          <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-300">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Step 5</div>
            <div className="text-xl font-extrabold text-emerald-700 mt-1">{summary.converted.toLocaleString()}</div>
            <div className="text-xs font-bold text-emerald-900">Customers Converted</div>
            <div className="mt-3 pt-2 border-t border-emerald-200 text-[11px] text-emerald-800 font-semibold">
              {summary.conversionRate.toFixed(1)}% from completed
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-bold">
              {formatINR(summary.converted * 60000)} total value
            </div>
          </div>

        </div>

        {/* Why More Follow-ups Don't Work & Scientific Root Cause Callout */}
        <div className="mt-6 bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong className="font-bold text-amber-900">Why simply doing more follow-up calls fails: </strong>
              Testing shows that across <span className="font-bold underline">0 to 6 follow-up attempts</span>, customer conversion remains virtually flat around <span className="font-bold">7%–8%</span>. 
              High follow-up counts happen primarily because the demo was scheduled too far in the future. 
              The true root cause is <strong className="text-rose-700">lead staleness over time</strong>: parents forget their initial excitement or find alternatives. 
              The solution is the <strong>48-Hour Freshness Queue</strong>—bringing demo slots forward into the golden 48-hour window!
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Revenue Recovery Simulator */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              Interactive Impact Calculator
            </div>
            <h3 className="text-lg font-bold text-white mt-1.5">
              Revenue Simulator: Closing the 48-Hour Attendance Gap
            </h3>
            <p className="text-xs text-indigo-200/80 max-w-xl mt-0.5">
              Adjust the slider to see how preponing or reconfirming stale demo slots directly recovers lost revenue.
            </p>
          </div>

          <div className="bg-indigo-950/80 border border-indigo-700/60 rounded-xl p-3 px-5 text-right">
            <div className="text-[11px] text-indigo-300 font-semibold uppercase">Projected Monthly Lift</div>
            <div className="text-2xl font-extrabold text-amber-300">
              +{formatMillionINR(simMonthlyRevenue)}
              <span className="text-xs font-normal text-indigo-200">/mo</span>
            </div>
            <div className="text-[11px] text-indigo-300">
              +{simConversions} enrollments @ ₹60,000
            </div>
          </div>
        </div>

        {/* Slider control */}
        <div className="mt-6">
          <div className="flex justify-between items-center text-xs font-semibold text-indigo-200 mb-2">
            <span>Target rescue % of &gt;48h leads:</span>
            <span className="text-sm font-bold text-amber-300">{rescuePercent}% of {summary.longWaitCount.toLocaleString()} stale leads ({targetLongWaitRescued} leads)</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={rescuePercent}
            onChange={(e) => setRescuePercent(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-indigo-800/80 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-indigo-300/70 mt-1">
            <span>10% (Conservative testing)</span>
            <span>50% (Recommended target: ₹1.1M/mo)</span>
            <span>100% (Theoretical upper bound: ₹2.2M/mo)</span>
          </div>
        </div>

        {/* Simulated Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-indigo-800/60">
          <div className="bg-indigo-900/40 rounded-xl p-3.5 border border-indigo-700/50">
            <div className="text-[11px] text-indigo-300 uppercase font-semibold">Rescued Demos Joined</div>
            <div className="text-xl font-bold text-white mt-1">+{simAdditionalJoins} joins</div>
            <div className="text-[11px] text-indigo-300/80 mt-0.5">from 47% to 75% attendance</div>
          </div>

          <div className="bg-indigo-900/40 rounded-xl p-3.5 border border-indigo-700/50">
            <div className="text-[11px] text-indigo-300 uppercase font-semibold">Additional Enrolled Students</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">+{simConversions} students</div>
            <div className="text-[11px] text-indigo-300/80 mt-0.5">at 17.6% - 20.4% conversion</div>
          </div>

          <div className="bg-indigo-900/40 rounded-xl p-3.5 border border-indigo-700/50">
            <div className="text-[11px] text-indigo-300 uppercase font-semibold">2-Month Cumulative Gain</div>
            <div className="text-xl font-bold text-amber-300 mt-1">{formatMillionINR(simMonthlyRevenue * 2)}</div>
            <div className="text-[11px] text-indigo-300/80 mt-0.5">immediate operational ROI</div>
          </div>
        </div>
      </div>

      {/* Granular Breakdown Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Operational Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Evaluating where long-wait delays occur across channels, geographies, and shifts
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setBreakdownTab('source')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                breakdownTab === 'source' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Lead Source
            </button>
            <button
              onClick={() => setBreakdownTab('geo')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                breakdownTab === 'geo' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Geography
            </button>
            <button
              onClick={() => setBreakdownTab('rep')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                breakdownTab === 'rep' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Reps & Shifts
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          {breakdownTab === 'source' && (
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Lead Source</th>
                  <th className="py-2.5 px-3">Total Leads</th>
                  <th className="py-2.5 px-3">Demos Scheduled</th>
                  <th className="py-2.5 px-3">Stale Demos (&gt;48h)</th>
                  <th className="py-2.5 px-3">Join Rate</th>
                  <th className="py-2.5 px-3">Converted</th>
                  <th className="py-2.5 px-3">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sourceStats.map(item => (
                  <tr key={item.source} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.source}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.total}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.scheduled}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.longWait} ({item.scheduled > 0 ? Math.round((item.longWait / item.scheduled) * 100) : 0}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.joinRate.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{item.converted}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {breakdownTab === 'geo' && (
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Geography</th>
                  <th className="py-2.5 px-3">Total Leads</th>
                  <th className="py-2.5 px-3">Demos Scheduled</th>
                  <th className="py-2.5 px-3">Stale Demos (&gt;48h)</th>
                  <th className="py-2.5 px-3">Join Rate</th>
                  <th className="py-2.5 px-3">Converted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {geoStats.map(item => (
                  <tr key={item.geo} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.geo}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.total}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.scheduled}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.longWait}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.joinRate.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{item.converted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {breakdownTab === 'rep' && (
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Sales Rep</th>
                  <th className="py-2.5 px-3">Shift</th>
                  <th className="py-2.5 px-3">Assigned Leads</th>
                  <th className="py-2.5 px-3">Demos Scheduled</th>
                  <th className="py-2.5 px-3">Stale Demos (&gt;48h)</th>
                  <th className="py-2.5 px-3">Join Rate</th>
                  <th className="py-2.5 px-3">Converted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repStats.map(item => (
                  <tr key={item.rep} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.rep}</td>
                    <td className="py-2.5 px-3 text-slate-500">{item.shift}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.total}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.scheduled}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.longWait}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.joinRate.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{item.converted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
