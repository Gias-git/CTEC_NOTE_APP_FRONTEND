import React, { useState, useEffect, useMemo } from 'react';
import { fetchNotes, createNote, deleteNoteApi, fetchAllSubjects, createSubject, deleteSubjectApi } from '../store';
import { Note, Department, DEPARTMENTS, Subject } from '../types';
import { IconTrash, IconPlus, IconFile } from './Icons';

export const AdminDashboard: React.FC = () => {
  // --- DATA STATE ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<'NOTES' | 'SUBJECTS'>('NOTES');
  const [selectedDept, setSelectedDept] = useState<Department>('Apparel');
  const [selectedLT, setSelectedLT] = useState('L1-T1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- MODAL STATE ---
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'NOTE' | 'SUBJECT', name: string } | null>(null);

  // --- FORM STATES ---
  const [noteForm, setNoteForm] = useState({ 
    noteName: '', 
    noteGoogleDriveLink: '', 
    subjectId: '',
    tempDept: 'Apparel' as Department,
    tempLevel: 1,
    tempTerm: 1
  });

  const [subjectForm, setSubjectForm] = useState({ 
    subjectName: '', 
    department: 'Apparel' as Department, 
    level: 1, 
    term: 1 
  });

  // --- API LOGIC ---
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [n, s] = await Promise.all([fetchNotes(), fetchAllSubjects()]);
      setNotes(n); 
      setSubjects(s);
    } catch (err) {
      setError("Sync failed. Check your API connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.subjectId) return setError("Please select a subject.");
    setIsSubmitting(true);
    try {
      await createNote({
        noteName: noteForm.noteName,
        noteGoogleDriveLink: noteForm.noteGoogleDriveLink,
        subjectId: noteForm.subjectId
      });
      setNoteForm({ ...noteForm, noteName: '', noteGoogleDriveLink: '', subjectId: '' });
      setIsNoteFormOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save resource.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSubject(subjectForm);
      setSubjectForm({ subjectName: '', department: 'Apparel' as Department, level: 1, term: 1 });
      setIsSubjectFormOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create subject.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      deleteTarget.type === 'NOTE' ? await deleteNoteApi(deleteTarget.id) : await deleteSubjectApi(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      setError("Delete failed. This subject may have linked notes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FILTER LOGIC ---
  const formAvailableSubjects = useMemo(() => {
    return subjects.filter(s => 
      s.department === noteForm.tempDept && 
      s.level === noteForm.tempLevel && 
      s.term === noteForm.tempTerm
    );
  }, [subjects, noteForm.tempDept, noteForm.tempLevel, noteForm.tempTerm]);

  const displayData = useMemo(() => {
    const [l, t] = selectedLT.replace('L', '').replace('T', '').split('-').map(Number);
    if (activeTab === 'NOTES') {
      return notes.filter(n => 
        n.subjectId?.level === l && n.subjectId?.term === t && 
        n.subjectId?.department === selectedDept &&
        n.noteName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return subjects.filter(s => 
      s.level === l && s.term === t && 
      s.department === selectedDept &&
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, subjects, activeTab, selectedDept, selectedLT, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 pb-24 relative">
      
      {/* ERROR NOTIFICATION */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4">
          <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
            <p className="text-xs font-black uppercase">{error}</p>
            <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
          </div>
        </div>
      )}

      {/* MODAL 1: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-black mb-2 text-slate-800">Confirm Delete</h3>
            <p className="text-slate-500 text-sm mb-6">Remove <span className="text-rose-500 font-bold">"{deleteTarget.name}"</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
              <button onClick={executeDelete} disabled={isSubmitting} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold">
                {isSubmitting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SUBJECT FORM */}
      {isSubjectFormOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-black mb-6 text-slate-800">New Subject</h3>
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <input required placeholder="Subject Name" value={subjectForm.subjectName} onChange={e => setSubjectForm({...subjectForm, subjectName: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" />
              <div className="grid grid-cols-3 gap-2">
                <select value={subjectForm.department} onChange={e => setSubjectForm({...subjectForm, department: e.target.value as Department})} className="p-3 bg-slate-50 rounded-xl font-bold text-xs">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={subjectForm.level} onChange={e => setSubjectForm({...subjectForm, level: Number(e.target.value)})} className="p-3 bg-slate-50 rounded-xl font-bold text-xs">
                  {[1,2,3,4].map(l => <option key={l} value={l}>L{l}</option>)}
                </select>
                <select value={subjectForm.term} onChange={e => setSubjectForm({...subjectForm, term: Number(e.target.value)})} className="p-3 bg-slate-50 rounded-xl font-bold text-xs">
                  {[1,2].map(t => <option key={t} value={t}>T{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsSubjectFormOpen(false)} className="flex-1 py-4 font-black text-slate-400">CANCEL</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD RESOURCE (NOTE) FORM */}
      {isNoteFormOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-xl w-full">
            <h3 className="text-2xl font-black mb-6 text-slate-800">Add Resource</h3>
            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl">
                <select value={noteForm.tempDept} onChange={e => setNoteForm({...noteForm, tempDept: e.target.value as Department, subjectId: ''})} className="bg-transparent font-bold text-[10px] outline-none">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={noteForm.tempLevel} onChange={e => setNoteForm({...noteForm, tempLevel: Number(e.target.value), subjectId: ''})} className="bg-transparent font-bold text-[10px] outline-none">
                  {[1,2,3,4].map(l => <option key={l} value={l}>Level {l}</option>)}
                </select>
                <select value={noteForm.tempTerm} onChange={e => setNoteForm({...noteForm, tempTerm: Number(e.target.value), subjectId: ''})} className="bg-transparent font-bold text-[10px] outline-none">
                  {[1,2].map(t => <option key={t} value={t}>Term {t}</option>)}
                </select>
              </div>
              <select required value={noteForm.subjectId} onChange={e => setNoteForm({...noteForm, subjectId: e.target.value})} className="w-full p-4 border-2 border-indigo-100 rounded-xl font-bold">
                <option value="">{formAvailableSubjects.length > 0 ? 'Select Subject...' : 'No subjects in this L-T'}</option>
                {formAvailableSubjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
              </select>
              <input required placeholder="Resource Title" value={noteForm.noteName} onChange={e => setNoteForm({...noteForm, noteName: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" />
              <input required type="url" placeholder="Google Drive URL" value={noteForm.noteGoogleDriveLink} onChange={e => setNoteForm({...noteForm, noteGoogleDriveLink: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsNoteFormOpen(false)} className="flex-1 py-4 font-black text-slate-400">CANCEL</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab('NOTES')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'NOTES' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>RESOURCES</button>
          <button onClick={() => setActiveTab('SUBJECTS')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'SUBJECTS' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>SUBJECTS</button>
        </div>
        <div className="flex gap-2">
            <select value={selectedLT} onChange={(e) => setSelectedLT(e.target.value)} className="bg-slate-100 px-4 py-3 rounded-2xl font-black text-xs outline-none">
                {[1,2,3,4].map(l => [1,2].map(t => <option key={`${l}-${t}`} value={`L${l}-T${t}`}>L{l}-T{t}</option>))}
            </select>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-white border border-slate-200 px-6 py-3 rounded-2xl outline-none" />
        </div>
      </div>

      {/* DEPARTMENT TABS */}
      <div className="flex flex-wrap justify-center gap-2">
        {DEPARTMENTS.map(dept => (
          <button key={dept} onClick={() => setSelectedDept(dept as Department)} className={`px-5 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${selectedDept === dept ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{dept.toUpperCase()}</button>
        ))}
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Position</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr><td colSpan={3} className="p-20 text-center animate-pulse text-slate-300 font-black uppercase">Loading...</td></tr>
            ) : displayData.length > 0 ? (
              displayData.map((item: any) => (
                <tr key={item._id} className="group hover:bg-slate-50/50">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                        {activeTab === 'NOTES' ? <IconFile className="w-5 h-5" /> : <div className="font-black text-[10px]">SUB</div>}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm leading-tight">{item.noteName || item.subjectName}</div>
                        <div className="text-[10px] text-indigo-400 font-bold uppercase mt-0.5">
                          {activeTab === 'NOTES' ? (item.subjectId?.subjectName || 'Generic') : item.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">
                      L{item.level || item.subjectId?.level}-T{item.term || item.subjectId?.term}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setDeleteTarget({ id: item._id, type: activeTab === 'NOTES' ? 'NOTE' : 'SUBJECT', name: item.noteName || item.subjectName })} className="p-2 text-slate-300 hover:text-rose-500">
                      <IconTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="p-32 text-center text-slate-300 font-black text-xs uppercase">No Results Found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => {
          console.log("Button clicked, tab is:", activeTab);
          if (activeTab === 'NOTES') setIsNoteFormOpen(true);
          else setIsSubjectFormOpen(true);
        }} 
        className="fixed bottom-8 right-8 bg-slate-900 text-white pl-5 pr-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 z-[999]"
      >
        <IconPlus className="w-5 h-5" />
        <span className="font-black text-xs uppercase tracking-wider">New {activeTab === 'NOTES' ? 'Resource' : 'Subject'}</span>
      </button>

    </div>
  );
};
