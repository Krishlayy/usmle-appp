'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { videoSrc, fallbackVideoSrc } from '@/lib/videoUrl';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface VideoMnemonicPlayerProps {
  videoUrl: string;
  title?: string;
  userEmail?: string;
  className?: string;
  mnemonicTitle?: string;
  mnemonicExplanation?: string;
  questionRange?: string;
}

const DEFAULT_MNEMONIC_EXPLANATIONS: Record<string, { title: string; anchors: string[]; explanation: string }> = {
  'colour-room': {
    title: 'The Colour Room (Fixation, H&E Staining & Artifacts)',
    anchors: ['Hematoxylin (Basic/Cationic) → Basophilic DNA/RNA (Blue/Purple)', 'Eosin (Acidic/Anionic) → Eosinophilic Cytoplasm & Collagen (Pink/Red)', 'Dehydration/Shrinkage Artifacts'],
    explanation: 'The purple hematoxylin bath selectively binds negative phosphate charges on nucleic acids in the cell nucleus, creating the classic deep basophilic stain. The pink eosin chamber binds positively charged amino groups on cytoplasmic proteins, mitochondria, and collagen bundles. Wash water steps, formalin shrinkage, and knife chattering account for common histological preparation artifacts encountered on Step 1.',
  },
  'read-books': {
    title: 'Be So Totally Cool, Read Books (Collagen Types I–IV)',
    anchors: ['Type I: Bone, Skin, Tendon, Dentin, Fascia, Cornea', 'Type II: Cartilage, Vitreous humor, Nucleus pulposus', 'Type III: Reticular fibers, Blood vessels, Spleen (Ehlers-Danlos)', 'Type IV: Basement membrane, Lens, Cochlea (Alport Syndrome)'],
    explanation: 'Remember the mnemonic: Be (Bone - Type I), So (Soft tissue/Cartilage - Type II), Totally (Tissue/Reticular - Type III), Cool (Clear basement membrane - Type IV). Type I mutations produce Osteogenesis Imperfecta (blue sclerae, multiple fractures). Type III defects cause vascular Ehlers-Danlos. Type IV alpha-chain mutations cause Alport syndrome (hematuria, sensory deafness, ocular defects).',
  },
  'three-muscles': {
    title: 'Three Muscles and a Wire (Musculoskeletal & Neural Microarchitecture)',
    anchors: ['Skeletal Muscle: Peripheral multinucleated syncytium with transverse striations', 'Cardiac Muscle: Branched fibers, central single nucleus, intercalated discs', 'Smooth Muscle: Non-striated spindle cells with corkscrew nuclei on contraction', 'Wire: Peripheral myelinated nerve with Schwann cell nuclei & nodes of Ranvier'],
    explanation: 'Differentiates the three muscle lineages under light microscopy. Skeletal muscle exhibits peripherally displaced nuclei with alternating A-bands and I-bands. Cardiac muscle contains diagnostic intercalated discs (gap junctions and desmosomes). Smooth muscle lacks sarcomeres, contracting via calmodulin/MLCK. The peripheral nerve bundle is wrapped in epineurium, perineurium, and endoneurium.',
  },
  'down-gut-tube': {
    title: 'Down the Gut Tube (Gastrointestinal Microarchitecture)',
    anchors: ['Esophagus: Nonkeratinized stratified squamous epithelium', 'Stomach: Simple columnar with gastric pits, parietal (pink) & chief (purple) cells', 'Duodenum: Brunner submucosal alkaline glands', 'Jejunum: Tallest plicae circulares, long villi', 'Ileum: Peyer patches (GALT M-cells)', 'Colon: Crypts of Lieberkühn with abundant goblet cells, no villi'],
    explanation: 'Systematic architectural survey descending the alimentary canal. High-yield board traps include identifying Barrett esophagus (intestinal metaplasia with goblet cells), Brunner glands in the duodenal submucosa buffering gastric acid, and Peyer patches in the ileal lamina propria and submucosa serving as the inductive site for mucosal IgA immunity.',
  },
  'endocrine-cabinet': {
    title: 'The Endocrine Cabinet (Endocrine & Neuroendocrine Histology)',
    anchors: ['Adrenal Cortex: G-F-R (Glomerulosa → Aldosterone, Fasciculata → Cortisol, Reticularis → Androgens)', 'Adrenal Medulla: Neural crest chromaffin cells (Epinephrine/Norepinephrine)', 'Thyroid: Follicular cells (T3/T4) surrounding colloid + Parafollicular C cells (Calcitonin)', 'Pancreatic Islets: Beta (Insulin, central), Alpha (Glucagon, peripheral)'],
    explanation: 'The adrenal cortex mnemonic GFR maps directly to "Salt, Sugar, Sex": Zona Glomerulosa produces mineralocorticoids, Zona Fasciculata produces glucocorticoids with lipid-rich pale cells, and Zona Reticularis produces androgens. The thyroid gland displays colloid-filled spheres lined by simple cuboidal epithelium, regulated by TSH.',
  },
  'seven-up': {
    title: 'Seven-Up (Integumentary System & Epidermal Stratification)',
    anchors: ['Come, Let’s Get Sun Burned: Corneum, Lucidum, Granulosum, Spinosum, Basale', 'Stratum Spinosum: Desmosomes (Spines, pemphigus vulgaris IgG vs desmoglein 3)', 'Stratum Basale: Melanocytes, Merkel cells, stem cells (melanoma, basal cell carcinoma)', 'Dermis: Papillary (Meissner corpuscles) and Reticular (Pacinian corpuscles)'],
    explanation: 'The five epidermal layers from superficial to deep: Stratum Corneum (anucleated keratin scales), Stratum Lucidum (present only in thick palms/soles), Stratum Granulosum (basophilic keratohyalin granules), Stratum Spinosum (desmosomal bridges disrupted in pemphigus), and Stratum Basale (single layer of proliferating keratinocytes and neural crest-derived melanocytes).',
  },
  'boardroom': {
    title: 'The Boardroom (Systemic Lupus Erythematosus & Immune Complexes)',
    anchors: ['Anti-dsDNA: Highly specific, tracks disease activity and lupus nephritis', 'Anti-Smith: Most specific antibody, does not track disease activity', 'Anti-Ro (SSA) / Anti-La (SSB): Sicca syndrome, neonatal lupus, congenital heart block', 'Complement C3/C4: Consumed and depressed during active flares (Type III hypersensitivity)'],
    explanation: 'Executive review of systemic lupus pathophysiology. Loss of self-tolerance leads to apoptotic debris accumulation, autoantibody formation against nuclear antigens (ANA entry criterion ≥ 1:80), and widespread Type III immune complex deposition causing wire-loop glomerulonephritis (Class IV diffuse proliferative), Libman-Sacks endocarditis, and non-erosive arthritis.',
  },
  'bamboo-stairwell': {
    title: 'The Bamboo Stairwell (Ankylosing Spondylitis & Spondyloarthropathies)',
    anchors: ['HLA-B27: Major histocompatibility complex class I association', 'Bilateral Sacroiliitis: Earliest radiographic manifestation', 'Syndesmophytes: Vertical calcification of outer annulus fibrosus ("Bamboo spine")', 'Extra-articular: Anterior uveitis (photophobia), aortic regurgitation, apical pulmonary fibrosis'],
    explanation: 'Seronegative spondyloarthropathies lack rheumatoid factor and share HLA-B27 strong association. Chronic enthesitis at tendon insertions causes progressive spinal fusion, starting at the sacroiliac joints and ascending the vertebral column. Hallmark exam features include positive Schober test for restricted lumbar flexion.',
  },
  'badge-scanner': {
    title: 'The Badge Scanner (Targeted Biologics & Immune Checkpoints)',
    anchors: ['Infliximab / Adalimumab: TNF-alpha inhibitors (screen for latent TB before starting)', 'Rituximab: Anti-CD20 chimeric mAb depleting B cells', 'Pembrolizumab / Nivolumab: Anti-PD-1 checkpoint inhibitors unlocking cytotoxic T-cells', 'Trastuzumab: Anti-HER2/neu monoclonal antibody (monitor cardiotoxicity with ECHO)'],
    explanation: 'Precise molecular targeting of inflammatory cytokines and immunological receptors. Before prescribing TNF inhibitors, candidates must be screened with PPD/IGRA for latent tuberculosis to prevent miliary reactivation. Checkpoint inhibitors (anti-PD-1, anti-CTLA-4) prevent tumor immune evasion but can induce immune-related adverse events (colitis, hypophysitis, pneumonitis).',
  },
  'eczema-clinic': {
    title: 'The Eczema Clinic (Wiskott-Aldrich & Combined Immunodeficiencies)',
    anchors: ['WATER: Wiskott-Aldrich, Thrombocytopenia (microthrombocytes), Eczema, Recurrent infections', 'Gene: WAS gene mutation (X-linked recessive, actin cytoskeleton assembly defect)', 'Immunoglobulins: Low-to-normal IgG/IgM, elevated IgA and IgE', 'Complications: High risk of autoimmune disease and non-Hodgkin lymphoma'],
    explanation: 'Classic triad of thrombocytopenic purpura with small platelets, atopic infantile eczema, and recurrent sinopulmonary and viral infections. Due to impaired antigen presentation and defective leukocyte migration from actin remodeling failure, patients require prophylactic antibiotics, IVIG, and definitive curative hematopoietic stem cell transplantation.',
  },
};

