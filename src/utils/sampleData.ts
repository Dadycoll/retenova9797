import { PatientInfo, ScreeningRecord, Booking } from '../types';
import { generateFundusDataUrl } from './sampleFundusGenerator';
import { screenEyeImage, generateBilateralComparison, determineOverallCategory } from './imageAnalysis';

const STORAGE_KEY = 'retinacare_records_v1';
const BOOKINGS_STORAGE_KEY = 'retinacare_bookings_v1';

export interface PresetDemoCase {
  id: string;
  name: string;
  description: string;
  patient: PatientInfo;
  leftType: 'normal' | 'mild_npdr' | 'moderate_npdr' | 'severe_npdr' | 'poor_glare';
  rightType: 'normal' | 'mild_npdr' | 'moderate_npdr' | 'severe_npdr' | 'poor_glare';
}

export const PRESET_DEMO_CASES: PresetDemoCase[] = [
  {
    id: 'case-asymmetric',
    name: 'Asymmetric Screening Case (Mild Left / Moderate Right)',
    description: 'Bilateral diabetic patient showing asymmetric microvascular findings between eyes.',
    leftType: 'mild_npdr',
    rightType: 'moderate_npdr',
    patient: {
      id: 'demo-pt-101',
      name: 'Eleanor Vance',
      patientNumber: 'RC-84920',
      age: 58,
      sex: 'Female',
      dateOfBirth: '1968-04-12',
      examDate: new Date(Date.now() - 86400000 * 42).toISOString().split('T')[0],
      contactNumber: '+1 (555) 234-8901',
      diabetesStatus: 'Type 2',
      diabetesDuration: '9 years',
      hba1c: '7.8%',
      bloodGlucose: '148 mg/dL',
      currentMedication: 'Metformin 1000mg BID, Glipizide 5mg daily',
      bloodPressure: '134/82 mmHg',
      historyHypertension: 'Yes',
      historyKidney: 'No',
      historyCardio: 'No',
      smokingStatus: 'No',
      previousEyeDisease: 'No',
      previousEyeSurgery: 'No',
      currentEyeSymptoms: 'Occasional mild blurriness when reading in evening; no floaters.',
      otherNotes: 'Last dilated eye exam was approximately 18 months ago.',
      confirmedAccuracy: true
    }
  },
  {
    id: 'case-normal',
    name: 'Normal Screening Case (Bilateral Healthy)',
    description: 'Clear fundus view with no detectable micro-vascular lesions in either eye.',
    leftType: 'normal',
    rightType: 'normal',
    patient: {
      id: 'demo-pt-102',
      name: 'Arthur Pendelton',
      patientNumber: 'RC-91044',
      age: 44,
      sex: 'Male',
      dateOfBirth: '1982-10-05',
      examDate: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
      contactNumber: '+1 (555) 891-2345',
      diabetesStatus: 'Type 2',
      diabetesDuration: '3 years',
      hba1c: '6.4%',
      bloodGlucose: '112 mg/dL',
      currentMedication: 'Metformin 500mg daily, lifestyle modifications',
      bloodPressure: '122/78 mmHg',
      historyHypertension: 'No',
      historyKidney: 'No',
      historyCardio: 'No',
      smokingStatus: 'No',
      previousEyeDisease: 'No',
      previousEyeSurgery: 'No',
      currentEyeSymptoms: 'Asymptomatic. Routine annual screening.',
      otherNotes: 'Patient wears corrective contact lenses for myopia (-2.25 D).',
      confirmedAccuracy: true
    }
  },
  {
    id: 'case-poor-quality',
    name: 'Poor Image Quality / Glare Test Case',
    description: 'Severe glare and corneal reflection demonstrating the safety quality-gate filter.',
    leftType: 'poor_glare',
    rightType: 'normal',
    patient: {
      id: 'demo-pt-103',
      name: 'Clara Oswald',
      patientNumber: 'RC-38112',
      age: 62,
      sex: 'Female',
      dateOfBirth: '1964-07-29',
      examDate: new Date(Date.now() - 86400000 * 24).toISOString().split('T')[0],
      contactNumber: '+1 (555) 432-6789',
      diabetesStatus: 'Type 1',
      diabetesDuration: '22 years',
      hba1c: '8.4%',
      bloodGlucose: '175 mg/dL',
      currentMedication: 'Insulin pump (lispro basal/bolus)',
      bloodPressure: '138/86 mmHg',
      historyHypertension: 'Yes',
      historyKidney: 'Yes',
      historyCardio: 'No',
      smokingStatus: 'No',
      previousEyeDisease: 'Yes',
      previousEyeSurgery: 'No',
      currentEyeSymptoms: 'Floaters reported in left eye over past month.',
      otherNotes: 'Patient experienced pupil constriction during image capture.',
      confirmedAccuracy: true
    }
  },
  {
    id: 'case-bilateral-mod',
    name: 'Bilateral Moderate Retinopathy Screening',
    description: 'Bilateral microaneurysms and hard exudates with suboptimal glycemic control.',
    leftType: 'moderate_npdr',
    rightType: 'moderate_npdr',
    patient: {
      id: 'demo-pt-104',
      name: 'David Miller',
      patientNumber: 'RC-55219',
      age: 53,
      sex: 'Male',
      dateOfBirth: '1973-02-18',
      examDate: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0],
      contactNumber: '+1 (555) 789-0123',
      diabetesStatus: 'Type 2',
      diabetesDuration: '11 years',
      hba1c: '7.9%',
      bloodGlucose: '158 mg/dL',
      currentMedication: 'Metformin 1000mg BID, Empagliflozin 10mg daily',
      bloodPressure: '136/84 mmHg',
      historyHypertension: 'Yes',
      historyKidney: 'No',
      historyCardio: 'No',
      smokingStatus: 'No',
      previousEyeDisease: 'No',
      previousEyeSurgery: 'No',
      currentEyeSymptoms: 'Occasional eye strain after computer work.',
      otherNotes: 'Referred by PCP for annual diabetic eye evaluation.',
      confirmedAccuracy: true
    }
  },
  {
    id: 'case-controlled',
    name: 'Well-Controlled Glycemic Routine Screening',
    description: 'Patient maintaining target HbA1c with healthy bilateral fundus findings.',
    leftType: 'normal',
    rightType: 'normal',
    patient: {
      id: 'demo-pt-105',
      name: 'Sophia Chen',
      patientNumber: 'RC-62908',
      age: 41,
      sex: 'Female',
      dateOfBirth: '1985-06-22',
      examDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      contactNumber: '+1 (555) 345-6789',
      diabetesStatus: 'Type 1',
      diabetesDuration: '6 years',
      hba1c: '6.7%',
      bloodGlucose: '118 mg/dL',
      currentMedication: 'Continuous subcutaneous insulin infusion (CSII)',
      bloodPressure: '118/74 mmHg',
      historyHypertension: 'No',
      historyKidney: 'No',
      historyCardio: 'No',
      smokingStatus: 'No',
      previousEyeDisease: 'No',
      previousEyeSurgery: 'No',
      currentEyeSymptoms: 'No vision complaints or symptoms.',
      otherNotes: 'Routine screening under endocrinology protocol.',
      confirmedAccuracy: true
    }
  }
];

