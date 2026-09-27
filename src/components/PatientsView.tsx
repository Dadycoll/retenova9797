import React, { useState } from 'react';
import { 
  Search, 
  Users, 
  Trash2, 
  Eye, 
  FileText, 
  Filter, 
  PlusCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ScreeningRecord } from '../types';

interface PatientsViewProps {
  records: ScreeningRecord[];
  onSelectRecord: (record: ScreeningRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNewScreening: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onNewScreening
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      rec.patient.name.toLowerCase().includes(term) ||
      rec.patient.patientNumber.toLowerCase().includes(term);

    const matchesCategory = 
      categoryFilter === 'all' || rec.overallCategory === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteRecord(id);
    setDeleteConfirmId(null);
  };

  return (
    <div id="patients-view" className="space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Patient Screening Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, review, and manage previous screening results and bilateral reports
          </p>
        </div>

        <button
          type="button"
          id="patient-view-new-screening-btn"
          onClick={onNewScreening}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Screening</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="patient-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Name or Number (e.g. RC-84920)..."
            className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 focus:outline-none"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            id="screening-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-200 focus:outline-none"
          >
            <option value="all">All Screening Categories</option>
            <option value="No obvious abnormality detected">No obvious abnormality</option>
            <option value="Possible mild retinal abnormalities">Possible mild abnormalities</option>
            <option value="Possible moderate retinal abnormalities">Possible moderate abnormalities</option>
            <option value="Possible severe retinal abnormalities">Possible severe abnormalities</option>
            <option value="Unable to assess reliably">Unable to assess reliably</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                <th className="py-2.5 px-3.5 sm:px-4">Date</th>
                <th className="py-2.5 px-3.5 sm:px-4">Patient Number</th>
                <th className="py-2.5 px-3.5 sm:px-4">Patient Name</th>
                <th className="py-2.5 px-3.5 sm:px-4">Overall Category</th>
                <th className="py-2.5 px-3.5 sm:px-4">Left Eye (OS)</th>
                <th className="py-2.5 px-3.5 sm:px-4">Right Eye (OD)</th>
                <th className="py-2.5 px-3.5 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isConfirming = deleteConfirmId === rec.id;

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => onSelectRecord(rec)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* Date */}
                      <td className="py-2.5 px-3.5 sm:px-4 text-slate-600 font-mono text-[11px]">
                        {rec.patient.examDate}
                      </td>

                      {/* Patient Number */}
                      <td className="py-2.5 px-3.5 sm:px-4 font-mono font-bold text-teal-900">
                        {rec.patient.patientNumber}
                      </td>

                      {/* Patient Name */}
                      <td className="py-2.5 px-3.5 sm:px-4 font-semibold text-slate-900">
                        {rec.patient.name}
                      </td>

                      {/* Screening Category */}
                      <td className="py-2.5 px-3.5 sm:px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                          {rec.overallCategory}
                        </span>
                      </td>

                      {/* Left-eye result */}
                      <td className="py-2.5 px-3.5 sm:px-4 text-slate-700">
                        <div className="font-medium truncate max-w-[150px]" title={rec.leftResult.screeningCategory}>
                          {rec.leftResult.screeningCategory}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Quality: {rec.leftResult.imageQuality}
                        </div>
                      </td>

                      {/* Right-eye result */}
                      <td className="py-2.5 px-3.5 sm:px-4 text-slate-700">
                        <div className="font-medium truncate max-w-[150px]" title={rec.rightResult.screeningCategory}>
                          {rec.rightResult.screeningCategory}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Quality: {rec.rightResult.imageQuality}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 sm:px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {isConfirming ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleDelete(rec.id, e)}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                              className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectRecord(rec)}
                              className="p-1 text-teal-700 hover:bg-teal-50 rounded transition-colors"
                              title="View Screening Analysis"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(rec.id); }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500">
          Showing {filteredRecords.length} of {records.length} total patient screening records. Sensitive medical histories are restricted to full report view.
        </div>
      </div>

    </div>
  );
};