export function VideoMnemonicPlayer({
  videoUrl,
  title = 'High-Yield Video Mnemonic',
  userEmail = 'Verified Candidate',
  className = '',
  mnemonicTitle,
  mnemonicExplanation,
  questionRange,
}: VideoMnemonicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [sourceIdx, setSourceIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Derive candidate URLs
  const candidateUrls = useMemo(() => {
    if (!videoUrl || !videoUrl.trim()) return [];
    const primary = videoSrc(videoUrl);
    const fallback = fallbackVideoSrc(videoUrl);
    const list: string[] = [];
    if (primary) list.push(primary);
    if (fallback && fallback !== primary) list.push(fallback);
    return list;
  }, [videoUrl]);

  useEffect(() => {
    setSourceIdx(0);
    setLoadFailed(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [videoUrl]);

  if (!videoUrl || !videoUrl.trim() || candidateUrls.length === 0) return null;

  const currentSourceUrl = candidateUrls[sourceIdx] || candidateUrls[0];

  // Detect matching default mnemonic explanation based on video URL
  const matchedKey = Object.keys(DEFAULT_MNEMONIC_EXPLANATIONS).find((key) =>
    videoUrl.toLowerCase().includes(key)
  );
  const defaultMnemonic = matchedKey ? DEFAULT_MNEMONIC_EXPLANATIONS[matchedKey] : null;

  const displayTitle = mnemonicTitle || defaultMnemonic?.title || title;
  const displayExplanation = mnemonicExplanation || defaultMnemonic?.explanation || null;
  const displayAnchors = defaultMnemonic?.anchors || [];

  const getEmbedUrl = (url: string): string | null => {
    try {
      const ytMatch = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
      );
      if (ytMatch && ytMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`;
      }
      const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`;
      }
    } catch {
      return null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const currentIdx = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen?.() ||
        (videoRef.current as any).webkitRequestFullscreen?.();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isScrubbing) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const skipSeconds = (sec: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoRef.current.currentTime + sec, duration));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleVideoError = () => {
    if (sourceIdx < candidateUrls.length - 1) {
      setSourceIdx(sourceIdx + 1);
      const v = videoRef.current;
      if (v) {
        v.load();
        v.play().catch(() => {});
      }
    } else {
      setLoadFailed(true);
    }
  };

  const formatTime = (timeInSec: number): string => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Video Player Container */}
      <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-950 shadow-md">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-teal-500/20 text-teal-400">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="font-sans text-xs font-semibold tracking-wide text-slate-200">
              {displayTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {questionRange && (
              <span className="rounded bg-teal-950 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-300 border border-teal-800/60">
                {questionRange}
              </span>
            )}
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-300 border border-slate-700">
              High-Yield Mnemonic
            </span>
          </div>
        </div>

        {/* Video Canvas */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : loadFailed ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-slate-400">
              <span className="text-2xl">⚠️</span>
              <p className="text-xs font-mono uppercase tracking-wider">
                Video Mnemonic Streaming Offline
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoadFailed(false);
                  setSourceIdx(0);
                  videoRef.current?.load();
                }}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors"
              >
                Retry Stream
              </button>
            </div>
          ) : (
            <div className="group relative h-full w-full">
              <video
                ref={videoRef}
                src={currentSourceUrl}
                playsInline
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={handleVideoError}
                onClick={togglePlay}
                className="h-full w-full object-cover cursor-pointer"
              />

              {/* Watermark Protection */}
              <div className="pointer-events-none absolute bottom-12 right-3 font-mono text-[9px] uppercase tracking-wider text-white/20 select-none">
                {userEmail} • USMLE Board Review
              </div>

              {/* Center Play Button Overlay */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity group-hover:bg-black/30"
                >
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-teal-600/90 text-white shadow-lg transition-transform hover:scale-110">
                    <Play className="h-8 w-8 fill-current ml-1" />
                  </div>
                </div>
              )}

              {/* Bottom Custom Control Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 text-white transition-opacity">
                {/* Timeline Slider */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] text-slate-300">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleScrub}
                    onMouseDown={() => setIsScrubbing(true)}
                    onMouseUp={() => setIsScrubbing(false)}
                    className="h-1.5 flex-1 cursor-pointer accent-teal-400 bg-white/30 rounded-lg appearance-none"
                  />
                  <span className="font-mono text-[10px] text-slate-300">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1 hover:text-teal-400 transition-colors cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => skipSeconds(-5)}
                      className="p-1 hover:text-teal-400 transition-colors cursor-pointer flex items-center"
                      title="Back 5s"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span className="text-[9px] ml-0.5">5s</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => skipSeconds(5)}
                      className="p-1 hover:text-teal-400 transition-colors cursor-pointer flex items-center"
                      title="Forward 5s"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span className="text-[9px] ml-0.5">5s</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1 hover:text-teal-400 transition-colors cursor-pointer"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={changeSpeed}
                      className="rounded bg-white/20 px-2 py-0.5 font-mono text-xs font-bold hover:bg-white/30 transition-colors cursor-pointer"
                      title="Speed"
                    >
                      {playbackSpeed}x
                    </button>
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1 hover:text-teal-400 transition-colors cursor-pointer"
                      title="Fullscreen"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED VIDEO MNEMONIC EXPLANATION BOX */}
      {(displayExplanation || displayAnchors.length > 0) && (
        <div className="rounded-xl border border-teal-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-teal-100 bg-teal-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-teal-600 text-white shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div>
                <h4 className="font-sans text-xs md:text-sm font-bold text-slate-900 tracking-tight leading-none">
                  Video Mnemonic Clinical Breakdown
                </h4>
                <p className="font-mono text-[10px] text-teal-800 uppercase tracking-wider mt-0.5 font-semibold">
                  Visual Memory Anchor &amp; Pathophysiology Script
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              {isExpanded ? 'Collapse' : 'Expand Script'}
            </button>
          </div>

          {/* Card Body */}
          {isExpanded && (
            <div className="p-4 md:p-5 space-y-4 bg-white select-text">
              {/* High-yield Visual Metaphor Anchors */}
              {displayAnchors.length > 0 && (
                <div>
                  <span className="font-mono text-[10.5px] uppercase tracking-wider font-bold text-slate-500 mb-2 block">
                    Core Visual Anchors:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {displayAnchors.map((anchor, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{anchor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Narrative Explanation */}
              {displayExplanation && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                    Mnemonic Clinical Mechanism:
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 font-sans">
                    {displayExplanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
