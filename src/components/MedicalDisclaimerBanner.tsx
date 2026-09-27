import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface MedicalDisclaimerBannerProps {
  compact?: boolean;
}

export const MedicalDisclaimerBanner: React.FC<MedicalDisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div 
        id="medical-disclaimer-compact"
        className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] leading-tight text-amber-900 flex items-start gap-2 shadow-2xs"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong className="font-bold text-amber-950">Medical Disclaimer:</strong> This application provides AI-assisted retinal image screening for informational purposes. It does not diagnose diabetes or replace professional eye examinations. Consult a qualified healthcare professional for diagnosis.
        </p>
      </div>
    );
  }

  return (
    <div 
      id="medical-disclaimer-full"
      className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 sm:p-3.5 text-xs text-amber-900 shadow-2xs mb-4"
    >
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800 shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950 text-xs tracking-tight">
              Medical Screening Disclaimer
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-mono">
              Research Prototype
            </span>
          </div>
          <p className="text-[11px] text-amber-900/90 leading-snug">
            This application provides AI-assisted retinal image screening for informational and research purposes. It does not diagnose diabetes, determine diabetes stage, or replace a professional eye examination. AI results may be inaccurate. Consult a qualified healthcare professional for diagnosis and treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
