import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Globe,
  Tag,
  PhoneCall
} from 'lucide-react';
import { Lead } from '../types/crm';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  filterMode: 'all' | 'rescue_queue' | 'needs_action' | 'preponed' | 'reconfirmed' | 'noshows' | 'converted';
  setFilterMode: (mode: 'all' | 'rescue_queue' | 'needs_action' | 'preponed' | 'reconfirmed' | 'noshows' | 'converted') => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onSelectLead,
  filterMode,
  setFilterMode,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [geoFilter, setGeoFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'wait_desc' | 'created_desc' | 'status'>('wait_desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Unique dropdown values
  const uniqueReps = useMemo(() => Array.from(new Set(leads.map(l => l.rep_assigned).filter(Boolean))), [leads]);
  const uniqueGeos = useMemo(() => Array.from(new Set(leads.map(l => l.geography).filter(Boolean))), [leads]);
  const uniqueSources = useMemo(() => Array.from(new Set(leads.map(l => l.lead_source).filter(Boolean))), [leads]);

  // Counts for dropdown options
  const tabCounts = useMemo(() => {
    return {
      all: leads.length,
      rescue_queue: leads.filter(l => Boolean(l.demo_scheduled_at) && (l.hours_to_demo ?? 0) > 48).length,
      needs_action: leads.filter(l => Boolean(l.demo_scheduled_at) && (l.hours_to_demo ?? 0) > 48 && l.rescue_status === 'needs_action' && !l.demo_joined).length,
      preponed: leads.filter(l => l.rescue_status === 'slot_preponed').length,
      reconfirmed: leads.filter(l => l.rescue_status === 'reconfirmed').length,
      noshows: leads.filter(l => Boolean(l.demo_scheduled_at) && !l.demo_joined).length,
      converted: leads.filter(l => l.converted).length,
    };
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Filter mode from dropdown
    if (filterMode === 'rescue_queue') {
      result = result.filter(l => Boolean(l.demo_scheduled_at) && (l.hours_to_demo ?? 0) > 48);
    } else if (filterMode === 'needs_action') {
      result = result.filter(l => Boolean(l.demo_scheduled_at) && (l.hours_to_demo ?? 0) > 48 && l.rescue_status === 'needs_action' && !l.demo_joined);
    } else if (filterMode === 'preponed') {
      result = result.filter(l => l.rescue_status === 'slot_preponed');
    } else if (filterMode === 'reconfirmed') {
      result = result.filter(l => l.rescue_status === 'reconfirmed');
    } else if (filterMode === 'noshows') {
      result = result.filter(l => Boolean(l.demo_scheduled_at) && !l.demo_joined);
    } else if (filterMode === 'converted') {
      result = result.filter(l => l.converted);
    }

    // Dropdown filters
    if (repFilter !== 'all') {
      result = result.filter(l => l.rep_assigned === repFilter);
    }
    if (geoFilter !== 'all') {
      result = result.filter(l => l.geography === geoFilter);
    }
    if (sourceFilter !== 'all') {
      result = result.filter(l => l.lead_source === sourceFilter);
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.lead_id.toLowerCase().includes(q) ||
        (l.geography && l.geography.toLowerCase().includes(q)) ||
        (l.parent_timezone && l.parent_timezone.toLowerCase().includes(q)) ||
        (l.lead_source && l.lead_source.toLowerCase().includes(q)) ||
        (l.rep_assigned && l.rep_assigned.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'wait_desc') {
        return (b.hours_to_demo ?? 0) - (a.hours_to_demo ?? 0);
      }
      if (sortBy === 'created_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

    return result;
  }, [leads, filterMode, repFilter, geoFilter, sourceFilter, searchTerm, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage]);

  const formatDateShort = (isoStr: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Top Filter Bar with Single Dropdown */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          
          {/* Unified Queue / Status Dropdown Box */}
          <div className="flex items-center space-x-2">
            <label htmlFor="queue-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Queue / Status:
            </label>
            <select
              id="queue-select"
              value={filterMode}
              onChange={(e) => {
                setFilterMode(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Leads ({tabCounts.all})</option>
              <option value="rescue_queue">&gt;48h Rescue Queue ({tabCounts.rescue_queue})</option>
              <option value="needs_action">Action Needed ({tabCounts.needs_action})</option>
              <option value="preponed">⚡ Slot Preponed ({tabCounts.preponed})</option>
              <option value="reconfirmed">✅ Reconfirmed ({tabCounts.reconfirmed})</option>
              <option value="noshows">No-Shows ({tabCounts.noshows})</option>
              <option value="converted">🏆 Converted ({tabCounts.converted})</option>
            </select>
          </div>

          {/* Quick Sort */}
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="wait_desc">Wait Time (Longest Delay First)</option>
              <option value="created_desc">Most Recent Inquiry</option>
            </select>
          </div>

        </div>

        {/* Secondary Search & Demographic Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Lead ID, geography, source..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Geo Dropdown */}
          <div>
            <select
              value={geoFilter}
              onChange={(e) => { setGeoFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Geographies ({uniqueGeos.length})</option>
              {uniqueGeos.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Lead Source Dropdown */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Sources ({uniqueSources.length})</option>
              {uniqueSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sales Rep Dropdown */}
          <div>
            <select
              value={repFilter}
              onChange={(e) => { setRepFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Sales Reps ({uniqueReps.length})</option>
              {uniqueReps.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Lead ID & Source</th>
              <th className="py-3 px-4">Geography & Timezone</th>
              <th className="py-3 px-4">Wait Hours & Freshness</th>
              <th className="py-3 px-4">Scheduled Demo Time</th>
              <th className="py-3 px-4">Follow-ups</th>
              <th className="py-3 px-4">Milestones</th>
              <th className="py-3 px-4">Rescue Status</th>
              <th className="py-3 px-4 text-right">Rep Action Desk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No leads found matching criteria.</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting search or filter options.</p>
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const wait = lead.hours_to_demo ?? 0;
                const isOver48 = wait > 48;

                return (
                  <tr 
                    key={lead.lead_id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      isOver48 && !lead.demo_joined && lead.rescue_status === 'needs_action' 
                        ? 'bg-rose-50/30' 
                        : ''
                    }`}
                  >
                    {/* Lead ID & Source */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-900">{lead.lead_id}</span>
                        {isOver48 && !lead.demo_joined && (
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" title=">48h Stale Lead" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{lead.lead_source}</div>
                    </td>

                    {/* Geography & Timezone */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-slate-900 font-semibold">
                        <Globe className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{lead.geography}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lead.parent_timezone || 'UTC'}
                      </div>
                    </td>

                    {/* Wait Hours & Highlighting */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {lead.demo_scheduled_at ? (
                        <div>
                          {isOver48 ? (
                            <div className="inline-flex flex-col">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                                <Clock className="w-3.5 h-3.5 text-rose-600" />
                                {wait.toFixed(0)}h wait (&gt;48h)
                              </span>
                              <span className="text-[10px] text-rose-600 font-bold mt-0.5 ml-1">
                                🚨 -28% Join Risk
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {wait.toFixed(0)}h wait (&le;48h)
                              </span>
                              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 ml-1">
                                🟢 High Freshness (75%)
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Not scheduled</span>
                      )}
                    </td>

                    {/* Scheduled Demo Time */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {formatDateShort(lead.demo_scheduled_at)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Inquiry: {formatDateShort(lead.created_at)}
                      </div>
                    </td>

                    {/* Follow-up attempts */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <span>{lead.follow_up_attempts} calls</span>
                        {lead.follow_up_attempts > 2 && (
                          <span className="text-[10px] text-amber-600 font-medium" title="High follow-up volume without conversion">
                            (aging)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Milestones */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          lead.demo_joined ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {lead.demo_joined ? 'Joined' : 'Unjoined'}
                        </span>
                        {lead.converted && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Won
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rescue Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {lead.rescue_status === 'needs_action' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          ⚡ Action Needed
                        </span>
                      )}
                      {lead.rescue_status === 'slot_preponed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          ⚡ Slot Preponed
                        </span>
                      )}
                      {lead.rescue_status === 'reconfirmed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ Reconfirmed
                        </span>
                      )}
                      {lead.rescue_status === 'unrescued_noshow' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                          No-Show
                        </span>
                      )}
                      {lead.rescue_status === 'converted' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                          🏆 Won
                        </span>
                      )}
                    </td>

                    {/* Action Desk CTA */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isOver48 && lead.rescue_status === 'needs_action'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 animate-pulse'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Action Desk</span>
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{Math.min(filteredLeads.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
          <span className="font-semibold text-slate-800">{Math.min(filteredLeads.length, currentPage * pageSize)}</span> of{' '}
          <span className="font-semibold text-slate-800">{filteredLeads.length}</span> leads
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-2 font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
