import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Sliders, 
  Sparkles,
  Info
} from 'lucide-react';
import { EyeSide, ImageQualityAssessment, QualityGrade } from '../types';
import { assessImageQuality } from '../utils/imageAnalysis';
import { generateFundusDataUrl } from '../utils/sampleFundusGenerator';

interface RetinalImageUploadProps {
  leftImage: string | null;
  leftFileName: string | null;
  leftQuality: ImageQualityAssessment | null;
  rightImage: string | null;
  rightFileName: string | null;
  rightQuality: ImageQualityAssessment | null;
  onImageChange: (side: EyeSide, dataUrl: string | null, fileName: string | null, quality: ImageQualityAssessment | null) => void;
  onStartAnalysis: () => void;
}

export const RetinalImageUpload: React.FC<RetinalImageUploadProps> = ({
  leftImage,
  leftFileName,
  leftQuality,
  rightImage,
  rightFileName,
  rightQuality,
  onImageChange,
  onStartAnalysis
}) => {
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  const [leftDragging, setLeftDragging] = useState(false);
  const [rightDragging, setRightDragging] = useState(false);
  const [analyzingLeftQuality, setAnalyzingLeftQuality] = useState(false);
  const [analyzingRightQuality, setAnalyzingRightQuality] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileProcess = async (file: File, side: EyeSide) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(`Unsupported file type: ${file.name}. Only JPG, JPEG, and PNG are supported.`);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File exceeds maximum size of 20MB.');
      return;
    }

    const reader = new FileReader();
    if (side === 'left') setAnalyzingLeftQuality(true);
    else setAnalyzingRightQuality(true);

    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const quality = await assessImageQuality(dataUrl, file.name);
        onImageChange(side, dataUrl, file.name, quality);
      } catch (err) {
        console.error('Quality assessment failed', err);
        setErrorMessage('Failed to decode and evaluate image quality.');
      } finally {
        if (side === 'left') setAnalyzingLeftQuality(false);
        else setAnalyzingRightQuality(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Error reading image file.');
      if (side === 'left') setAnalyzingLeftQuality(false);
      else setAnalyzingRightQuality(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, side: EyeSide) => {
    e.preventDefault();
    if (side === 'left') setLeftDragging(false);
    else setRightDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0], side);
    }
  };

  // Quick preset loader helper
  const loadPresetPair = async (presetType: 'asymmetric' | 'normal' | 'poor') => {
    setErrorMessage(null);
    setAnalyzingLeftQuality(true);
    setAnalyzingRightQuality(true);

    let leftOpt: 'normal' | 'mild_npdr' | 'poor_glare' = 'mild_npdr';
    let rightOpt: 'normal' | 'moderate_npdr' | 'poor_glare' = 'moderate_npdr';

    if (presetType === 'normal') {
      leftOpt = 'normal';
      rightOpt = 'normal';
    } else if (presetType === 'poor') {
      leftOpt = 'poor_glare';
      rightOpt = 'normal';
    }

    const leftData = generateFundusDataUrl({ type: leftOpt, eye: 'left' });
    const rightData = generateFundusDataUrl({ type: rightOpt, eye: 'right' });

    const leftQ = await assessImageQuality(leftData, `Sample_${leftOpt}_OS.jpg`);
    const rightQ = await assessImageQuality(rightData, `Sample_${rightOpt}_OD.jpg`);

    onImageChange('left', leftData, `Sample_${leftOpt}_OS.jpg`, leftQ);
    onImageChange('right', rightData, `Sample_${rightOpt}_OD.jpg`, rightQ);

    setAnalyzingLeftQuality(false);
    setAnalyzingRightQuality(false);
  };

  const renderQualityBadge = (quality: QualityGrade) => {
    switch (quality) {
      case 'Good':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Image Quality: Good
          </span>
        );
      case 'Fair':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Image Quality: Fair
          </span>
        );
      case 'Poor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Image Quality: Poor
          </span>
        );
    }
  };

  const renderPanel = (
    side: EyeSide, 
    label: string, 
    sublabel: string,
    image: string | null, 
    fileName: string | null, 
    quality: ImageQualityAssessment | null,
    isDragging: boolean,
    setIsDragging: (val: boolean) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
    isAnalyzing: boolean
  ) => {
    return (
      <div 
        id={`upload-panel-${side}-eye`}
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">{label}</h4>
                <p className="text-[11px] font-medium text-slate-500">{sublabel}</p>
              </div>
            </div>
            {quality && renderQualityBadge(quality.quality)}
          </div>

          <input
            type="file"
            ref={inputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0], side);
              }
            }}
            accept=".jpg,.jpeg,.png"
            className="hidden"
          />

          {/* Upload Area / Preview */}
          {!image ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, side)}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-teal-500 bg-teal-50/60 scale-[1.01]' 
                  : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/80 bg-slate-50/40'
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-semibold text-slate-800 mb-1">
                Upload {label} Retinal Image
              </h5>
              <p className="text-xs text-slate-500 mb-3">
                Drag and drop fundus image, or click to browse
              </p>
              <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-200/70 text-slate-700">
                JPG, JPEG, PNG (Max 20MB)
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Container */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-square max-h-[300px] mx-auto border border-slate-200 flex items-center justify-center shadow-inner">
                <img
                  src={image}
                  alt={`${label} Preview`}
                  className="w-full h-full object-contain"
                />
                
                {/* Image overlay badge */}
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                  {side === 'left' ? 'OS (Left)' : 'OD (Right)'}
                </div>

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white p-4 text-center">
                    <RefreshCw className="w-7 h-7 animate-spin text-cyan-400 mb-2" />
                    <p className="text-xs font-medium">Checking image quality metrics...</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 truncate max-w-[160px] font-mono" title={fileName || ''}>
                  {fileName || 'retinal_image.jpg'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onImageChange(side, null, null, null)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quality Assessment Breakdown */}
        {quality && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span>Automated Image Quality Metrics</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div>
                <span className="text-slate-400 block">Resolution</span>
                <span className="font-semibold text-slate-800">
                  {quality.resolution.width}×{quality.resolution.height}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Sharpness</span>
                <span className={`font-semibold ${quality.blurScore < 30 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {quality.blurScore}/100
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Retina Visibility</span>
                <span className={`font-semibold ${quality.retinalVisibility === 'Low' ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {quality.retinalVisibility}
                </span>
              </div>
            </div>

            {/* Quality Warnings / Disclaimers */}
            {quality.quality === 'Poor' && (
              <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-medium leading-tight">
                  “This image may not be suitable for reliable AI screening. Please upload a clearer retinal image.”
                </p>
              </div>
            )}
            {quality.quality === 'Fair' && quality.warnings.length > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-tight text-[11px]">
                  {quality.warnings[0]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const hasBothImages = Boolean(leftImage && rightImage);
  const isAnyPoor = leftQuality?.quality === 'Poor' || rightQuality?.quality === 'Poor';

  return (
    <div className="space-y-6">
      
      {/* Quick preset selector for instant demonstration */}
      <div className="bg-gradient-to-r from-teal-50/80 via-cyan-50/50 to-white rounded-xl border border-teal-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              One-Click Demonstration Cases
            </h5>
            <p className="text-xs text-slate-600">
              Test bilateral screening immediately with synthesized clinical fundus photography
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => loadPresetPair('asymmetric')}
            disabled={analyzingLeftQuality || analyzingRightQuality}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-teal-300 text-teal-900 hover:bg-teal-50 shadow-2xs transition-colors"
          >
            Load Asymmetric Case (OS Mild / OD Moderate)
          </button>
          <button
            type="button"
            onClick={() => loadPresetPair('normal')}
            disabled={analyzingLeftQuality || analyzingRightQuality}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            Load Bilateral Normal
          </button>
          <button
            type="button"
            onClick={() => loadPresetPair('poor')}
            disabled={analyzingLeftQuality || analyzingRightQuality}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 shadow-2xs transition-colors"
          >
            Load Poor Quality / Glare
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold text-rose-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two Large Upload Panels (Left Eye and Right Eye) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderPanel(
          'left',
          'LEFT EYE (OS - Oculum Sinistrum)',
          'Nasal disc positioned on right side of image',
          leftImage,
          leftFileName,
          leftQuality,
          leftDragging,
          setLeftDragging,
          leftInputRef,
          analyzingLeftQuality
        )}

        {renderPanel(
          'right',
          'RIGHT EYE (OD - Oculum Dextrum)',
          'Nasal disc positioned on left side of image',
          rightImage,
          rightFileName,
          rightQuality,
          rightDragging,
          setRightDragging,
          rightInputRef,
          analyzingRightQuality
        )}
      </div>

      {/* Analysis Launch Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Ready for Automated Retinal Screening
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {!hasBothImages 
              ? 'Please upload or select images for both the Left Eye (OS) and Right Eye (OD) to proceed.'
              : isAnyPoor
                ? 'Notice: One or more images have poor quality. Automated screening will reflect the safety assessment.'
                : 'Both bilateral images passed initial quality checks and are ready for feature extraction.'}
          </p>
        </div>

        <button
          type="button"
          id="analyze-retinal-images-btn"
          disabled={!hasBothImages || analyzingLeftQuality || analyzingRightQuality}
          onClick={onStartAnalysis}
          className={`flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-xs ${
            !hasBothImages || analyzingLeftQuality || analyzingRightQuality
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : isAnyPoor
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze Retinal Images</span>
        </button>
      </div>

    </div>
  );
};
