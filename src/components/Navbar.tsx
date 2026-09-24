import React from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  RotateCcw, 
  Flame 
} from 'lucide-react';
import { downloadSampleExcelTemplate, exportLeadsToExcel } from '../utils/excelParser';
import { Lead } from '../types/crm';

interface NavbarProps {
  leads: Lead[];
  onOpenUpload: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  leads,
  onOpenUpload,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">FreshQueue</span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            {/* Upload Excel Button */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Upload custom Excel or CSV file"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Excel / CSV</span>
            </button>

            {/* Download Template */}
            <button
              onClick={downloadSampleExcelTemplate}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              title="Download Excel format template"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Template</span>
            </button>

            {/* Export Leads */}
            <button
              onClick={() => exportLeadsToExcel(leads)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              title="Export leads to Excel"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset to calibrated benchmark dataset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
