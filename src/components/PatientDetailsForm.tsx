import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  FileCheck2, 
  Sparkles, 
  AlertCircle, 
  Info,
  Calendar,
  Phone,
  Clock,
  HeartPulse
} from 'lucide-react';
import { PatientInfo, DiabetesStatus, TriState } from '../types';
import { PRESET_DEMO_CASES } from '../utils/sampleData';

interface PatientDetailsFormProps {
  initialValues?: Partial<PatientInfo>;
  onSubmit: (patient: PatientInfo) => void;
  onCancel?: () => void;
}

export const PatientDetailsForm: React.FC<PatientDetailsFormProps> = ({
  initialValues,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<PatientInfo>({
    id: initialValues?.id || `pt-${Date.now().toString().slice(-6)}`,
    name: initialValues?.name || '',
    patientNumber: initialValues?.patientNumber || `RC-${Math.floor(10000 + Math.random() * 90000)}`,
    age: initialValues?.age || '',
    sex: initialValues?.sex || 'Female',
    dateOfBirth: initialValues?.dateOfBirth || '',
    examDate: initialValues?.examDate || new Date().toISOString().split('T')[0],
    contactNumber: initialValues?.contactNumber || '',
    
    // Diabetes Info
    diabetesStatus: initialValues?.diabetesStatus || 'Type 2',
    diabetesDuration: initialValues?.diabetesDuration || '',
    hba1c: initialValues?.hba1c || '',
    bloodGlucose: initialValues?.bloodGlucose || '',
    currentMedication: initialValues?.currentMedication || '',

    // Basic Health Info
    bloodPressure: initialValues?.bloodPressure || '',
    historyHypertension: initialValues?.historyHypertension || 'Unknown',
    historyKidney: initialValues?.historyKidney || 'Unknown',
    historyCardio: initialValues?.historyCardio || 'Unknown',
    smokingStatus: initialValues?.smokingStatus || 'Unknown',
    previousEyeDisease: initialValues?.previousEyeDisease || 'Unknown',
    previousEyeSurgery: initialValues?.previousEyeSurgery || 'Unknown',
    currentEyeSymptoms: initialValues?.currentEyeSymptoms || '',
    otherNotes: initialValues?.otherNotes || '',

    confirmedAccuracy: initialValues?.confirmedAccuracy || false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required.';
    }
    if (!formData.patientNumber.trim()) {
      newErrors.patientNumber = 'Patient ID / Number is required.';
    }
    if (!formData.age || Number(formData.age) < 1 || Number(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age between 1 and 120.';
    }
    if (!formData.examDate) {
      newErrors.examDate = 'Examination date is required.';
    }
    if (!formData.confirmedAccuracy) {
      newErrors.confirmedAccuracy = 'You must confirm the accuracy of data entry.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const loadPreset = (caseIndex: number) => {
    const preset = PRESET_DEMO_CASES[caseIndex];
    if (preset) {
      setFormData({
        ...preset.patient,
        id: `pt-${Date.now().toString().slice(-6)}`,
        examDate: new Date().toISOString().split('T')[0],
        confirmedAccuracy: true
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Demo helper banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs text-slate-700">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Quick fill realistic test case:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => loadPreset(0)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-800 text-slate-700 shadow-2xs transition-colors"
          >
            Sample: Eleanor Vance (T2D)
          </button>
          <button
            type="button"
            onClick={() => loadPreset(1)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-800 text-slate-700 shadow-2xs transition-colors"
          >
            Sample: Arthur Pendelton (Normal)
          </button>
        </div>
      </div>

      {/* SECTION 1: Basic Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">1. Basic Patient Information</h3>
            <p className="text-xs text-slate-500">Primary demographic and encounter tracking identifiers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Patient Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="patient-name-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jane Doe"
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-teal-500 focus:ring-teal-200'
              } focus:outline-none focus:ring-2`}
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Patient Number / ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Patient ID / Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="patient-number-input"
              value={formData.patientNumber}
              onChange={(e) => setFormData({ ...formData, patientNumber: e.target.value })}
              placeholder="e.g. RC-48291"
              className={`w-full px-3 py-2 rounded-lg text-sm border font-mono ${
                errors.patientNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-teal-500 focus:ring-teal-200'
              } focus:outline-none focus:ring-2`}
            />
            {errors.patientNumber && <p className="text-xs text-rose-600 mt-1">{errors.patientNumber}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              id="patient-age-input"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value ? Number(e.target.value) : '' })}
              placeholder="e.g. 56"
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                errors.age ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-teal-500 focus:ring-teal-200'
              } focus:outline-none focus:ring-2`}
            />
            {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
          </div>

          {/* Sex */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Sex
            </label>
            <select
              id="patient-sex-select"
              value={formData.sex}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none bg-white"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Date of Birth (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date of Birth <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              id="patient-dob-input"
              value={formData.dateOfBirth || ''}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
          </div>

          {/* Date of Examination */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date of Examination <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              id="patient-exam-date-input"
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                errors.examDate ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-teal-500 focus:ring-teal-200'
              } focus:outline-none focus:ring-2`}
            />
            {errors.examDate && <p className="text-xs text-rose-600 mt-1">{errors.examDate}</p>}
          </div>

          {/* Contact Number (optional) */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Contact Number <span className="text-slate-400 font-normal">(optional - de-identified format)</span>
            </label>
            <input
              type="tel"
              id="patient-contact-input"
              value={formData.contactNumber || ''}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="+91 98000 00000"
              className="w-full sm:max-w-xs px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Diabetes Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">2. Diabetes Information</h3>
              <p className="text-xs text-slate-500">Documented glycemic history and treatment background</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 hidden sm:inline-block">
            Not interpreted as medical diagnosis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Diabetes Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Diabetes Status
            </label>
            <select
              id="diabetes-status-select"
              value={formData.diabetesStatus}
              onChange={(e) => setFormData({ ...formData, diabetesStatus: e.target.value as DiabetesStatus })}
              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
              <option value="Gestational">Gestational</option>
              <option value="Prediabetes">Prediabetes</option>
              <option value="Unknown / Not diagnosed">Unknown / Not diagnosed</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Duration of Diabetes
            </label>
            <input
              type="text"
              id="diabetes-duration-input"
              value={formData.diabetesDuration || ''}
              onChange={(e) => setFormData({ ...formData, diabetesDuration: e.target.value })}
              placeholder="e.g. 7 years or Newly diagnosed"
              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
          </div>

          {/* HbA1c */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Most Recent HbA1c <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="patient-hba1c-input"
              value={formData.hba1c || ''}
              onChange={(e) => setFormData({ ...formData, hba1c: e.target.value })}
              placeholder="e.g. 7.2%"
              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
          </div>

          {/* Current Diabetes Medication */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Diabetes Medication <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="patient-medication-input"
              value={formData.currentMedication || ''}
              onChange={(e) => setFormData({ ...formData, currentMedication: e.target.value })}
              placeholder="e.g. Metformin 1000mg BID, Insulin glargine 20u"
              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Basic Health Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">3. Basic Health & Ophthalmic History</h3>
            <p className="text-xs text-slate-500">Co-morbidities, previous ocular interventions, and visual symptoms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
          {/* Blood Pressure */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Blood Pressure <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="patient-bp-input"
              value={formData.bloodPressure || ''}
              onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
              placeholder="e.g. 128/80 mmHg"
              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
          </div>

          {/* Hypertension */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              History of Hypertension
            </label>
            <div className="flex gap-2">
              {(['Yes', 'No', 'Unknown'] as TriState[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setFormData({ ...formData, historyHypertension: val })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    formData.historyHypertension === val
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {val === 'Unknown' ? 'Ukn' : val}
                </button>
              ))}
            </div>
          </div>

          {/* Kidney Disease */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              History of Kidney Disease
            </label>
            <div className="flex gap-2">
              {(['Yes', 'No', 'Unknown'] as TriState[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setFormData({ ...formData, historyKidney: val })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    formData.historyKidney === val
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {val === 'Unknown' ? 'Ukn' : val}
                </button>
              ))}
            </div>
          </div>

          {/* Smoking Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Smoking Status
            </label>
            <div className="flex gap-2">
              {(['Yes', 'No', 'Unknown'] as TriState[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setFormData({ ...formData, smokingStatus: val })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    formData.smokingStatus === val
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {val === 'Unknown' ? 'Ukn' : val}
                </button>
              ))}
            </div>
          </div>

          {/* Previous Eye Disease */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Previous Eye Disease <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.previousEyeDisease === 'Unknown' ? '' : formData.previousEyeDisease}
              onChange={(e) => setFormData({ ...formData, previousEyeDisease: e.target.value })}
              placeholder="e.g. Glaucoma, Cataract, None"
              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Confirmation & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            id="confirm-accuracy-checkbox"
            checked={formData.confirmedAccuracy}
            onChange={(e) => setFormData({ ...formData, confirmedAccuracy: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
          />
          <span className="text-xs sm:text-sm font-medium text-slate-800">
            I confirm the accuracy of data entry.
          </span>
        </label>
        {errors.confirmedAccuracy && (
          <p className="text-xs text-rose-600 font-medium ml-7">{errors.confirmedAccuracy}</p>
        )}

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Proceeding will open the Retinal Image Upload & Quality Check panel.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              id="submit-patient-details-btn"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-xs transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Continue to Retinal Upload</span>
            </button>
          </div>
        </div>
      </div>

    </form>
  );
};
