import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  ScreeningRecord 
} from './types';
import { Header } from './components/Header';
import { NewScreeningWorkflow } from './components/NewScreeningWorkflow';
import { PatientsView } from './components/PatientsView';
import { ReportsView } from './components/ReportsView';
import { DoctorsDirectoryView } from './components/DoctorsDirectoryView';
import { PatientDashboardCard } from './components/PatientDashboardCard';
import { ScreeningResultsDashboard } from './components/ScreeningResultsDashboard';
import { PatientReportModal } from './components/PatientReportModal';
import { AuthGate } from './components/AuthGate';
import { AdminPortalView } from './components/AdminPortalView';
import { PatientInfo } from './types';
import { 
  getStoredRecords, 
  createInitialDemoRecords, 
  deleteRecordById, 
  saveRecord
} from './utils/sampleData';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  testFirestoreConnection,
  syncUserProfile,
  saveScreeningToFirestore,
  loadScreeningsFromFirestore,
  deleteScreeningFromFirestore
} from './lib/firebase';
import { User } from 'firebase/auth';
import { ArrowLeft, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('new_screening');
  const [records, setRecords] = useState<ScreeningRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Active selected record for detail inspection
  const [selectedRecord, setSelectedRecord] = useState<ScreeningRecord | null>(null);
  
  // Full report modal
  const [reportModalRecord, setReportModalRecord] = useState<ScreeningRecord | null>(null);

  // Pre-filled patient data from admin booking
  const [bookingPreFillPatient, setBookingPreFillPatient] = useState<Partial<PatientInfo> | null>(null);

  // Test Firestore connection on mount
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(true);

      if (currentUser) {
        // Authenticated user: Load records from Firestore
        try {
          // Sync user profile to Firestore
          await syncUserProfile(currentUser).catch(() => {});

          const cloudRecords = await loadScreeningsFromFirestore(currentUser.uid);
          if (cloudRecords && cloudRecords.length > 0) {
            setRecords(cloudRecords);
          } else {
            // If new user with no previous cloud records, seed demo records scoped to this user
            const demoInitial = await createInitialDemoRecords();
            const uidClean = currentUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 12);
            const seeded = demoInitial.map(r => ({
              ...r,
              id: `rec-${uidClean}-${r.id.replace(/^rec-/, '')}`,
              userId: currentUser.uid
            }));
            setRecords(seeded);
            for (const rec of seeded) {
              await saveScreeningToFirestore(rec, currentUser.uid).catch(e => 
                console.warn('Could not sync initial record to Firestore', e)
              );
            }
          }
        } catch (err) {
          console.error('Failed to load from Firestore, falling back to local storage', err);
          const local = getStoredRecords();
          setRecords(local);
        } finally {
          setIsLoading(false);
          setShowAuthModal(false);
        }
      } else {
        // Not logged in: check local storage if demo mode
        const stored = getStoredRecords();
        if (stored && stored.length > 0) {
          setRecords(stored);
        } else {
          try {
            const initial = await createInitialDemoRecords();
            setRecords(initial);
            initial.forEach(r => saveRecord(r));
          } catch (e) {
            console.error('Failed to create demo records', e);
          }
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsDemoMode(false);
      setSelectedRecord(null);
      setReportModalRecord(null);
    } catch (e) {
      console.error('Failed to sign out', e);
    }
  };

  const handleSelectRecord = (record: ScreeningRecord) => {
    setSelectedRecord(record);
  };

  const handleDeleteRecord = async (id: string) => {
    deleteRecordById(id);
    setRecords((prev) => prev.filter(r => r.id !== id));
    if (user) {
      deleteScreeningFromFirestore(id, user.uid).catch(e => 
        console.error('Failed to delete from Firestore', e)
      );
    }
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleWorkflowComplete = (newRecord: ScreeningRecord) => {
    const recordWithUser: ScreeningRecord = {
      ...newRecord,
      userId: user?.uid
    };
    saveRecord(recordWithUser);
    setRecords((prev) => [recordWithUser, ...prev.filter(r => r.id !== recordWithUser.id)]);

    if (user) {
      saveScreeningToFirestore(recordWithUser, user.uid).catch(e => 
        console.error('Failed to sync new screening to Firestore', e)
      );
    }
  };

  const handleNavigate = (tab: NavigationTab) => {
    setSelectedRecord(null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not logged in and hasn't chosen Demo Mode, display the Sign In / Sign Up Gate
  if (!user && !isDemoMode && !isLoading) {
    return (
      <AuthGate 
        onBypassDemo={() => {
          setIsDemoMode(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Main Navigation */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        user={user}
        isDemoMode={isDemoMode}
        onSignOut={handleSignOut}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-3">
            <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Loading RetinaCare screening records...</p>
            <p className="text-xs text-slate-400">Syncing clinical records</p>
          </div>
        ) : selectedRecord ? (
          /* Inspecting an individual screening record */
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4 pb-2">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to {currentTab === 'reports' ? 'Reports' : 'Patients'}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  Record ID: {selectedRecord.id}
                </span>
                {selectedRecord.isDemo && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-1 rounded-lg border border-blue-200">
                    DEMO DATA
                  </span>
                )}
                {user && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-1 rounded-lg border border-teal-200">
                    CLOUD SYNCED
                  </span>
                )}
              </div>
            </div>

            {/* Patient Dashboard Card */}
            <PatientDashboardCard patient={selectedRecord.patient} />

            {/* Full Screening Results Dashboard */}
            <ScreeningResultsDashboard
              patient={selectedRecord.patient}
              leftResult={selectedRecord.leftResult}
              rightResult={selectedRecord.rightResult}
              bilateralComparison={selectedRecord.bilateralComparison}
              overallCategory={selectedRecord.overallCategory}
              onGenerateReport={() => setReportModalRecord(selectedRecord)}
              onFindDoctors={() => {
                setSelectedRecord(null);
                setCurrentTab('doctors');
              }}
              onNewScreening={() => {
                setSelectedRecord(null);
                setCurrentTab('new_screening');
              }}
            />
          </div>
        ) : (
          /* Main Tab Views */
          <div>
            {currentTab === 'new_screening' && (
              <NewScreeningWorkflow
                initialPatient={bookingPreFillPatient}
                onWorkflowComplete={(newRecord) => {
                  setBookingPreFillPatient(null);
                  handleWorkflowComplete(newRecord);
                }}
                onCancel={() => {
                  setBookingPreFillPatient(null);
                  setCurrentTab('patients');
                }}
              />
            )}

            {currentTab === 'patients' && (
              <PatientsView
                records={records}
                onSelectRecord={handleSelectRecord}
                onDeleteRecord={handleDeleteRecord}
                onNewScreening={() => setCurrentTab('new_screening')}
              />
            )}

            {currentTab === 'doctors' && (
              <DoctorsDirectoryView
                records={records}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                records={records}
                onOpenReport={(rec) => setReportModalRecord(rec)}
                onNewScreening={() => setCurrentTab('new_screening')}
              />
            )}

            {currentTab === 'admin' && (
              <AdminPortalView
                currentUser={user}
                allRecords={records}
                onOpenReport={(rec) => setReportModalRecord(rec)}
                onSelectRecord={handleSelectRecord}
                onLaunchScreeningWithPatient={(patientData) => {
                  setBookingPreFillPatient({
                    name: patientData.name,
                    contactNumber: patientData.contactNumber,
                    age: patientData.age,
                    sex: patientData.sex || 'Female',
                    diabetesStatus: patientData.diabetesStatus || 'Type 2',
                    otherNotes: patientData.notes
                  });
                  setCurrentTab('new_screening');
                }}
              />
            )}
          </div>
        )}

      </main>

      {/* Global Patient Report Modal */}
      {reportModalRecord && (
        <PatientReportModal
          record={reportModalRecord}
          onClose={() => setReportModalRecord(null)}
          onNewScreening={() => {
            setReportModalRecord(null);
            setSelectedRecord(null);
            setCurrentTab('new_screening');
          }}
        />
      )}

      {/* Auth Modal when in demo mode and user clicks Sign In */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 z-60 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <AuthGate onBypassDemo={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
}