export async function createInitialDemoRecords(): Promise<ScreeningRecord[]> {
  const records: ScreeningRecord[] = [];

  for (const demoCase of PRESET_DEMO_CASES) {
    const leftImg = generateFundusDataUrl({ type: demoCase.leftType, eye: 'left' });
    const rightImg = generateFundusDataUrl({ type: demoCase.rightType, eye: 'right' });

    const leftProfile = demoCase.leftType === 'poor_glare' ? 'poor' 
      : demoCase.leftType === 'mild_npdr' ? 'mild'
      : demoCase.leftType === 'moderate_npdr' ? 'moderate'
      : demoCase.leftType === 'severe_npdr' ? 'severe'
      : 'normal';

    const rightProfile = demoCase.rightType === 'poor_glare' ? 'poor' 
      : demoCase.rightType === 'mild_npdr' ? 'mild'
      : demoCase.rightType === 'moderate_npdr' ? 'moderate'
      : demoCase.rightType === 'severe_npdr' ? 'severe'
      : 'normal';

    const leftResult = await screenEyeImage('left', leftImg, `${demoCase.patient.patientNumber}_OS.jpg`, leftProfile);
    const rightResult = await screenEyeImage('right', rightImg, `${demoCase.patient.patientNumber}_OD.jpg`, rightProfile);
    const bilateralComparison = generateBilateralComparison(leftResult, rightResult);
    const overallCategory = determineOverallCategory(leftResult, rightResult);

    records.push({
      id: `rec-${demoCase.id}`,
      timestamp: new Date(demoCase.patient.examDate + 'T10:00:00.000Z').toISOString(),
      patient: demoCase.patient,
      leftEyeImage: leftImg,
      leftEyeFileName: `${demoCase.patient.patientNumber}_OS.jpg`,
      rightEyeImage: rightImg,
      rightEyeFileName: `${demoCase.patient.patientNumber}_OD.jpg`,
      leftResult,
      rightResult,
      overallCategory,
      bilateralComparison,
      isDemo: true,
      notes: 'Initial research verification record with de-identified patient data.'
    });
  }

  return records;
}

