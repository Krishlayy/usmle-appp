import re

# Read TestPlayer.tsx
with open(r'c:\Users\hello\USMLE2\src\components\TestPlayer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the MQB Signature theme function
mqb_theme_code = '''  const renderMqbTheme = () => {
    const isDarkClinical = !settings.highContrast;
    const canvasBg = settings.highContrast ? 'bg-black text-white' : 'bg-[#080d1a] text-slate-100';
    const cardBg = settings.highContrast ? 'bg-black border-2 border-white' : 'bg-[#0f172a]/90 border border-teal-900/35 backdrop-blur-md shadow-2xl';
    const headerBg = settings.highContrast ? 'bg-black border-b-2 border-white text-white' : 'bg-[#0b1120]/95 backdrop-blur-md border-b border-teal-900/40 text-slate-200 shadow-md';
    const sidebarBg = settings.highContrast ? 'bg-black border-r-2 border-white' : 'bg-[#0b1120]/95 border-r border-teal-900/30';

    return (
      <div className={`flex flex-col h-screen overflow-hidden font-sans ${canvasBg} relative selection:bg-teal-500/30 selection:text-teal-200`}>
        {/* Modals & Overlays */}
        {isPaused && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 flex flex-col items-center justify-center backdrop-blur-md">
            <div className="bg-[#0f172a] p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-teal-500/30 text-white">
              <div className="w-14 h-14 rounded-full bg-teal-950/80 text-teal-400 border border-teal-500/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2 font-serif">Exam Block Suspended</h2>
              <p className="text-slate-300 mb-6 text-sm">Timer is stopped. Vignettes and answer choices remain hidden to maintain testing authenticity.</p>
              <button 
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
              >
                Resume Exam Practice
              </button>
            </div>
          </div>
        )}

        {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
        {showLabValues && <LabValuesModal onClose={() => setShowLabValues(false)} />}
        {settingsMenuOpen && <SettingsSidebar onClose={() => setSettingsMenuOpen(false)} />}
        {showNotes && (
          <QuestionNotesModal 
            isOpen={showNotes} 
            onClose={() => { setShowNotes(false); setNotebookAppendText(null); }} 
            initialNotes={currentQ.notes || ''} 
            onSave={handleSaveNotes} 
            appendContent={notebookAppendText}
          />
        )}
        {zoomImage && (
          <ExhibitDisplay 
            mediaUrl={zoomImage} 
            onClose={() => setZoomImage(null)} 
            onAddToNotes={() => setShowNotes(true)}
          />
        )}
        {showFlashcardModal && session.qbankSlug && (
          <FlashcardModal 
            isOpen={showFlashcardModal} 
            onClose={() => setShowFlashcardModal(false)} 
            questionId={currentQ.question.id} 
            qbankSlug={session.qbankSlug} 
            initialFront={flashcardPrefillText}
          />
        )}

        {/* Clinical Dark Glass Header */}
        <header className={`h-16 ${headerBg} flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-20`}>
          {/* Left: Item Counter & Mode Pill */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-white font-mono">Item {currentIndex + 1}</span>
              <span className="text-xs text-teal-400/80 font-mono">/ {session.questions.length}</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/70 border border-teal-500/30 text-teal-300 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>{session.mode === 'tutor' ? 'Tutor Mode' : 'Timed Mode'}</span>
            </div>

            {/* Quick Theme Switch Pill */}
            <button 
              type="button"
              onClick={() => updateSetting('appTheme', 'UWORLD')}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border border-teal-500/40 bg-teal-950/60 text-teal-300 hover:bg-teal-900/60 transition-all cursor-pointer shadow-xs"
              title="Switch to UWorld Official FRED v2 Theme"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Theme: MQB Signature</span>
              <span className="hidden md:inline text-[10px] text-teal-400/70 font-normal">(Click for UWorld)</span>
            </button>
          </div>

          {/* Center: Timer with Optional Shortcuts */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#080d1a]/80 border border-teal-900/50 px-3.5 py-1.5 rounded-full shadow-inner">
              <Clock className="w-4 h-4 text-teal-400" />
              {settings.showTimer !== false ? (
                <TimerDisplay 
                  initialElapsed={0} 
                  initialTimeLeft={session.durationSec ? Math.max(0, session.durationSec - initialElapsed) : null} 
                  isTimed={session.mode === 'timed'} 
                  isPaused={isPaused}
                  onTimeUp={handleEndBlock} 
                  type={session.mode === 'timed' ? 'remaining' : 'elapsed'}
                  className="text-sm font-bold text-teal-300 font-mono tracking-tight"
                />
              ) : (
                <span className="text-sm font-bold text-slate-500 font-mono">--:--</span>
              )}
              <button 
                type="button" 
                onClick={() => setIsPaused(true)}
                className="text-slate-400 hover:text-teal-300 transition-colors ml-1 p-0.5 cursor-pointer"
                title="Pause Block Timer"
              >
                <Pause size={14} />
              </button>
            </div>
          </div>

          {/* Right: Tools & Settings Action Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mark / Flag Question */}
            <button 
              type="button"
              onClick={handleToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                currentQ.isFlagged 
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-sm shadow-rose-950/50' 
                  : 'border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
              title="Mark Question (Alt + M)"
            >
              <Flag size={14} className={currentQ.isFlagged ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
              <span className="hidden sm:inline">{currentQ.isFlagged ? 'Marked' : 'Mark'}</span>
              {settings.showShortcuts && <kbd className="text-[9px] font-mono opacity-60">Alt+M</kbd>}
            </button>

            {/* Labs */}
            <button 
              type="button"
              onClick={() => setShowLabValues(true)}
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg border border-slate-700/80 bg-slate-900/60 transition-colors cursor-pointer"
              title="Lab Values Reference (Alt + L)"
            >
              <FlaskConical size={16} />
            </button>

            {/* Calculator */}
            <button 
              type="button"
              onClick={() => setShowCalculator(true)}
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg border border-slate-700/80 bg-slate-900/60 transition-colors cursor-pointer"
              title="Calculator (Alt + C)"
            >
              <CalcIcon size={16} />
            </button>

            {/* Notes */}
            <button 
              type="button"
              onClick={() => setShowNotes(true)}
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg border border-slate-700/80 bg-slate-900/60 transition-colors cursor-pointer"
              title="Question Notes"
            >
              <PenLine size={16} />
            </button>

            {/* Settings */}
            <button 
              type="button"
              onClick={() => setSettingsMenuOpen(true)}
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg border border-slate-700/80 bg-slate-900/60 transition-colors cursor-pointer"
              title="Display & Exam Settings"
            >
              <SettingsIcon size={16} />
            </button>

            {/* End Block */}
            <button 
              type="button"
              onClick={handleEndBlock}
              className="ml-1 sm:ml-2 px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/50 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              End Block
            </button>
          </div>
        </header>

        {/* Main Body Workspace */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Ambient Focus Mode Sidebar (1-50 Questions) */}
          <aside className={`w-16 ${sidebarBg} flex flex-col shrink-0 overflow-y-auto py-2.5 px-1 space-y-1 custom-scrollbar`}>
            {questions.map((q, idx) => {
              const isActive = idx === currentIndex;
              const isAnswered = !!q.selectedOptionId;
              const isFlagged = q.isFlagged;

              return (
                <button 
                  key={q.id}
                  type="button"
                  onClick={() => navigateToIndex(idx)}
                  className={`flex flex-col items-center justify-center h-11 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    isActive 
                      ? 'bg-teal-950/90 text-teal-200 border-2 border-teal-400 shadow-[0_0_14px_rgba(20,184,166,0.4)] scale-105 z-10 opacity-100 font-black' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 opacity-60 hover:opacity-100'
                  }`}
                  title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : ''}${isFlagged ? ' (Marked)' : ''}`}
                >
                  <span className="font-mono text-[11px]">{idx + 1}</span>
                  <div className="flex items-center gap-1 mt-0.5 h-2">
                    {isAnswered && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-teal-300' : 'bg-teal-500'}`} />
                    )}
                    {isFlagged && (
                      <Flag size={8} className="fill-rose-500 text-rose-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Central Question & Reading Canvas */}
          <main 
            ref={testPlayerMainRef} 
            className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 max-w-7xl mx-auto w-full pb-28 custom-scrollbar"
          >
            {/* Split Screen Grid vs Single Column Layout */}
            <div className={settings.splitScreen ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-start' : 'max-w-4xl mx-auto'}>
              
              {/* LEFT COLUMN: Question Vignette + Media Exhibits */}
              <div className="space-y-6">
                <div className={`${cardBg} rounded-2xl p-6 sm:p-8`}>
                  {/* Vignette Meta Header */}
                  <div className="flex items-center justify-between border-b border-teal-900/30 pb-3 mb-6">
                    <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Clinical Vignette • QID {currentQ.question.qid}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">Font: {settings.fontSize}px</span>
                    </div>
                  </div>

                  {/* Vignette Stem */}
                  <div 
                    ref={questionContentRef}
                    style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.6 }}
                    className="leading-relaxed font-sans select-text text-slate-200"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedQuestionText || currentQ.question.questionText) }}
                  />

                  {/* Clinical Exhibits & Media */}
                  {currentQ.question.media && currentQ.question.media.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-teal-900/30">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center justify-between">
                        <span>Clinical Exhibits &amp; High-Yield Images</span>
                        <span className="text-[10px] text-slate-400 font-sans normal-case">(Click image for high-res zoom)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQ.question.media.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => setZoomImage(m.url)}
                            className="cursor-pointer group relative rounded-xl overflow-hidden border border-teal-900/40 bg-[#080d1a] hover:border-teal-500 transition-all shadow-md"
                          >
                            <img 
                              src={m.url} 
                              alt={m.caption || 'Clinical Exhibit'} 
                              className="w-full h-44 object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300" 
                            />
                            {m.caption && (
                              <div className="p-2 text-xs text-slate-300 bg-[#0b1120]/90 border-t border-teal-900/40 font-sans">
                                {m.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Options + Feedback & Video Mnemonics */}
              <div className="space-y-6">
                <div className={`${cardBg} rounded-2xl p-6 sm:p-8`}>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 border-b border-teal-900/30 pb-3 mb-5 flex items-center justify-between">
                    <span>Select Single Best Answer</span>
                    {settings.showShortcuts && (
                      <span className="text-[10px] text-slate-400 font-sans normal-case">Use keys [A] – [E]</span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {currentQ.question.options.map((opt, i) => {
                      const isSelected = currentQ.selectedOptionId === opt.id;
                      const isStruckThrough = currentQ.strikethroughs?.includes(opt.id);

                      let optionCardStyle = 'bg-[#131d33]/60 border-slate-700/70 hover:border-teal-500/50 hover:bg-[#16233f] text-slate-200';
                      let letterStyle = 'bg-slate-800 text-slate-300 border-slate-700';

                      if (isSelected) {
                        optionCardStyle = 'bg-teal-950/70 border-teal-400 text-teal-100 shadow-[0_0_15px_rgba(20,184,166,0.25)] ring-1 ring-teal-400/40';
                        letterStyle = 'bg-teal-500 text-slate-950 font-black border-teal-400';
                      }

                      if (showFeedback) {
                        if (opt.isCorrect) {
                          optionCardStyle = 'bg-emerald-950/70 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.25)] ring-1 ring-emerald-400/50';
                          letterStyle = 'bg-emerald-500 text-slate-950 font-black border-emerald-400';
                        } else if (opt.isYellowDistractor) {
                          optionCardStyle = 'bg-amber-950/60 border-amber-400 text-amber-100';
                          letterStyle = 'bg-amber-500 text-slate-950 font-black border-amber-400';
                        } else if (isSelected) {
                          optionCardStyle = 'bg-rose-950/70 border-rose-500 text-rose-100 ring-1 ring-rose-500/40';
                          letterStyle = 'bg-rose-500 text-slate-950 font-black border-rose-400';
                        } else {
                          optionCardStyle = 'bg-[#0b1120]/60 border-slate-800 opacity-60 text-slate-400';
                        }
                      }

                      const paddingStyle = settings.answerLayout === 'compact' ? 'p-2.5 sm:p-3 text-sm' : 'p-3.5 sm:p-4 text-[15px]';

                      return (
                        <div 
                          key={opt.id}
                          onClick={() => !showFeedback && handleOptionSelect(opt.id)}
                          className={`${paddingStyle} rounded-xl border-2 transition-all cursor-pointer relative group ${optionCardStyle}`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 transition-colors ${letterStyle}`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <div className={`leading-relaxed select-text ${isStruckThrough ? 'line-through opacity-35' : ''}`}>
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt.text) }} />
                              </div>

                              {/* Distractor Rationale Tags */}
                              {showFeedback && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {opt.isCorrect && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400 text-emerald-300">
                                      ✓ Accurate Board Answer
                                    </span>
                                  )}
                                  {opt.isYellowDistractor && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-400 text-amber-300">
                                      ⚠️ High-Yield Distractor
                                    </span>
                                  )}
                                  {isSelected && !opt.isCorrect && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-400 text-rose-300">
                                      ✗ Your Selection
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Strikethrough toggle button */}
                            {session.mode !== 'review' && !showFeedback && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStrikethrough(opt.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                                title="Strike through option"
                              >
                                <Strikethrough size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tutor Mode Submit CTA */}
                  {session.mode === 'tutor' && !showFeedback && (
                    <div className="mt-6 pt-5 border-t border-teal-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentQ.selectedOptionId) return;
                          setTutorRevealedMap(prev => ({ ...prev, [currentQ.id]: true }));
                          setTimeout(() => {
                            explanationContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }, 150);
                        }}
                        disabled={!currentQ.selectedOptionId}
                        className="w-full sm:w-auto px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-teal-500/25 transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Submit Answer &amp; View Explanation</span>
                        <span>→</span>
                      </button>
                      <span className="text-xs text-slate-400 font-sans italic">
                        {currentQ.selectedOptionId ? 'Ready to submit' : 'Select an answer option to proceed'}
                      </span>
                    </div>
                  )}

                  {/* Proceed to Next Item CTA in Tutor/Feedback */}
                  {showFeedback && (
                    <div className="mt-6 pt-5 border-t border-teal-900/30 flex justify-end">
                      <button 
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                      >
                        {currentIndex === session.questions.length - 1 ? 'Finish Block →' : 'Proceed to Next Item →'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Explanation & Video Mnemonic in Tutor / Review Mode */}
                {showFeedback && (
                  <div className="space-y-6">
                    {/* 1. Cinematic Video Mnemonic */}
                    {currentQ.question.videoUrl && (
                      <div className="rounded-2xl overflow-hidden border border-teal-500/40 shadow-2xl bg-black">
                        <VideoMnemonicPlayer 
                          videoUrl={currentQ.question.videoUrl} 
                          title={`Visual Mnemonic • Concept Retention (Question ${currentIndex + 1})`}
                          userEmail={userEmail}
                        />
                      </div>
                    )}

                    {/* 2. Educational Discussion Card */}
                    <div className={`${cardBg} rounded-2xl p-6 sm:p-8 space-y-4`}>
                      <div className="flex items-center justify-between border-b border-teal-900/30 pb-3">
                        <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-400" />
                          Educational Discussion &amp; Clinical Pearls
                        </span>
                        {currentQ.isCorrect !== null && (
                          <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold uppercase ${
                            currentQ.isCorrect 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-400' 
                              : 'bg-rose-950 text-rose-300 border border-rose-400'
                          }`}>
                            {currentQ.isCorrect ? '✓ Correct Answer' : '✗ Incorrect'}
                          </span>
                        )}
                      </div>

                      <div 
                        ref={explanationContentRef}
                        className="text-slate-200 text-sm leading-relaxed qbank-explanation-body select-text cursor-text font-sans"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target && target.tagName === 'IMG') {
                            const src = (target as HTMLImageElement).src;
                            if (src) setZoomImage(src);
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentQ.highlightedExplanation || currentQ.question.explanation || '') }}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Stepper Navigation Footer */}
            <div className="flex items-center justify-between pt-10 pb-6 border-t border-teal-900/20 mt-10">
              <button 
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-700/80 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
              >
                <span>← Previous Item</span>
                {settings.showShortcuts && <kbd className="text-[10px] font-mono opacity-50">Alt+P</kbd>}
              </button>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{currentIndex === session.questions.length - 1 ? 'Review & End Block' : 'Next Item →'}</span>
                  {settings.showShortcuts && <kbd className="text-[10px] font-mono text-slate-900 font-bold">Alt+N</kbd>}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  };
'''

# Find bounds of `const renderModernTheme = () => (` up to `return (`
start_marker = "  const renderModernTheme = () => ("
end_marker = "  return (\n    <>\n      <HighlightToolbar \n        containerRef={testPlayerMainRef} \n        onHighlight={(color) => applyTextFormatting('highlight', color)} \n      />\n      {renderUworldTheme()}\n    </>\n  );"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find start_marker!")
    exit(1)

end_idx = content.find(end_marker)
if end_idx == -1:
    print("Could not find end_marker!")
    exit(1)

new_return_block = '''  return (
    <>
      <HighlightToolbar 
        containerRef={testPlayerMainRef} 
        onHighlight={(color) => applyTextFormatting('highlight', color)} 
      />
      {settings.appTheme === 'MQB' ? renderMqbTheme() : renderUworldTheme()}
    </>
  );'''

new_content = content[:start_idx] + mqb_theme_code + "\n\n" + new_return_block + content[end_idx + len(end_marker):]

with open(r'c:\Users\hello\USMLE2\src\components\TestPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully replaced renderModernTheme with renderMqbTheme and dynamic appTheme switcher!")
