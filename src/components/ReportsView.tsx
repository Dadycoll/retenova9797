import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Search, 
  Calendar, 
  User, 
  Hash,
  Sparkles
} from 'lucide-react';
import { ScreeningRecord } from '../types';

interface ReportsViewProps {
  records: ScreeningRecord[];
  onOpenReport: (record: ScreeningRecord) => void;
  onNewScreening: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  records,
  onOpenReport,
  onNewScreening
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = records.filter(r => 
    r.patient.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    r.patient.patientNumber.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div id="reports-view" className="space-y-4">
      
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Generated Screening Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured clinical report archive with exportable summaries and documentation
          </p>
        </div>

        <button
          type="button"
          onClick={onNewScreening}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
        >
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter reports by patient name or ID..."
          className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-200 focus:outline-none"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200 p-6">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No matching reports found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try searching another patient name or start a new screening.</p>
          </div>
        ) : (
          filtered.map((rec) => {
            return (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-mono font-bold text-[11px] text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      {rec.patient.patientNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rec.patient.examDate}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">
                    {rec.patient.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mb-2.5">
                    {rec.patient.age} yrs • {rec.patient.diabetesStatus}
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 mb-3 space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      AI Screening Result
                    </span>
                    <span className="text-[11px] font-semibold text-slate-800 block truncate" title={rec.overallCategory}>
                      {rec.overallCategory}
                    </span>
                  </div>

                  {/* Thumbnail previews of eyes */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="aspect-square bg-slate-950 rounded-md overflow-hidden flex items-center justify-center relative">
                      <img src={rec.leftResult.imageUrl} alt="Left OS" className="w-full h-full object-contain" />
                      <span className="absolute bottom-1 left-1 text-[8px] font-mono bg-black/80 text-white px-1 rounded">OS</span>
                    </div>
                    <div className="aspect-square bg-slate-950 rounded-md overflow-hidden flex items-center justify-center relative">
                      <img src={rec.rightResult.imageUrl} alt="Right OD" className="w-full h-full object-contain" />
                      <span className="absolute bottom-1 left-1 text-[8px] font-mono bg-black/80 text-white px-1 rounded">OD</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Bilateral Analysis
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenReport(rec)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>View Report</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
