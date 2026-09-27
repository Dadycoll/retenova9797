import React from 'react';
import { User, Hash, Calendar, Activity, Edit3 } from 'lucide-react';
import { PatientInfo } from '../types';

interface PatientDashboardCardProps {
  patient: PatientInfo;
  onEdit?: () => void;
}

export const PatientDashboardCard: React.FC<PatientDashboardCardProps> = ({
  patient,
  onEdit
}) => {
  return (
    <div id="patient-summary-dashboard-card" className="bg-slate-800 text-white rounded-xl px-5 sm:px-6 py-3 shadow-sm mb-4 border border-slate-700/80">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        
        {/* Dense Patient Details Row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold">Patient Name</p>
            <p className="text-sm font-semibold text-white tracking-tight">{patient.name || 'Not provided'} ({patient.sex || '—'}, {patient.age}y)</p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold">Patient ID</p>
            <p className="text-sm font-mono font-bold text-teal-400">{patient.patientNumber || 'Not provided'}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold">Diabetes Status</p>
            <p className="text-sm font-semibold text-white">
              {patient.diabetesStatus} {patient.diabetesDuration ? `(${patient.diabetesDuration})` : ''}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold">Latest HbA1c</p>
            <p className="text-sm font-semibold text-teal-300">{patient.hba1c || 'Not provided'}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold">Exam Date</p>
            <p className="text-sm font-mono text-slate-300">{patient.examDate || new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          {onEdit && (
            <button
              type="button"
              id="edit-patient-info-btn"
              onClick={onEdit}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-400" />
              <span>Edit Details</span>
            </button>
          )}
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium">
            Active Encounter
          </span>
        </div>

      </div>
    </div>
  );
};
