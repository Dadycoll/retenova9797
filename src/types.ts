export type EyeSide = 'left' | 'right';

export type DiabetesStatus = 
  | 'Type 1'
  | 'Type 2'
  | 'Gestational'
  | 'Prediabetes'
  | 'Unknown / Not diagnosed';

export type TriState = 'Yes' | 'No' | 'Unknown';

export interface PatientInfo {
  id: string;
  name: string;
  patientNumber: string;
  age: number | string;
  sex: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dateOfBirth?: string;
  examDate: string;
  contactNumber?: string;

  // Diabetes Information
  diabetesStatus: DiabetesStatus;
  diabetesDuration?: string;
  hba1c?: string;
  bloodGlucose?: string;
  currentMedication?: string;

  // Basic Health Information
  bloodPressure?: string;
  historyHypertension: TriState;
  historyKidney: TriState;
  historyCardio: TriState;
  smokingStatus: TriState;
  previousEyeDisease: TriState;
  previousEyeSurgery: TriState;
  currentEyeSymptoms?: string;
  otherNotes?: string;

  confirmedAccuracy: boolean;
}

export type QualityGrade = 'Good' | 'Fair' | 'Poor';

export interface ImageQualityAssessment {
  quality: QualityGrade;
  resolution: {
    width: number;
    height: number;
    megapixels: number;
  };
  blurScore: number; // 0-100, higher is sharper
  brightnessScore: number; // 0-255
  contrastScore: number; // standard deviation
  retinalVisibility: 'High' | 'Moderate' | 'Low';
  imageCompleteness: 'Complete' | 'Partial' | 'Obscured';
  isSuitable: boolean;
  warnings: string[];
}

export type FindingCategory = 
  | 'microaneurysm'
  | 'hemorrhage'
  | 'exudate'
  | 'vessel_abnormality'
  | 'other_suspicious';

export interface AIHighlightRegion {
  id: string;
  category: FindingCategory;
  title: string;
  plainLanguageExplanation: string;
  xPercent: number; // 0 - 100%
  yPercent: number; // 0 - 100%
  radiusPercent: number;
  confidenceScore: number;
  severityWeight: 'mild' | 'moderate' | 'marked';
}

export type PresenceIndicator = 'none' | 'possible' | 'unable';

export type ScreeningCategory =
  | 'No obvious abnormality detected'
  | 'Possible mild retinal abnormalities'
  | 'Possible moderate retinal abnormalities'
  | 'Possible severe retinal abnormalities'
  | 'Unable to assess reliably';

export interface EyeScreeningResult {
  eye: EyeSide;
  imageUrl: string;
  imageFileName: string;
  imageQuality: QualityGrade;
  qualityDetails: ImageQualityAssessment;
  microaneurysmPresent: PresenceIndicator;
  hemorrhagePresent: PresenceIndicator;
  exudatePresent: PresenceIndicator;
  vesselAbnormalitiesPresent: PresenceIndicator;
  highlightedRegions: AIHighlightRegion[];
  screeningCategory: ScreeningCategory;
  findingsCount: number;
  clinicalNotes: string;
}

export type NextStepTier = 
  | 'low_concern'
  | 'possible_abnormalities'
  | 'potentially_serious'
  | 'poor_quality';

export interface BilateralComparison {
  moreAffectedEye: 'left' | 'right' | 'symmetric' | 'neither' | 'unable';
  comparisonSummary: string;
  asymmetryObservations: string[];
  recommendedNextStep: string;
  recommendedStepTier: NextStepTier;
}

export interface ScreeningRecord {
  id: string;
  userId?: string;
  timestamp: string;
  patient: PatientInfo;
  leftEyeImage: string;
  leftEyeFileName: string;
  rightEyeImage: string;
  rightEyeFileName: string;
  leftResult: EyeScreeningResult;
  rightResult: EyeScreeningResult;
  overallCategory: ScreeningCategory;
  bilateralComparison: BilateralComparison;
  isDemo: boolean;
  notes?: string;
}

export interface Booking {
  id: string;
  patientName: string;
  patientAge?: number | string;
  patientSex?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  contactNumber: string;
  examDate: string;
  timeSlot?: string;
  diabetesStatus?: DiabetesStatus | string;
  priority: 'Routine' | 'Urgent' | 'Follow-up';
  examType: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  assignedClinician?: string;
  notes?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  age: number;
  experience: number; // in years
  qualification: string;
  specialty: string;
  clinicName: string;
  clinicNumber: string;
  address: string;
  distance: number; // in km
  rating: number; // 0-5
  reviewCount: number;
  consultationFee: string;
  availability: string;
  acceptingReferrals: boolean;
  avatarColor?: string;
  expertiseTags: string[];
}

export type NavigationTab = 
  | 'new_screening'
  | 'patients'
  | 'doctors'
  | 'reports'
  | 'admin';