export function getStoredRecords(): ScreeningRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored records', e);
    return [];
  }
}

export function saveRecord(record: ScreeningRecord): void {
  try {
    const existing = getStoredRecords();
    const updated = [record, ...existing.filter(r => r.id !== record.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save record to localStorage', e);
  }
}

export function deleteRecordById(id: string): void {
  try {
    const existing = getStoredRecords();
    const filtered = existing.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete record', e);
  }
}

export function clearAllPatientData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BOOKINGS_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
}

export function getInitialSampleBookings(): Booking[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

  return [
    {
      id: 'book-201',
      patientName: 'Kavita Sundaram',
      patientAge: 61,
      patientSex: 'Female',
      contactNumber: '+91 98234 11092',
      examDate: today,
      timeSlot: '10:30 AM - 11:00 AM',
      diabetesStatus: 'Type 2',
      priority: 'Urgent',
      examType: 'Bilateral Comprehensive DR Screening',
      status: 'Confirmed',
      assignedClinician: 'Dr. Aris Thorne',
      notes: 'Complains of intermittent floaters and reduced nocturnal contrast. HbA1c 8.9%.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'book-202',
      patientName: 'Devraj Kapoor',
      patientAge: 52,
      patientSex: 'Male',
      contactNumber: '+91 98450 82194',
      examDate: tomorrow,
      timeSlot: '02:15 PM - 02:45 PM',
      diabetesStatus: 'Type 2',
      priority: 'Routine',
      examType: 'Annual Fundus Surveillance',
      status: 'Scheduled',
      assignedClinician: 'Dr. Sarah Jenkins',
      notes: 'Scheduled for baseline microvascular checkup. Dilated exam requested.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'book-203',
      patientName: 'Meera Deshmukh',
      patientAge: 47,
      patientSex: 'Female',
      contactNumber: '+91 97112 39044',
      examDate: nextWeek,
      timeSlot: '11:15 AM - 11:45 AM',
      diabetesStatus: 'Type 1',
      priority: 'Follow-up',
      examType: 'Post-Laser Macular Follow-up',
      status: 'Scheduled',
      assignedClinician: 'Dr. Aris Thorne',
      notes: '6-month post pan-retinal follow-up. Check for macular microaneurysms.',
      createdAt: new Date().toISOString()
    }
  ];
}

export function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSampleBookings();
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get stored bookings', e);
    return getInitialSampleBookings();
  }
}

export function saveBookingLocal(booking: Booking): void {
  try {
    const existing = getStoredBookings();
    const updated = [booking, ...existing.filter(b => b.id !== booking.id)];
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save booking locally', e);
  }
}

export function updateBookingStatusLocal(id: string, status: Booking['status']): void {
  try {
    const existing = getStoredBookings();
    const updated = existing.map(b => b.id === id ? { ...b, status } : b);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update booking status locally', e);
  }
}

export function deleteBookingLocal(id: string): void {
  try {
    const existing = getStoredBookings();
    const filtered = existing.filter(b => b.id !== id);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete booking locally', e);
  }
}

