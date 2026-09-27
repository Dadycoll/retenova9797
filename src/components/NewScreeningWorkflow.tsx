import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Upload, 
  Activity, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { 
  PatientInfo, 
  EyeSide, 
  ImageQualityAssessment, 
  ScreeningRecord,
  EyeScreeningResult,
  BilateralComparison,
  ScreeningCategory
} from '../types';
import { PatientDetailsForm } from './PatientDetailsForm';
import { PatientDashboardCard } from './PatientDashboardCard';
import { RetinalImageUpload } from './RetinalImageUpload';
import { AIAnalysisWorkflow } from './AIAnalysisWorkflow';
import { ScreeningResultsDashboard } from './ScreeningResultsDashboard';
import { PatientReportModal } from './PatientReportModal';
import { screenEyeImage, generateBilateralComparison, determineOverallCategory } from '../utils/imageAnalysis';
import { saveRecord } from '../utils/sampleData';

interface NewScreeningWorkflowProps {
  initialPatient?: Partial<PatientInfo> | null;
  onWorkflowComplete: (record: ScreeningRecord) => void;
  onCancel: () => void;
}

type WorkflowStep = 'patient_form' | 'upload_images' | 'analyzing' | 'results';

export const NewScreeningWorkflow: React.FC<NewScreeningWorkflowProps> = ({
  initialPatient,
  onWorkflowComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('patient_form');
  const [patient, setPatient] = useState<PatientInfo | null>(null);

  // Uploaded images state
  const [leftImage, setLeftImage] = useState<string | null>(null);
  const [leftFileName, setLeftFileName] = useState<string | null>(null);
  const [leftQuality, setLeftQuality] = useState<ImageQualityAssessment | null>(null);

  const [rightImage, setRightImage] = useState<string | null>(null);
  const [rightFileName, setRightFileName] = useState<string | null>(null);
  const [rightQuality, setRightQuality] = useState<ImageQualityAssessment | null>(null);

  // Analysis results
  const [leftResult, setLeftResult] = useState<EyeScreeningResult | null>(null);
  const [rightResult, setRightResult] = useState<EyeScreeningResult | null>(null);
  const [bilateralComparison, setBilateralComparison] = useState<BilateralComparison | null>(null);
  const [overallCategory, setOverallCategory] = useState<ScreeningCategory | null>(null);
  const [completedRecord, setCompletedRecord] = useState<ScreeningRecord | null>(null);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);

  // Step 1 -> Step 2
  const handlePatientSubmit = (patientData: PatientInfo) => {
    setPatient(patientData);
    setCurrentStep('upload_images');
  };

  // Image change handler
  const handleImageChange = (
    side: EyeSide,
    dataUrl: string | null,
    fileName: string | null,
    quality: ImageQualityAssessment | null
  ) => {
    if (side === 'left') {
      setLeftImage(dataUrl);
      setLeftFileName(fileName);
      setLeftQuality(quality);
    } else {
      setRightImage(dataUrl);
      setRightFileName(fileName);
      setRightQuality(quality);
    }
  };

  // Launch analysis
  const handleStartAnalysis = () => {
    if (!leftImage || !rightImage) return;
    setCurrentStep('analyzing');
  };

  // When animation finishes, compute finalized results
  const handleAnalysisCompleted = async () => {
    if (!patient || !leftImage || !rightImage) return;

    const leftRes = await screenEyeImage(
      'left', 
      leftImage, 
      leftFileName || `${patient.patientNumber}_OS.jpg`
    );
    const rightRes = await screenEyeImage(
      'right', 
      rightImage, 
      rightFileName || `${patient.patientNumber}_OD.jpg`
    );

    const comp = generateBilateralComparison(leftRes, rightRes);
    const overall = determineOverallCategory(leftRes, rightRes);

    const record: ScreeningRecord = {
      id: `rec-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      patient,
      leftEyeImage: leftImage,
      leftEyeFileName: leftFileName || `${patient.patientNumber}_OS.jpg`,
      rightEyeImage: rightImage,
      rightEyeFileName: rightFileName || `${patient.patientNumber}_OD.jpg`,
      leftResult: leftRes,
      rightResult: rightRes,
      overallCategory: overall,
      bilateralComparison: comp,
      isDemo: false
    };

    setLeftResult(leftRes);
    setRightResult(rightRes);
    setBilateralComparison(comp);
    setOverallCategory(overall);
    setCompletedRecord(record);

    // Save to local registry
    saveRecord(record);
    onWorkflowComplete(record);

    setCurrentStep('results');
  };

  const handleReset = () => {
    setCurrentStep('patient_form');
    setPatient(null);
    setLeftImage(null);
    setLeftFileName(null);
    setLeftQuality(null);
    setRightImage(null);
    setRightFileName(null);
    setRightQuality(null);
    setLeftResult(null);
    setRightResult(null);
    setBilateralComparison(null);
    setOverallCategory(null);
    setCompletedRecord(null);
  };

  return (
    <div id="new-screening-workflow-view" className="space-y-6">
      
      {/* Workflow Navigation / Stepper Breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {currentStep !== 'patient_form' && (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 'upload_images') setCurrentStep('patient_form');
                else if (currentStep === 'results') setCurrentStep('upload_images');
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors mr-1"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            New Bilateral Retinal Screening
          </h2>
        </div>

        {/* Stepper indicators */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-semibold">
          
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
            currentStep === 'patient_form' ? 'bg-cyan-100 text-cyan-900' : 'text-slate-500'
          }`}>
            <span className="w-4 h-4 rounded-full bg-cyan-700 text-white text-[10px] flex items-center justify-center font-bold">1</span>
            <span>Patient Info</span>
          </div>

          <span className="text-slate-300">›</span>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
            currentStep === 'upload_images' ? 'bg-cyan-100 text-cyan-900' : 'text-slate-500'
          }`}>
            <span className="w-4 h-4 rounded-full bg-cyan-700 text-white text-[10px] flex items-center justify-center font-bold">2</span>
            <span>Image Upload & Quality</span>
          </div>

          <span className="text-slate-300">›</span>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
            currentStep === 'analyzing' || currentStep === 'results' ? 'bg-cyan-100 text-cyan-900' : 'text-slate-500'
          }`}>
            <span className="w-4 h-4 rounded-full bg-cyan-700 text-white text-[10px] flex items-center justify-center font-bold">3</span>
            <span>AI Results & Report</span>
          </div>

        </div>
      </div>

      {/* STEP 1: Patient Information Details Form */}
      {currentStep === 'patient_form' && (
        <PatientDetailsForm
          initialValues={patient || initialPatient || undefined}
          onSubmit={handlePatientSubmit}
          onCancel={onCancel}
        />
      )}

      {/* STEP 2: Patient Dashboard Card & Retinal Image Upload */}
      {currentStep === 'upload_images' && patient && (
        <div className="space-y-6">
          {/* Section 3: Patient Dashboard Card */}
          <PatientDashboardCard
            patient={patient}
            onEdit={() => setCurrentStep('patient_form')}
          />

          {/* Section 4: Retinal Image Upload with Quality Gates */}
          <RetinalImageUpload
            leftImage={leftImage}
            leftFileName={leftFileName}
            leftQuality={leftQuality}
            rightImage={rightImage}
            rightFileName={rightFileName}
            rightQuality={rightQuality}
            onImageChange={handleImageChange}
            onStartAnalysis={handleStartAnalysis}
          />
        </div>
      )}

      {/* STEP 3: Animated AI Analysis Workflow */}
      {currentStep === 'analyzing' && leftImage && rightImage && (
        <AIAnalysisWorkflow
          leftImageUrl={leftImage}
          rightImageUrl={rightImage}
          onComplete={handleAnalysisCompleted}
        />
      )}

      {/* STEP 4: Results Dashboard & Bilateral Comparison */}
      {currentStep === 'results' && patient && leftResult && rightResult && bilateralComparison && overallCategory && (
        <div className="space-y-6">
          {/* Top Patient Summary */}
          <PatientDashboardCard patient={patient} />

          <ScreeningResultsDashboard
            patient={patient}
            leftResult={leftResult}
            rightResult={rightResult}
            bilateralComparison={bilateralComparison}
            overallCategory={overallCategory}
            onGenerateReport={() => setShowReportModal(true)}
            onNewScreening={handleReset}
          />

          {/* Report Generation Modal */}
          {showReportModal && completedRecord && (
            <PatientReportModal
              record={completedRecord}
              onClose={() => setShowReportModal(false)}
              onNewScreening={() => {
                setShowReportModal(false);
                handleReset();
              }}
            />
          )}
        </div>
      )}

    </div>
  );
};
