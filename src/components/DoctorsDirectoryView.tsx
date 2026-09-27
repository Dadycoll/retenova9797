import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Star, 
  MapPin, 
  Phone, 
  Award, 
  UserCheck, 
  Clock, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  ArrowUpDown,
  Building,
  Check,
  Sparkles,
  X
} from 'lucide-react';
import { Doctor, ScreeningRecord } from '../types';
import { NEARBY_DOCTORS } from '../utils/doctorsData';

interface DoctorsDirectoryViewProps {
  records?: ScreeningRecord[];
  onBookReferral?: (doctorId: string, doctorName: string) => void;
}

export const DoctorsDirectoryView: React.FC<DoctorsDirectoryViewProps> = ({ 
  records = [],
  onBookReferral
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'experience'>('rating');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '2' | '5' | '10'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Referral Modal State
  const [referModalDoctor, setReferModalDoctor] = useState<Doctor | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [referralPriority, setReferralPriority] = useState<'Routine' | 'Urgent' | 'Follow-up'>('Urgent');
  const [referralDate, setReferralDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [referralNotes, setReferralNotes] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Filter and Sort Doctors
  const filteredDoctors = useMemo(() => {
    return NEARBY_DOCTORS.filter((doc) => {
      // Search
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.expertiseTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Distance
      let matchesDistance = true;
      if (distanceFilter === '2') matchesDistance = doc.distance <= 2.0;
      else if (distanceFilter === '5') matchesDistance = doc.distance <= 5.0;
      else if (distanceFilter === '10') matchesDistance = doc.distance <= 10.0;

      // Specialty
      const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

      return matchesSearch && matchesDistance && matchesSpecialty;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating; // highest rating first
      } else if (sortBy === 'distance') {
        return a.distance - b.distance; // closest distance first
      } else if (sortBy === 'experience') {
        return b.experience - a.experience; // most experienced first
      }
      return 0;
    });
  }, [searchQuery, sortBy, distanceFilter, selectedSpecialty]);

  const handleCopyNumber = (doctor: Doctor) => {
    navigator.clipboard.writeText(doctor.clinicNumber);
    setCopiedId(doctor.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenReferModal = (doctor: Doctor) => {
    setReferModalDoctor(doctor);
    setBookingSuccess(false);
    if (records.length > 0) {
      setSelectedPatientId(records[0].patient.id);
      const category = records[0].overallCategory;
      setReferralNotes(`Automated Retinal Screening Finding: "${category}". Patient referred for specialized ophthalmic consultation.`);
    } else {
      setReferralNotes('Screening evaluation indicates diabetic retinopathy risk. Referred for slit-lamp & dilated fundus examination.');
    }
  };

  const handleConfirmReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setReferModalDoctor(null);
      if (onBookReferral && referModalDoctor) {
        onBookReferral(referModalDoctor.id, referModalDoctor.name);
      }
    }, 1800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-[#161618] border border-[rgba(240,240,242,0.1)] rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#2dd4bf] font-semibold text-xs tracking-wider uppercase mb-1 font-mono">
              <Stethoscope className="w-4 h-4 text-[#2dd4bf]" />
              <span>Specialist Care Network</span>
            </div>
            <h2 className="font-syne text-xl font-bold text-[#f0f0f2] tracking-tight">Verified Vitreoretinal Surgeons</h2>
            <p className="text-xs text-[rgba(240,240,242,0.5)] mt-1 max-w-2xl">
              Connect patients directly with top-rated ophthalmologists and vitreoretinal surgeons specializing in diabetic eye disease, laser photocoagulation, and medical retina management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#1e1e21] border border-[rgba(240,240,242,0.1)] px-3.5 py-2 rounded text-center">
              <div className="text-[10px] text-[rgba(240,240,242,0.5)] font-mono uppercase">Nearest Specialist</div>
              <div className="text-sm font-mono font-bold text-[#2dd4bf]">1.2 km</div>
            </div>
            <div className="bg-[#1e1e21] border border-[rgba(240,240,242,0.1)] px-3.5 py-2 rounded text-center">
              <div className="text-[10px] text-[rgba(240,240,242,0.5)] font-mono uppercase">Top Satisfaction</div>
              <div className="text-sm font-mono font-bold text-[#f0f0f2]">4.96 ★</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-[rgba(240,240,242,0.08)] flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[rgba(240,240,242,0.4)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by doctor name, qualification, clinic, or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[rgba(240,240,242,0.1)] rounded text-sm bg-[#1e1e21] text-[#f0f0f2] focus:outline-none focus:border-[#2dd4bf] transition-all placeholder:text-[rgba(240,240,242,0.3)]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(240,240,242,0.4)] hover:text-[#f0f0f2]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[rgba(240,240,242,0.6)] bg-[#1e1e21] border border-[rgba(240,240,242,0.1)] px-2.5 py-1.5 rounded">
              <ArrowUpDown className="w-3.5 h-3.5 text-[rgba(240,240,242,0.4)]" />
              <span className="font-mono text-[10px] uppercase">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-[#f0f0f2] focus:outline-none cursor-pointer"
              >
                <option value="rating" className="bg-[#1e1e21] text-[#f0f0f2]">Best Rated (Highest first)</option>
                <option value="distance" className="bg-[#1e1e21] text-[#f0f0f2]">Proximity (Nearest first)</option>
                <option value="experience" className="bg-[#1e1e21] text-[#f0f0f2]">Experience (Years active)</option>
              </select>
            </div>

            {/* Distance Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[rgba(240,240,242,0.6)] bg-[#1e1e21] border border-[rgba(240,240,242,0.1)] px-2.5 py-1.5 rounded">
              <MapPin className="w-3.5 h-3.5 text-[rgba(240,240,242,0.4)]" />
              <span className="font-mono text-[10px] uppercase">Distance:</span>
              <select 
                value={distanceFilter} 
                onChange={(e) => setDistanceFilter(e.target.value as any)}
                className="bg-transparent font-semibold text-[#f0f0f2] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#1e1e21] text-[#f0f0f2]">Any distance</option>
                <option value="2" className="bg-[#1e1e21] text-[#f0f0f2]">Within 2 km</option>
                <option value="5" className="bg-[#1e1e21] text-[#f0f0f2]">Within 5 km</option>
                <option value="10" className="bg-[#1e1e21] text-[#f0f0f2]">Within 10 km</option>
              </select>
            </div>

            <div className="text-xs text-[rgba(240,240,242,0.4)] ml-auto lg:ml-0 font-mono">
              Showing <span className="font-bold text-[#f0f0f2]">{filteredDoctors.length}</span> specialists
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No specialists found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, widening the distance radius, or resetting filters.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setDistanceFilter('all'); setSortBy('rating'); }}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredDoctors.map((doc) => {
            const isTopRated = doc.rating >= 4.9;
            const isClosest = doc.distance <= 1.5;

            return (
              <div 
                key={doc.id}
                className="bg-[#161618] border border-[rgba(240,240,242,0.1)] hover:border-[#2dd4bf]/40 rounded-lg p-5 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Row with Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-black font-bold text-base shadow-xs shrink-0 ${doc.avatarColor || 'bg-[#2dd4bf]'}`}>
                        {doc.name.replace('Dr. ', '').charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-[#f0f0f2] font-syne">{doc.name}</h3>
                          {isTopRated && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20">
                              <Star className="w-3 h-3 fill-[#2dd4bf] text-[#2dd4bf]" />
                              Best Rated
                            </span>
                          )}
                          {isClosest && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20">
                              <MapPin className="w-3 h-3 text-[#2dd4bf]" />
                              Closest
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-[#2dd4bf] mt-0.5 font-mono">
                          {doc.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Rating Score */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1 bg-[#1e1e21] border border-[rgba(240,240,242,0.1)] px-2 py-1 rounded">
                        <Star className="w-3.5 h-3.5 fill-[#2dd4bf] text-[#2dd4bf]" />
                        <span className="text-xs font-mono font-bold text-[#f0f0f2]">{doc.rating.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] block mt-0.5">
                        {doc.reviewCount} reviews
                      </span>
                    </div>
                  </div>

                  {/* Doctor Details Grid: Age, Experience, Qualification, Distance */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-3 bg-[#1e1e21] rounded border border-[rgba(240,240,242,0.08)] text-xs">
                    {/* Age */}
                    <div>
                      <span className="text-[rgba(240,240,242,0.4)] block text-[10px] font-mono uppercase font-bold tracking-wider">Age</span>
                      <span className="font-semibold text-[#f0f0f2]">{doc.age} yrs</span>
                    </div>

                    {/* Experience */}
                    <div>
                      <span className="text-[rgba(240,240,242,0.4)] block text-[10px] font-mono uppercase font-bold tracking-wider">Experience</span>
                      <span className="font-bold text-[#2dd4bf]">{doc.experience} yrs active</span>
                    </div>

                    {/* Distance */}
                    <div>
                      <span className="text-[rgba(240,240,242,0.4)] block text-[10px] font-mono uppercase font-bold tracking-wider">Distance</span>
                      <span className="font-bold text-[#f0f0f2] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400 inline" />
                        {doc.distance} km
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="text-[rgba(240,240,242,0.4)] block text-[10px] font-mono uppercase font-bold tracking-wider">Referrals</span>
                      <span className={`font-semibold inline-flex items-center gap-1 font-mono text-xs ${doc.acceptingReferrals ? 'text-emerald-400' : 'text-[rgba(240,240,242,0.4)]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${doc.acceptingReferrals ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        {doc.acceptingReferrals ? 'Open' : 'Waitlist'}
                      </span>
                    </div>
                  </div>

                  {/* Qualification (Explicitly required) */}
                  <div className="mb-3 text-xs">
                    <span className="text-[rgba(240,240,242,0.4)] block text-[10px] font-mono uppercase font-bold tracking-wider mb-0.5">Qualification & Degrees</span>
                    <p className="text-[rgba(240,240,242,0.85)] font-medium leading-relaxed bg-[#1e1e21] border border-[rgba(240,240,242,0.08)] p-2 rounded">
                      {doc.qualification}
                    </p>
                  </div>

                  {/* Clinic Name, Number & Address (Explicitly required) */}
                  <div className="space-y-1.5 text-xs text-[rgba(240,240,242,0.7)] mb-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[rgba(240,240,242,0.4)] shrink-0" />
                      <span className="font-bold text-[#f0f0f2]">{doc.clinicName}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-[#1e1e21] p-2 rounded border border-[rgba(240,240,242,0.08)]">
                      <div className="flex items-center gap-2 font-mono text-[#f0f0f2] font-semibold text-xs">
                        <Phone className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                        <span>Clinic No: {doc.clinicNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a 
                          href={`tel:${doc.clinicNumber.replace(/[^0-9+]/g, '')}`}
                          className="px-2 py-0.5 text-[11px] font-semibold text-[#2dd4bf] hover:text-white bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 rounded hover:bg-[#2dd4bf]/20 transition-colors"
                        >
                          Call
                        </a>
                        <button 
                          onClick={() => handleCopyNumber(doc)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-[rgba(240,240,242,0.6)] hover:text-white bg-[#161618] border border-[rgba(240,240,242,0.15)] rounded hover:bg-[#1e1e21] transition-colors"
                          title="Copy clinic number"
                        >
                          {copiedId === doc.id ? (
                            <span className="text-emerald-400 flex items-center gap-0.5 font-mono">
                              <Check className="w-3 h-3" /> Copied
                            </span>
                          ) : (
                            'Copy'
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-[11px] text-[rgba(240,240,242,0.5)]">
                      <MapPin className="w-3.5 h-3.5 text-[rgba(240,240,242,0.4)] shrink-0 mt-0.5" />
                      <span>{doc.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[rgba(240,240,242,0.5)] pt-0.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[rgba(240,240,242,0.4)] shrink-0" />
                      <span>{doc.availability}</span>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {doc.expertiseTags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1e1e21] border border-[rgba(240,240,242,0.08)] text-[rgba(240,240,242,0.7)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-[rgba(240,240,242,0.08)] flex items-center justify-between gap-3">
                  <div className="text-xs text-[rgba(240,240,242,0.5)] font-mono">
                    Fee: <span className="font-semibold text-[#f0f0f2]">{doc.consultationFee}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a 
                      href={`tel:${doc.clinicNumber.replace(/[^0-9+]/g, '')}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>Call Clinic</span>
                    </a>

                    <button 
                      onClick={() => handleOpenReferModal(doc)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Refer / Book</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clinical Care Guidelines Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <Award className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">ICDR Clinical Referral Standards: </span>
          Patients diagnosed with <strong>Grade 2 (Moderate NPDR)</strong> should be evaluated within 2–4 months. Patients flagged with <strong>Grade 3 (Severe NPDR)</strong> or <strong>Grade 4 (Proliferative DR)</strong> require prompt vitreoretinal consultation within 24–72 hours for potential panretinal photocoagulation (PRP) or anti-VEGF intervention.
        </div>
      </div>

      {/* Book / Refer Modal */}
      {referModalDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Direct Patient Referral</h3>
                  <p className="text-xs text-slate-500">To {referModalDoctor.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setReferModalDoctor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {bookingSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Referral Request Transmitted!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Referral dossier dispatched to <strong>{referModalDoctor.clinicName}</strong> ({referModalDoctor.clinicNumber}). The patient record has been queued for immediate clinician triage.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmReferral} className="p-5 space-y-4">
                {/* Doctor Summary Banner */}
                <div className="bg-teal-50/70 border border-teal-100 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{referModalDoctor.clinicName}</span>
                    <span className="text-teal-700">{referModalDoctor.distance} km away</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-teal-600 inline" />
                    <span>Direct Clinic Line: {referModalDoctor.clinicNumber}</span>
                  </div>
                </div>

                {/* Patient Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Screening Patient
                  </label>
                  {records.length > 0 ? (
                    <select 
                      value={selectedPatientId} 
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      {records.map((r) => (
                        <option key={r.id} value={r.patient.id}>
                          {r.patient.name} ({r.patient.patientNumber}) — {r.overallCategory}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Enter patient name..."
                      defaultValue="Marcus Vance (PT-2026-1102)"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  )}
                </div>

                {/* Priority & Date Row */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Referral Urgency
                    </label>
                    <select 
                      value={referralPriority} 
                      onChange={(e) => setReferralPriority(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="Urgent">Urgent (Within 48 hours)</option>
                      <option value="Follow-up">Semi-Urgent (Within 1-2 weeks)</option>
                      <option value="Routine">Routine (Within 1-2 months)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Date
                    </label>
                    <input 
                      type="date"
                      value={referralDate}
                      onChange={(e) => setReferralDate(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Referral Notes & Indications
                  </label>
                  <textarea 
                    rows={3}
                    value={referralNotes}
                    onChange={(e) => setReferralNotes(e.target.value)}
                    placeholder="Enter clinical reason, fundus findings, or special patient requirements..."
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setReferModalDoctor(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Send Referral Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
