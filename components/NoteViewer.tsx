import React, { useState, useEffect, useRef } from 'react';
import { fetchNotes, fetchFilteredSubjects } from '../store';
import { Department, DEPARTMENTS, LEVELS, TERMS, Note, Subject } from '../types';
import { IconFile, IconExternal, IconDownload, IconExpand } from './Icons';

type Step = 'LEVEL' | 'TERM' | 'DEPT' | 'SUBJECT' | 'NOTES' | 'PDF_VIEW';

export const NoteViewer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('LEVEL');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep === 'SUBJECT' && selectedLevel && selectedDept) loadSubjects();
  }, [currentStep, selectedLevel, selectedDept]);

  useEffect(() => {
    if (currentStep === 'NOTES' && selectedSubjectId) loadNotes();
  }, [currentStep, selectedSubjectId]);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFilteredSubjects(selectedDept!, selectedLevel!);
      setSubjects(data.filter(s => s.term === selectedTerm));
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  };

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotes({ subjectId: selectedSubjectId! });
      setNotes(data);
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  };

  const resetToStep = (step: Step) => {
    setCurrentStep(step);
    if (step === 'LEVEL') { 
      setSelectedLevel(null); setSelectedTerm(null); setSelectedDept(null); 
      setSelectedSubjectId(null); setSelectedSubjectName(null); setActiveNote(null); 
    }
    else if (step === 'TERM') { 
      setSelectedTerm(null); setSelectedDept(null); setSelectedSubjectId(null); 
      setSelectedSubjectName(null); setActiveNote(null); 
    }
    else if (step === 'DEPT') { 
      setSelectedDept(null); setSelectedSubjectId(null); setSelectedSubjectName(null); 
      setActiveNote(null); 
    }
    else if (step === 'SUBJECT') { 
      setSelectedSubjectId(null); setSelectedSubjectName(null); setActiveNote(null); 
    }
    else if (step === 'NOTES') { 
      setActiveNote(null); 
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) return url.replace(/\/view(\?.*)?$/, '/preview');
    return url;
  };

  const toggleFullscreen = () => {
    if (!iframeContainerRef.current) return;
    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleDownload = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const renderBreadcrumbs = () => {
    const steps: Step[] = ['LEVEL', 'TERM', 'DEPT', 'SUBJECT', 'NOTES', 'PDF_VIEW'];
    const currentIndex = steps.indexOf(currentStep);
    const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        {/* Back Button */}
        {prevStep && (
          <button
            onClick={() => resetToStep(prevStep)}
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-white/50 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 group shadow-sm"
          >
            <svg 
              className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="inline-flex items-center glass-card p-1.5 rounded-full shadow-lg border border-white/50 overflow-hidden">
          <button onClick={() => resetToStep('LEVEL')} className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition ${currentStep === 'LEVEL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>Level</button>
          {selectedLevel && <><span className="mx-1 text-slate-300">/</span><button onClick={() => resetToStep('TERM')} className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase transition ${currentStep === 'TERM' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>L{selectedLevel}</button></>}
          {selectedTerm && <><span className="mx-1 text-slate-300">/</span><button onClick={() => resetToStep('DEPT')} className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase transition ${currentStep === 'DEPT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>T{selectedTerm}</button></>}
          {selectedDept && <><span className="mx-1 text-slate-300">/</span><button onClick={() => resetToStep('SUBJECT')} className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase transition ${currentStep === 'SUBJECT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>{selectedDept}</button></>}
        </nav>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {currentStep !== 'LEVEL' && renderBreadcrumbs()}

      {currentStep === 'LEVEL' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {LEVELS.map(l => (
            <button key={l} onClick={() => { setSelectedLevel(l); setCurrentStep('TERM'); }} className="group relative glass-card p-10 rounded-[3rem] text-center transition-all hover:-translate-y-3 hover:shadow-2xl hover:shadow-indigo-200 active:scale-95 border border-white/80">
              <div className="absolute top-4 right-8 text-6xl font-black text-slate-100 group-hover:text-indigo-50 transition-colors">0{l}</div>
              <div className="relative">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 group-hover:scale-110 transition-transform">
                  <span className="text-white text-3xl font-black">{l}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Year {l}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Undergraduate</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {currentStep === 'TERM' && (
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose Your Semester</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {TERMS.map(t => (
              <button key={t} onClick={() => { setSelectedTerm(t); setCurrentStep('DEPT'); }} className="group glass-card p-12 rounded-[3.5rem] flex items-center gap-8 transition-all hover:bg-white hover:shadow-2xl active:scale-95 border border-white/60">
                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white group-hover:rotate-6 transition-all">
                  {t}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Semester</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Term {t}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'DEPT' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {DEPARTMENTS.map(d => (
            <button key={d} onClick={() => { setSelectedDept(d); setCurrentStep('SUBJECT'); }} className="group glass-card p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-xl hover:border-indigo-200 active:scale-95">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{d}</h3>
            </button>
          ))}
        </div>
      )}

      {currentStep === 'SUBJECT' && (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center tracking-tight">Select a Subject</h2>
          {isLoading ? (
            <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map(s => (
                <button key={s._id} onClick={() => { setSelectedSubjectId(s._id); setSelectedSubjectName(s.subjectName); setCurrentStep('NOTES'); }} className="glass-card p-6 rounded-[2rem] flex items-center gap-5 hover:bg-white hover:shadow-xl hover:border-indigo-400 transition-all text-left active:scale-95 group">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">S</div>
                  <span className="font-bold text-slate-800 flex-1">{s.subjectName}</span>
                  <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all">
                    <IconExternal className="w-3 h-3 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {currentStep === 'NOTES' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-10 w-2 bg-indigo-600 rounded-full"></div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedSubjectName}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <div key={note._id} className="group relative glass-card p-8 rounded-[2.5rem] transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-500 border border-white/80 active:scale-[0.98]">
                <div onClick={() => { setActiveNote(note); setCurrentStep('PDF_VIEW'); }} className="cursor-pointer">
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-5 bg-indigo-600 rounded-[1.5rem] shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                      <IconFile className="w-8 h-8 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-[9px] font-black rounded-full text-slate-500 uppercase">PDF Note</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 group-hover:text-indigo-600 text-lg mb-2 line-clamp-2 leading-tight">{note.noteName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Academic Study Material</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                   <button 
                     onClick={(e) => handleDownload(e, note.noteGoogleDriveLink)}
                     title="Download PDF"
                     className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                   >
                     <IconDownload className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={() => { setActiveNote(note); setCurrentStep('PDF_VIEW'); }}
                     className="px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                   >
                     Preview
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'PDF_VIEW' && activeNote && (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
          <div className="glass-card p-4 rounded-[2.5rem] flex flex-wrap items-center justify-between mb-6 shadow-xl border border-white/50 gap-4">
            <div className="flex items-center gap-4 px-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <IconFile className="w-6 h-6" />
              </div>
              <div className="max-w-[150px] sm:max-w-[300px] md:max-w-none">
                <h3 className="font-black text-slate-800 truncate leading-none">{activeNote.noteName}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Digital Preview</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-2">
              <button 
                onClick={(e) => handleDownload(e, activeNote.noteGoogleDriveLink)}
                title="Download Resource"
                className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
              >
                <IconDownload className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleFullscreen}
                title="Full Screen View"
                className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
              >
                <IconExpand className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentStep('NOTES')} 
                className="h-12 px-6 sm:px-8 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                Back
              </button>
            </div>
          </div>
          
          <div ref={iframeContainerRef} className={`w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white transition-all ${isFullscreen ? 'h-screen border-0 rounded-none' : 'h-[70vh] md:h-[85vh]'}`}>
            <iframe 
              src={getEmbedUrl(activeNote.noteGoogleDriveLink)} 
              className="w-full h-full" 
              allow="autoplay; fullscreen" 
              title={activeNote.noteName}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};