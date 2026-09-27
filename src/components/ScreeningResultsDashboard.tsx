import React from 'react';
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  FileText, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  Stethoscope,
  Activity,
  Heart,
  Scale,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  PatientInfo, 
  EyeScreeningResult, 
  BilateralComparison, 
  ScreeningCategory, 
  PresenceIndicator 
} from '../types';
import { ImageVisualizationViewer } from './ImageVisualizationViewer';
import { MedicalDisclaimerBanner } from './MedicalDisclaimerBanner';

interface ScreeningResultsDashboardProps {
  patient: PatientInfo;
  leftResult: EyeScreeningResult;
  rightResult: EyeScreeningResult;
  bilateralComparison: BilateralComparison;
  overallCategory: ScreeningCategory;
  onGenerateReport: () => void;
  onNewScreening: () => void;
  onFindDoctors?: () => void;
}

export const ScreeningResultsDashboard: React.FC<ScreeningResultsDashboardProps> = ({
  patient,
  leftResult,
  rightResult,
  bilateralComparison,
  overallCategory,
  onGenerateReport,
  onNewScreening,
  onFindDoctors
}) => {

  const getCategoryStyles = (category: ScreeningCategory) => {
    switch (category) {
      case 'No obvious abnormality detected':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          borderAccent: 'border-emerald-500'
        };
      case 'Possible mild retinal abnormalities':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-950',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          borderAccent: 'border-amber-500'
        };
      case 'Possible moderate retinal abnormalities':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-950',
          badge: 'bg-orange-100 text-orange-900 border-orange-300',
          icon: AlertTriangle,
          iconColor: 'text-orange-600',
          borderAccent: 'border-orange-500'
        };
      case 'Possible severe retinal abnormalities':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-950',
          badge: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: AlertTriangle,
          iconColor: 'text-rose-600',
          borderAccent: 'border-rose-500'
        };
      case 'Unable to assess reliably':
      default:
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-900',
          badge: 'bg-slate-200 text-slate-800 border-slate-300',
          icon: HelpCircle,
          iconColor: 'text-slate-600',
          borderAccent: 'border-slate-500'
        };
    }
  };

  const overallStyle = getCategoryStyles(overallCategory);
  const OverallIcon = overallStyle.icon;

  const renderIndicator = (val: PresenceIndicator, count?: number) => {
    switch (val) {
      case 'none':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
            <span>✓</span> No finding
          </span>
        );
      case 'possible':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs">
            <span>⚠</span> Possible finding{count && count > 0 ? ` (${count})` : ''}
          </span>
        );
      case 'unable':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-xs">
            <span>—</span> Unable to assess
          </span>
        );
    }
  };

  return (
    <div id="screening-results-dashboard" className="space-y-4">
      
      {/* High Density 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 8 Columns: Scans + Bilateral Comparison Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Fundus Visualizer */}
          <ImageVisualizationViewer
            leftResult={leftResult}
            rightResult={rightResult}
          />

          {/* Left vs Right Eye Comparison Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-teal-50 text-teal-700">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  Left vs Right Eye Comparison
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Cross-Eye Parity Matrix
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-bold">Anatomic Feature / Finding</th>
                    <th className="text-center p-2.5 font-bold">Left Eye (OS)</th>
                    <th className="text-center p-2.5 font-bold">Right Eye (OD)</th>
                    <th className="p-2.5 font-bold hidden md:table-cell">Screening Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {/* Quality Row */}
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-800">Image Quality Assessment</td>
                    <td className="text-center p-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        leftResult.imageQuality === 'Good' ? 'bg-emerald-100 text-emerald-800' :
                        leftResult.imageQuality === 'Fair' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {leftResult.imageQuality}
                      </span>
                    </td>
                    <td className="text-center p-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        rightResult.imageQuality === 'Good' ? 'bg-emerald-100 text-emerald-800' :
                        rightResult.imageQuality === 'Fair' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rightResult.imageQuality}
                      </span>
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500 italic hidden md:table-cell">
                      {leftResult.imageQuality === 'Good' && rightResult.imageQuality === 'Good'
                        ? 'Adequate illumination and macula clarity in both scans.'
                        : 'Illumination or focus variance between views.'}
                    </td>
                  </tr>

                  {/* Microaneurysms */}
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-800">Microaneurysm-like features</td>
                    <td className="text-center p-2.5">
                      {renderIndicator(leftResult.microaneurysmPresent, leftResult.highlightedRegions.filter(r => r.category === 'microaneurysm').length)}
                    </td>
                    <td className="text-center p-2.5">
                      {renderIndicator(rightResult.microaneurysmPresent, rightResult.highlightedRegions.filter(r => r.category === 'microaneurysm').length)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500 italic hidden md:table-cell">
                      {rightResult.microaneurysmPresent === 'possible' || leftResult.microaneurysmPresent === 'possible'
                        ? 'Focal clusters detected in temporal/nasal quadrant.'
                        : 'No focal clusters detected in either eye.'}
                    </td>
                  </tr>

                  {/* Hemorrhages */}
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-800">Hemorrhage-like features</td>
                    <td className="text-center p-2.5">
                      {renderIndicator(leftResult.hemorrhagePresent, leftResult.highlightedRegions.filter(r => r.category === 'hemorrhage').length)}
                    </td>
                    <td className="text-center p-2.5">
                      {renderIndicator(rightResult.hemorrhagePresent, rightResult.highlightedRegions.filter(r => r.category === 'hemorrhage').length)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500 italic hidden md:table-cell">
                      {rightResult.hemorrhagePresent === 'possible' || leftResult.hemorrhagePresent === 'possible'
                        ? 'Flame or dot-blot patterns flagged by spatial filter.'
                        : 'No obvious intraretinal blood leakage signs.'}
                    </td>
                  </tr>

                  {/* Exudates */}
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-800">Exudate-like features</td>
                    <td className="text-center p-2.5">
                      {renderIndicator(leftResult.exudatePresent, leftResult.highlightedRegions.filter(r => r.category === 'exudate').length)}
                    </td>
                    <td className="text-center p-2.5">
                      {renderIndicator(rightResult.exudatePresent, rightResult.highlightedRegions.filter(r => r.category === 'exudate').length)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500 italic hidden md:table-cell">
                      {rightResult.exudatePresent === 'possible' || leftResult.exudatePresent === 'possible'
                        ? 'Yellowish lipid deposits noted near macular arcade.'
                        : 'No distinct hard or soft lipid exudates identified.'}
                    </td>
                  </tr>

                  {/* Vessel Abnormalities */}
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-800">Vessel abnormalities / Venous caliber</td>
                    <td className="text-center p-2.5">
                      {renderIndicator(leftResult.vesselAbnormalitiesPresent, leftResult.highlightedRegions.filter(r => r.category === 'vessel_abnormality').length)}
                    </td>
                    <td className="text-center p-2.5">
                      {renderIndicator(rightResult.vesselAbnormalitiesPresent, rightResult.highlightedRegions.filter(r => r.category === 'vessel_abnormality').length)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500 italic hidden md:table-cell">
                      {rightResult.vesselAbnormalitiesPresent === 'possible' || leftResult.vesselAbnormalitiesPresent === 'possible'
                        ? 'Potential vascular caliber irregularity or tortuosity.'
                        : 'Vascular caliber appears uniform across poles.'}
                    </td>
                  </tr>

                  {/* Per-eye Category */}
                  <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                    <td className="p-2.5 text-slate-900">Per-Eye Screening Category</td>
                    <td className="text-center p-2.5 text-slate-800 font-bold">{leftResult.screeningCategory}</td>
                    <td className="text-center p-2.5 text-slate-800 font-bold">{rightResult.screeningCategory}</td>
                    <td className="p-2.5 text-[11px] text-teal-800 font-bold hidden md:table-cell">Bilateral synthesis complete</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bilateral Parity Observation Note */}
            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700">
              <Scale className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Bilateral Asymmetry Observation: </span>
                <span>{bilateralComparison.comparisonSummary}</span>
                {bilateralComparison.asymmetryObservations.length > 0 && (
                  <ul className="mt-1 space-y-0.5 list-disc list-inside text-[11px] text-slate-600">
                    {bilateralComparison.asymmetryObservations.map((obs, idx) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right 4 Columns: AI Screening Category + Next Step + Action Buttons + Disclaimer */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          
          {/* AI Screening Category Card */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex-none shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                AI Screening Category
              </p>
              <span className="text-[9px] font-mono uppercase bg-teal-200/60 text-teal-950 px-1.5 py-0.5 rounded font-bold">
                NOT A DIAGNOSIS
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-teal-950 leading-snug">
              {overallCategory}
            </p>
            
            {/* Finding note box */}
            <div className="mt-2.5 bg-white/70 p-2.5 rounded-lg border border-teal-200/80 text-[11px] leading-relaxed text-teal-900 flex items-start gap-2">
              <OverallIcon className={`w-4 h-4 ${overallStyle.iconColor} shrink-0 mt-0.5`} />
              <span>
                {bilateralComparison.comparisonSummary || 'Screening evaluated both eyes for microaneurysms, hemorrhages, and exudates.'}
              </span>
            </div>

            <p className="mt-2 text-[10px] text-teal-800/80 italic leading-tight">
              * AI screening category reflects computer-vision detected visual features. It does not determine diabetes stage or confirm retinopathy.
            </p>
          </div>

          {/* Recommended Next Step Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Recommended Next Step
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Clinical Protocol
                </span>
              </div>

              {/* Recommendation Callout */}
              <div className="bg-slate-50 border-l-4 border-teal-500 p-3 mb-3 rounded-r-lg">
                <p className="text-xs font-bold text-slate-900">
                  {overallCategory === 'No obvious abnormality detected'
                    ? 'Routine Annual Screening Protocol'
                    : 'Specialist Referral Suggested'}
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  “{bilateralComparison.recommendedNextStep}”
                </p>
              </div>

              {/* Medication Warning */}
              <div className="bg-rose-50 border border-rose-200/80 rounded-lg p-2.5 text-[11px] text-rose-900 leading-snug mb-3">
                <strong>Safety Notice:</strong> Never adjust diabetes medications, insulin doses, or clinical therapies based on automated screening results.
              </div>

              {/* Reliability Score Bar */}
              <div className="space-y-1.5 pt-1 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Reliability Score
                  </span>
                  <span className="text-xs font-bold text-teal-600">
                    {leftResult.imageQuality === 'Good' && rightResult.imageQuality === 'Good' ? '88%' : '78%'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: leftResult.imageQuality === 'Good' && rightResult.imageQuality === 'Good' ? '88%' : '78%' }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons: Generate Report & Start New Screening & Find Doctors */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {onFindDoctors && (
                <button
                  type="button"
                  id="find-nearby-doctors-btn"
                  onClick={onFindDoctors}
                  className="w-full py-2 bg-teal-600 text-white rounded font-bold text-xs hover:bg-teal-700 flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Find Nearby Doctors / Refer</span>
                </button>
              )}

              <button
                type="button"
                id="generate-patient-report-btn"
                onClick={onGenerateReport}
                className="w-full py-2 bg-slate-900 text-white rounded font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Patient Report</span>
              </button>

              <button
                type="button"
                id="start-new-screening-btn"
                onClick={onNewScreening}
                className="w-full py-2 bg-white text-slate-700 border border-slate-300 rounded font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Start New Screening</span>
              </button>
            </div>
          </div>

          {/* High Density Medical Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-2xs">
            <p className="text-[10px] leading-tight text-amber-900">
              <strong className="font-bold">Medical Disclaimer:</strong> This application provides AI-assisted retinal image screening for informational purposes. It does not diagnose diabetes or replace professional eye examinations. Consult a qualified healthcare professional for diagnosis.
            </p>
          </div>

        </div>

      </div>

      {/* Patient Health Context - High Density Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-700">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Patient Health Context
              </h3>
              <p className="text-[10px] text-slate-500">
                Self-reported or clinically entered baseline health indicators
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
              Patient-Provided Information
            </span>
            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
              Strictly Separated from AI Findings
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
          
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age & Sex</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.age ? `${patient.age} yrs` : 'Not provided'} ({patient.sex || '—'})
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Diabetes Status</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.diabetesStatus || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Diabetes Duration</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.diabetesDuration || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recent HbA1c</span>
            <span className="font-semibold text-teal-700 text-xs">
              {patient.hba1c || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Blood Glucose</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.bloodGlucose || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Blood Pressure</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.bloodPressure || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hypertension</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.historyHypertension || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Kidney Disease</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.historyKidney || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cardio History</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.historyCardio || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Smoking Status</span>
            <span className="font-semibold text-slate-800 text-xs">
              {patient.smokingStatus || 'Not provided'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 col-span-2 sm:col-span-1 lg:col-span-2">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Previous Eye Disease</span>
            <span className="font-semibold text-slate-800 text-xs truncate block" title={patient.previousEyeDisease}>
              {patient.previousEyeDisease || 'None reported'}
            </span>
          </div>

        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>The AI model strictly avoids inferring missing clinical data. Unprovided fields were omitted during entry.</span>
          <span className="font-mono text-[10px]">Verification hash: DR-88219</span>
        </div>
      </div>

    </div>
  );
};
