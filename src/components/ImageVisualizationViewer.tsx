import React, { useState } from 'react';
import { 
  Eye, 
  Layers, 
  Sparkles, 
  Info, 
  Crosshair, 
  ZoomIn, 
  Maximize2,
  AlertCircle
} from 'lucide-react';
import { EyeScreeningResult, AIHighlightRegion, FindingCategory } from '../types';

interface ImageVisualizationViewerProps {
  leftResult: EyeScreeningResult;
  rightResult: EyeScreeningResult;
}

export const ImageVisualizationViewer: React.FC<ImageVisualizationViewerProps> = ({
  leftResult,
  rightResult
}) => {
  const [viewMode, setViewMode] = useState<'original' | 'highlighted'>('highlighted');
  const [activeRegion, setActiveRegion] = useState<AIHighlightRegion | null>(null);
  const [activeEye, setActiveEye] = useState<'left' | 'right' | 'both'>('both');

  const getCategoryColor = (category: FindingCategory) => {
    switch (category) {
      case 'microaneurysm':
        return {
          border: 'border-amber-400',
          bg: 'bg-amber-500/20',
          text: 'text-amber-300',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300'
        };
      case 'hemorrhage':
        return {
          border: 'border-rose-500',
          bg: 'bg-rose-600/25',
          text: 'text-rose-300',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300'
        };
      case 'exudate':
        return {
          border: 'border-yellow-300',
          bg: 'bg-yellow-400/25',
          text: 'text-yellow-200',
          badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300'
        };
      case 'vessel_abnormality':
        return {
          border: 'border-purple-400',
          bg: 'bg-purple-500/20',
          text: 'text-purple-300',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300'
        };
      case 'other_suspicious':
      default:
        return {
          border: 'border-cyan-400',
          bg: 'bg-cyan-500/20',
          text: 'text-cyan-300',
          badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300'
        };
    }
  };

  const renderEyeCanvas = (result: EyeScreeningResult, label: string) => {
    const isLeft = result.eye === 'left';
    const isHighlighted = viewMode === 'highlighted';
    const isGoodQuality = result.imageQuality === 'Good';
    const isFairQuality = result.imageQuality === 'Fair';

    return (
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-800 tracking-tight block">
              {label}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {result.screeningCategory}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
            {result.highlightedRegions.length} Candidate{result.highlightedRegions.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Viewport styled after High Density dark fundus viewer */}
        <div className="relative aspect-square max-h-[340px] mx-auto w-full rounded-xl overflow-hidden bg-black border border-slate-200 flex items-center justify-center group select-none shadow-inner">
          
          {/* Top-left Eye Indicator Tag */}
          <div className="absolute top-2.5 left-2.5 z-20 bg-white/10 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white uppercase tracking-widest font-bold border border-white/10">
            {isLeft ? 'Left Eye (OS)' : 'Right Eye (OD)'}
          </div>

          {/* Top-right Quality Badge */}
          <div className={`absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded text-[10px] text-white font-bold ${
            isGoodQuality ? 'bg-emerald-600/90' : isFairQuality ? 'bg-amber-600/90' : 'bg-rose-600/90'
          }`}>
            Quality: {result.imageQuality}
          </div>

          {/* Retinal Image */}
          <img
            src={result.imageUrl}
            alt={`${label} Retinal Scan`}
            className="w-full h-full object-contain filter contrast-105"
          />

          {/* AI Markers Layer */}
          {isHighlighted && result.highlightedRegions.map((region) => {
            const styles = getCategoryColor(region.category);
            const isSelected = activeRegion?.id === region.id;

            return (
              <div
                key={region.id}
                style={{
                  left: `${region.xPercent}%`,
                  top: `${region.yPercent}%`,
                  width: `${Math.max(26, region.radiusPercent * 4)}px`,
                  height: `${Math.max(26, region.radiusPercent * 4)}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => setActiveRegion(isSelected ? null : region)}
                className={`absolute rounded-full border-2 ${styles.border} ${styles.bg} cursor-pointer transition-all duration-150 flex items-center justify-center ${
                  isSelected ? 'ring-2 ring-white scale-125 z-30 shadow-md' : 'hover:scale-115 z-20 opacity-85 hover:opacity-100'
                }`}
                title={region.title}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-white/90'}`} />
              </div>
            );
          })}

          {/* Bottom Floating Pill Action Controls */}
          <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { setViewMode('original'); setActiveRegion(null); }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                !isHighlighted
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-slate-900/60 text-white border border-white/20 backdrop-blur-xs hover:bg-slate-900/80'
              }`}
            >
              Original View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('highlighted')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                isHighlighted
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-slate-900/60 text-white border border-white/20 backdrop-blur-xs hover:bg-slate-900/80'
              }`}
            >
              AI Highlight{isHighlighted ? ' Active' : ''}
            </button>
          </div>

          {/* Bottom-right Filename watermark */}
          <div className="absolute bottom-2.5 right-2.5 text-[9px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
            {result.imageFileName || (isLeft ? 'OS_SCAN' : 'OD_SCAN')}
          </div>
        </div>

        {/* Finding Badges */}
        <div className="mt-2.5 space-y-1">
          {result.highlightedRegions.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic py-0.5 text-center">
              No prominent localized candidate regions highlighted.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {result.highlightedRegions.map((reg) => {
                const styles = getCategoryColor(reg.category);
                const isSelected = activeRegion?.id === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setActiveRegion(isSelected ? null : reg)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-all ${
                      isSelected 
                        ? 'bg-slate-900 text-white border-slate-900 ring-1 ring-teal-400' 
                        : `${styles.badgeBg} hover:opacity-90`
                    }`}
                  >
                    {reg.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <div id="image-visualization-viewer" className="space-y-3">
      
      {/* View Toggle Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-teal-50 text-teal-700">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Retinal Fundus Image Visualization
            </h4>
            <p className="text-[11px] text-slate-500">
              Side-by-side bilateral inspection with localized potential finding markers
            </p>
          </div>
        </div>

        {/* Mode Toggle Buttons: Original | AI Highlighted */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            id="view-original-btn"
            onClick={() => { setViewMode('original'); setActiveRegion(null); }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'original'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Original
          </button>
          <button
            type="button"
            id="view-highlighted-btn"
            onClick={() => setViewMode('highlighted')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'highlighted'
                ? 'bg-teal-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Highlighted</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {renderEyeCanvas(leftResult, 'LEFT EYE (OS)')}
        {renderEyeCanvas(rightResult, 'RIGHT EYE (OD)')}
      </div>

      {/* Active Region Detailed Inspector Card */}
      {activeRegion && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                <Crosshair className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
                    Possible Finding
                  </span>
                  <h5 className="text-sm font-bold text-white">
                    {activeRegion.title}
                  </h5>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeRegion.plainLanguageExplanation}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <span>Relative Position: X:{activeRegion.xPercent}%, Y:{activeRegion.yPercent}%</span>
                  <span>Feature Confidence: {Math.round(activeRegion.confidenceScore * 100)}%</span>
                  <span className="text-amber-400">Requires ophthalmoscopic confirmation</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveRegion(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Guidance Note */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <p>
          <strong>Clinical Marker Notice:</strong> Highlighted overlays indicate subtle visual anomalies extracted by automated spatial filters. A highlighted region is <em>not definitively a lesion</em> and must be independently examined by an ophthalmologist.
        </p>
      </div>

    </div>
  );
};
