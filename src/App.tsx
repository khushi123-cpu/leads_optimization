/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { RescueQueueBanner } from './components/RescueQueueBanner';
import { LeadTable } from './components/LeadTable';
import { CustomerRepModal } from './components/CustomerRepModal';
import { UploadModal } from './components/UploadModal';
import { RescueWorkflowGuide } from './components/RescueWorkflowGuide';
import { Lead } from './types/crm';
import { generateInitialLeads } from './utils/mockData';
import { BookOpen, Database } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(() => generateInitialLeads());
  const [filterMode, setFilterMode] = useState<'all' | 'rescue_queue' | 'needs_action' | 'preponed' | 'reconfirmed' | 'noshows' | 'converted'>('all');
  
  // Selected lead for Customer Rep pop-up
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Pending rescue count in current leads
  const pendingRescueCount = useMemo(() => {
    return leads.filter(l => Boolean(l.demo_scheduled_at) && (l.hours_to_demo ?? 0) > 48 && l.rescue_status === 'needs_action' && !l.demo_joined).length;
  }, [leads]);

  const totalLongWaitCount = useMemo(() => {
    return leads.filter(l => Boolean(l.demo_scheduled_at) && (l.hours_to_demo ?? 0) > 48).length;
  }, [leads]);

  const rescuedCount = useMemo(() => {
    return leads.filter(l => l.rescue_status === 'slot_preponed' || l.rescue_status === 'reconfirmed').length;
  }, [leads]);

  // Handler when user updates a lead in CustomerRepModal
  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.lead_id === updatedLead.lead_id ? updatedLead : l));
    setSelectedLead(updatedLead);
  };

  // Handler when new Excel/CSV data is imported
  const handleDataLoaded = (newLeads: Lead[]) => {
    setLeads(newLeads);
    setFilterMode('all');
  };

  const handleResetData = () => {
    setLeads(generateInitialLeads());
    setFilterMode('all');
  };

  const handleOpenRescueQueue = () => {
    setFilterMode('rescue_queue');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        leads={leads}
        onOpenUpload={() => setIsUploadOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Header with Stats Basis Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sales CRM & Customer Desk
            </h1>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              title="View 48-hour rescue standard operating procedure"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Operating SOP</span>
            </button>
          </div>

          {/* Active Leads indicator */}
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>{leads.length.toLocaleString()} Leads Active</span>
            </div>
          </div>
        </div>

        {/* Crisp & Small 48-Hour Demo Freshness Queue Banner */}
        <RescueQueueBanner
          onViewRescueQueue={handleOpenRescueQueue}
        />

        {/* Clean Top Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block tracking-wider">Total Leads</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{leads.length.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-medium">
              {leads.filter(l => l.demo_scheduled_at).length} scheduled demos
            </span>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
            <span className="text-[11px] font-bold text-rose-700 uppercase block tracking-wider">&gt;48h Stale Demos</span>
            <span className="text-xl font-extrabold text-rose-800 mt-0.5 block">{totalLongWaitCount}</span>
            <span className="text-[10px] text-rose-600 font-semibold">
              {pendingRescueCount} pending action
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block tracking-wider">Slots Rescued</span>
            <span className="text-xl font-extrabold text-indigo-700 mt-0.5 block">
              {rescuedCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {leads.filter(l => l.rescue_status === 'slot_preponed').length} preponed • {leads.filter(l => l.rescue_status === 'reconfirmed').length} reconfirmed
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block tracking-wider">Converted</span>
            <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block">
              {leads.filter(l => l.converted).length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Won enrollments</span>
          </div>
        </div>

        {/* Lead Table */}
        <LeadTable
          leads={leads}
          onSelectLead={(lead) => setSelectedLead(lead)}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
        />

      </main>

      {/* Customer Rep Handling Modal / Pop-up */}
      <CustomerRepModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
      />

      {/* Excel / CSV Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* Rescue Workflow Guide SOP Modal */}
      <RescueWorkflowGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            FreshQueue CRM • 48-Hour Demo Freshness & Lead Rescue Desk
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Upload Excel / CSV
            </button>
            <button
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
