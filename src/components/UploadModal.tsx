import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Layers 
} from 'lucide-react';
import { Lead } from '../types/crm';
import { parseExcelOrCsvFile, downloadSampleExcelTemplate } from '../utils/excelParser';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (leads: Lead[]) => void;
}

const REQUIRED_COLUMNS = [
  'lead_id',
  'lead_source',
  'geography',
  'parent_timezone',
  'created_at',
  'demo_scheduled_at',
  'rep_assigned',
  'rep_shift',
  'follow_up_attempts',
  'demo_joined',
  'demo_completed',
  'converted'
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  if (!isOpen) return null;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [parsedPreview, setParsedPreview] = useState<Lead[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const leads = await parseExcelOrCsvFile(file);
      if (leads.length === 0) {
        throw new Error('File contains no records.');
      }
      setParsedPreview(leads);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing spreadsheet file.');
      setParsedPreview(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview && parsedPreview.length > 0) {
      onDataLoaded(parsedPreview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Upload Excel / CSV Dataset
              </h2>
              <p className="text-xs text-slate-500">
                Import leads data to automatically detect and highlight &gt;48h funnel leaks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Expected Columns Guide */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Required Columns in your Spreadsheet:
              </span>
              <button
                onClick={downloadSampleExcelTemplate}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-[11px]"
              >
                <Download className="w-3 h-3" />
                Download Template (.xlsx)
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {REQUIRED_COLUMNS.map((col) => (
                <span key={col} className="px-2 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded text-slate-700">
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-sm font-bold text-slate-800">
              Drag & drop your Excel or CSV file here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports <strong className="text-slate-700">.xlsx, .xls, .csv</strong> files up to 50MB
            </p>
            <div className="mt-4">
              <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-50">
                Browse File
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="p-4 text-center text-xs text-slate-600 font-semibold animate-pulse">
              Parsing and validating spreadsheet data...
            </div>
          )}

          {/* Parsed Preview */}
          {parsedPreview && !isProcessing && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully read {parsedPreview.length.toLocaleString()} leads from "{fileName}"
                </span>
                <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  {parsedPreview.filter(l => l.is_long_wait).length} &gt;48h leads flagged
                </span>
              </div>

              <div className="p-3 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 font-medium">
                Sample preview (first 3 rows):
              </div>

              <div className="overflow-x-auto max-h-44">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="p-2">Lead ID</th>
                      <th className="p-2">Source</th>
                      <th className="p-2">Wait Hours</th>
                      <th className="p-2">Risk Status</th>
                      <th className="p-2">Rep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedPreview.slice(0, 3).map((l, i) => (
                      <tr key={i} className="hover:bg-white">
                        <td className="p-2 font-mono font-bold text-indigo-700">{l.lead_id}</td>
                        <td className="p-2 text-slate-700">{l.lead_source}</td>
                        <td className="p-2">
                          <span className={`font-bold ${l.is_long_wait ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {(l.hours_to_demo ?? 0).toFixed(0)}h
                          </span>
                        </td>
                        <td className="p-2">
                          {l.is_long_wait ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              &gt;48h Stale
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Fresh (&le;48h)
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-slate-600">{l.rep_assigned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            disabled={!parsedPreview || parsedPreview.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
          >
            Import {parsedPreview ? `${parsedPreview.length} Leads` : 'Data'}
          </button>
        </div>

      </div>
    </div>
  );
};
