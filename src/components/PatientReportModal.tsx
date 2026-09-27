import React from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  RotateCcw, 
  X, 
  ShieldAlert, 
  Calendar, 
  User, 
  Hash, 
  Activity, 
  Eye, 
  Scale, 
  Stethoscope,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ScreeningRecord } from '../types';

interface PatientReportModalProps {
  record: ScreeningRecord;
  onClose: () => void;
  onNewScreening: () => void;
}

export const PatientReportModal: React.FC<PatientReportModalProps> = ({
  record,
  onClose,
  onNewScreening
}) => {
  const { patient, leftResult, rightResult, bilateralComparison, overallCategory } = record;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportData = {
      title: 'RetinaCare AI Screening Report',
      generatedDate: new Date().toISOString(),
      patientInfo: {
        name: patient.name,
        patientNumber: patient.patientNumber,
        age: patient.age,
        sex: patient.sex,
        examDate: patient.examDate
      },
      healthInfo: {
        diabetesStatus: patient.diabetesStatus,
        diabetesDuration: patient.diabetesDuration || 'Not provided',
        hba1c: patient.hba1c || 'Not provided',
        bloodGlucose: patient.bloodGlucose || 'Not provided',
        bloodPressure: patient.bloodPressure || 'Not provided',
        hypertensionHistory: patient.historyHypertension,
        kidneyDiseaseHistory: patient.historyKidney,
        symptoms: patient.currentEyeSymptoms || 'Not provided'
      },
      screeningFindings: {
        overallCategory,
        leftEye: {
          screeningCategory: leftResult.screeningCategory,
          imageQuality: leftResult.imageQuality,
          findingsCount: leftResult.findingsCount,
          microaneurysms: leftResult.microaneurysmPresent,
          hemorrhages: leftResult.hemorrhagePresent,
          exudates: leftResult.exudatePresent
        },
        rightEye: {
          screeningCategory: rightResult.screeningCategory,
          imageQuality: rightResult.imageQuality,
          findingsCount: rightResult.findingsCount,
          microaneurysms: rightResult.microaneurysmPresent,
          hemorrhages: rightResult.hemorrhagePresent,
          exudates: rightResult.exudatePresent
        }
      },
      bilateralComparison: {
        summary: bilateralComparison.comparisonSummary,
        moreAffectedEye: bilateralComparison.moreAffectedEye,
        observations: bilateralComparison.asymmetryObservations
      },
      recommendations: bilateralComparison.recommendedNextStep,
      limitationsNotice: 'This application provides AI-assisted retinal image screening for informational and research purposes. It does not diagnose diabetes, determine diabetes stage, or replace a professional eye examination.'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RetinaCare_Report_${patient.patientNumber}_${patient.examDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm tracking-tight">Clinical Screening Report</span>
            <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {patient.patientNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="print-report-top-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              id="download-report-top-btn"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 text-xs sm:text-sm">
          
          {/* Header of the medical report */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-slate-900 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-extrabold tracking-tight text-slate-950">
                  RetinaCare AI
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                  SCREENING REPORT
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated Retinal Image Screening & Bilateral Comparison Protocol
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 font-mono">
              <div>Encounter ID: {record.id}</div>
              <div>Report Date: {new Date().toLocaleDateString()}</div>
              <div>Status: Research Protocol v2.4</div>
            </div>
          </div>

          {/* Section 1: Patient Information */}
          <div className="print-break-inside-avoid">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
              1. Patient Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">{patient.name || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Patient Number</span>
                <span className="font-bold font-mono text-cyan-900 text-sm">{patient.patientNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Age / Sex</span>
                <span className="font-semibold text-slate-800">{patient.age} yrs / {patient.sex}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Examination Date</span>
                <span className="font-semibold text-slate-800">{patient.examDate}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Health Information */}
          <div className="print-break-inside-avoid">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
              2. Baseline Health Context (Self-Reported / Clinical Records)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Diabetes Status</span>
                <span className="font-semibold text-slate-800">{patient.diabetesStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Diabetes Duration</span>
                <span className="font-semibold text-slate-800">{patient.diabetesDuration || 'Not provided.'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Recent HbA1c</span>
                <span className="font-semibold text-slate-800">{patient.hba1c || 'Not provided.'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Blood Glucose</span>
                <span className="font-semibold text-slate-800">{patient.bloodGlucose || 'Not provided.'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Blood Pressure</span>
                <span className="font-semibold text-slate-800">{patient.bloodPressure || 'Not provided.'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Hypertension</span>
                <span className="font-semibold text-slate-800">{patient.historyHypertension}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Kidney Disease</span>
                <span className="font-semibold text-slate-800">{patient.historyKidney}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Prior Eye Disease</span>
                <span className="font-semibold text-slate-800">{patient.previousEyeDisease}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Eye Images */}
          <div className="print-break-inside-avoid">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
              3. Retinal Images
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="aspect-square max-h-[190px] mx-auto bg-black rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  <img src={leftResult.imageUrl} alt="Left Eye" className="w-full h-full object-contain" />
                </div>
                <div className="font-bold text-xs text-slate-800">LEFT EYE (OS)</div>
                <div className="text-[11px] text-slate-500">Quality: {leftResult.imageQuality}</div>
              </div>

              <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="aspect-square max-h-[190px] mx-auto bg-black rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  <img src={rightResult.imageUrl} alt="Right Eye" className="w-full h-full object-contain" />
                </div>
                <div className="font-bold text-xs text-slate-800">RIGHT EYE (OD)</div>
                <div className="text-[11px] text-slate-500">Quality: {rightResult.imageQuality}</div>
              </div>
            </div>
          </div>

          {/* Section 4: AI Screening Findings */}
          <div className="print-break-inside-avoid">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
              4. AI Screening Findings
            </h4>
            
            <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-900 block mb-0.5">
                Overall AI Screening Category
              </span>
              <div className="text-lg font-extrabold text-cyan-950">
                {overallCategory}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Reflects feature extraction markers detected in retinal images. Does not determine diabetes severity or stage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Left Eye (OS) Findings:</div>
                <div>Category: <span className="font-semibold">{leftResult.screeningCategory}</span></div>
                <div>Microaneurysm-like: {leftResult.microaneurysmPresent === 'possible' ? '⚠ Possible finding' : '✓ No obvious finding'}</div>
                <div>Hemorrhage-like: {leftResult.hemorrhagePresent === 'possible' ? '⚠ Possible finding' : '✓ No obvious finding'}</div>
                <div>Exudate-like: {leftResult.exudatePresent === 'possible' ? '⚠ Possible finding' : '✓ No obvious finding'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Right Eye (OD) Findings:</div>
                <div>Category: <span className="font-semibold">{rightResult.screeningCategory}</span></div>
                <div>Microaneurysm-like: {rightResult.microaneurysmPresent === 'possible' ? '⚠ Possible finding' : '✓ No obvious finding'}</div>
                <div>Hemorrhage-like: {rightResult.hemorrhagePresent === 'possible' ? '⚠ Possible finding' : '✓ No obvious finding'}</div>
                <div>Exudate-like: {rightResult.exudatePresent === 'possible' ? '⚠ Possible finding' : '✓ No obvious finding'}</div>
              </div>
            </div>
          </div>

          {/* Section 5: Bilateral Comparison */}
          <div className="print-break-inside-avoid">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
              5. Bilateral Comparison Summary
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-900 mb-1">
                {bilateralComparison.comparisonSummary}
              </p>
              {bilateralComparison.asymmetryObservations.map((obs, idx) => (
                <div key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 mt-0.5">
                  <span>•</span>
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Recommendations */}
          <div className="print-break-inside-avoid">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
              6. Suggested Next Step
            </h4>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="font-bold text-slate-900 text-sm">
                “{bilateralComparison.recommendedNextStep}”
              </p>
            </div>
          </div>

          {/* Section 7: Limitations & Medical Disclaimer */}
          <div className="print-break-inside-avoid border-t-2 border-slate-200 pt-4">
            <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950 font-bold block mb-0.5">Clinical Limitations & AI Disclaimer:</strong>
                This application provides AI-assisted retinal image screening for informational and research purposes. It does not diagnose diabetes, determine diabetes stage, or replace a professional eye examination. AI results may be inaccurate. Consult a qualified healthcare professional for diagnosis and treatment decisions.
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions (hidden when printing) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500">
            RetinaCare AI Research Prototype • Strictly not for direct diagnostic billing
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              id="print-report-bottom-btn"
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              id="download-report-bottom-btn"
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            <button
              type="button"
              id="start-new-screening-modal-btn"
              onClick={() => {
                onClose();
                onNewScreening();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Screening</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
