import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Scan, 
  Activity, 
  FileCheck, 
  Binary,
  Layers,
  Search,
  Eye
} from 'lucide-react';

interface AIAnalysisWorkflowProps {
  leftImageUrl: string;
  rightImageUrl: string;
  onComplete: () => void;
}

interface StepItem {
  id: number;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Quality Verification', description: 'Checking image illumination, focus clarity, and field-of-view coverage', icon: Scan },
  { id: 2, label: 'Fundus Preprocessing', description: 'Applying circular FOV crop and green-channel contrast enhancement (CLAHE)', icon: Layers },
  { id: 3, label: 'Microvascular Extraction', description: 'Segmenting retinal vessel tree and measuring vascular density', icon: Binary },
  { id: 4, label: 'Retinopathy Grading', description: 'Screening for microaneurysms, hemorrhages, and hard exudates', icon: Search },
  { id: 5, label: 'Bilateral Comparison', description: 'Calculating inter-eye symmetry and concordant disease presentation', icon: Activity },
  { id: 6, label: 'Report Generation', description: 'Compiling structured findings and clinical follow-up recommendations', icon: FileCheck },
];

export const AIAnalysisWorkflow: React.FC<AIAnalysisWorkflowProps> = ({
  leftImageUrl,
  rightImageUrl,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const stepDuration = 600; // ms per step
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 350);
          return 6;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercentage = Math.round((currentStep / 6) * 100);

  return (
    <div id="ai-analysis-workflow-container" className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              Retinal Analysis Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              Automated fundus preprocessing, feature extraction, and bilateral evaluation
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Processing Step:</span>
          <span className="text-teal-400 font-bold">{currentStep} of 6</span>
        </div>
      </div>

      {/* Retinal Fundus Image Previews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        
        {/* Left Eye Preview */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-3 aspect-square max-h-[220px] mx-auto flex items-center justify-center">
          <img
            src={leftImageUrl}
            alt="Left Eye (OS)"
            className="w-full h-full object-contain filter contrast-105"
          />
          <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-[11px] font-mono px-2 py-0.5 rounded text-teal-300 border border-slate-700">
            OS // Left Eye
          </div>
        </div>

        {/* Right Eye Preview */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-3 aspect-square max-h-[220px] mx-auto flex items-center justify-center">
          <img
            src={rightImageUrl}
            alt="Right Eye (OD)"
            className="w-full h-full object-contain filter contrast-105"
          />
          <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-[11px] font-mono px-2 py-0.5 rounded text-teal-300 border border-slate-700">
            OD // Right Eye
          </div>
        </div>

      </div>

      {/* Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">PROGRESS</span>
          <span className="text-teal-400 font-semibold">{progressPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Sequential Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all ${
                isCurrent 
                  ? 'bg-slate-800 border-teal-500/80 shadow-xs' 
                  : isDone 
                    ? 'bg-slate-800/60 border-slate-700/80 text-slate-300' 
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${
                    isCurrent ? 'bg-teal-500/20 text-teal-400' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Step {step.id}
                  </span>
                </div>

                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isCurrent && <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" />}
              </div>

              <h4 className="text-xs font-medium text-slate-200">
                {step.label}
              </h4>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400">
          Running feature extraction and bilateral analysis. Please keep this tab open.
        </p>
      </div>

    </div>
  );
};
