
import React, { useState, useEffect } from 'react';
import { fetchNotes, createNote, deleteNoteApi, fetchAllSubjects, createSubject, deleteSubjectApi } from '../store';
import { Note, Department, DEPARTMENTS, LEVELS, TERMS, Subject } from '../types';
// Fix: Added IconFile to the imported icons from ./Icons
import { IconTrash, IconPlus, IconFile } from './Icons';

export const AdminDashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'NOTES' | 'SUBJECTS'>('NOTES');
  const [isLoading, setIsLoading] = useState(false);
  
  // Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'NOTE' | 'SUBJECT', name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [noteForm, setNoteForm] = useState({ noteName: '', noteGoogleDriveLink: '', subjectId: '' });
  const [subjectForm, setSubjectForm] = useState({ subjectName: '', department: 'Yarn' as Department, level: 1, term: 1 });

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'NOTES') {
        const [n, s] = await Promise.all([fetchNotes(), fetchAllSubjects()]);
        setNotes(n); setSubjects(s);
      } else {
        const s = await fetchAllSubjects();
        setSubjects(s);
      }
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNote(noteForm);
      setNoteForm({ noteName: '', noteGoogleDriveLink: '', subjectId: '' });
      setIsNoteFormOpen(false);
      await loadData();
    } catch (err: any) { alert("Failed to add note: " + err.message); }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubject(subjectForm);
      setSubjectForm({ subjectName: '', department: 'Yarn', level: 1, term: 1 });
      setIsSubjectFormOpen(false);
      await loadData();
    } catch (err: any) { alert("Failed to add subject: " + err.message); }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'NOTE') {
        await deleteNoteApi(deleteTarget.id);
      } else {
        await deleteSubjectApi(deleteTarget.id);
      }
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(`Error deleting ${deleteTarget.type.toLowerCase()}: Ensure no resources are linked to this item.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)}></div>
          <div className="relative w-full max-w-md glass-card p-8 rounded-[2.5rem] shadow-2xl border border-white/60 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IconTrash className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Confirm Deletion</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
              Are you sure you want to remove <span className="font-black text-slate-800">"{deleteTarget.name}"</span>? 
              This action is permanent and cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)} 
                className="py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={executeDelete} 
                className="py-4 bg-rose-500 text-white font-black rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? 'Removing...' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between glass-card p-2 rounded-[2.5rem] max-w-md mx-auto shadow-xl">
        <button 
          onClick={() => setActiveTab('NOTES')} 
          className={`flex-1 py-3.5 rounded-[1.8rem] text-xs font-black transition-all ${activeTab === 'NOTES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
        >
          RESOURCES
        </button>
        <button 
          onClick={() => setActiveTab('SUBJECTS')} 
          className={`flex-1 py-3.5 rounded-[1.8rem] text-xs font-black transition-all ${activeTab === 'SUBJECTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
        >
          SUBJECTS
        </button>
      </div>

      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 px-4">
        <div>
          <h2 className="text-4xl font-[900] text-slate-900 tracking-tight">
            {activeTab === 'NOTES' ? 'Note Assets' : 'Subject Master'}
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Manage database records directly from this interface.</p>
        </div>
        <button 
          onClick={() => activeTab === 'NOTES' ? setIsNoteFormOpen(!isNoteFormOpen) : setIsSubjectFormOpen(!isSubjectFormOpen)} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
        >
          <IconPlus className="w-5 h-5" /> 
          {activeTab === 'NOTES' ? 'Add Note' : 'Add Subject'}
        </button>
      </div>

      {/* Forms */}
      {(isNoteFormOpen || isSubjectFormOpen) && (
        <div className="glass-card p-8 rounded-[3rem] border border-white/80 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          {activeTab === 'NOTES' ? (
            <form onSubmit={handleNoteSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input required value={noteForm.noteName} onChange={e => setNoteForm({...noteForm, noteName: e.target.value})} placeholder="e.g. Yarn Mfg Lecture 01" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Associated Subject</label>
                <select required value={noteForm.subjectId} onChange={e => setNoteForm({...noteForm, subjectId: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold">
                  <option value="">Choose subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName} (L{s.level}-T{s.term})</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cloud Link (PDF)</label>
                <input required type="url" value={noteForm.noteGoogleDriveLink} onChange={e => setNoteForm({...noteForm, noteGoogleDriveLink: e.target.value})} placeholder="https://drive.google.com/..." className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsNoteFormOpen(false)} className="px-8 py-4 text-slate-500 font-black rounded-2xl transition-all">Cancel</button>
                 <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Save Resource</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubjectSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Nomenclature</label>
                <input required value={subjectForm.subjectName} onChange={e => setSubjectForm({...subjectForm, subjectName: e.target.value})} placeholder="e.g. Advanced Knitting" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                   <select value={subjectForm.department} onChange={e => setSubjectForm({...subjectForm, department: e.target.value as Department})} className="w-full p-4 rounded-2xl font-bold bg-white border">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Level</label>
                   <select value={subjectForm.level} onChange={e => setSubjectForm({...subjectForm, level: Number(e.target.value)})} className="w-full p-4 rounded-2xl font-bold bg-white border">
                    {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester Term</label>
                   <select value={subjectForm.term} onChange={e => setSubjectForm({...subjectForm, term: Number(e.target.value)})} className="w-full p-4 rounded-2xl font-bold bg-white border">
                    {TERMS.map(t => <option key={t} value={t}>Term {t}</option>)}
                   </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                 <button type="button" onClick={() => setIsSubjectFormOpen(false)} className="px-8 py-4 text-slate-500 font-black rounded-2xl transition-all">Cancel</button>
                 <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Register Subject</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Table Section */}
      <div className="glass-card rounded-[3rem] overflow-hidden border border-white shadow-lg">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {isLoading ? (
                <tr><td colSpan={3} className="p-20 text-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Querying Cloud...</p></td></tr>
              ) : (activeTab === 'NOTES' ? notes : subjects).length > 0 ? (
                (activeTab === 'NOTES' ? notes : subjects).map((item: any) => (
                  <tr key={item._id} className="group hover:bg-white/40 transition-colors">
                    <td className="px-10 py-6">
                      <div className="font-extrabold text-slate-800">{item.noteName || item.subjectName}</div>
                      <div className="text-[10px] text-indigo-500 font-bold uppercase mt-1 tracking-tight">
                        {item.subjectId?.subjectName || `${item.department} Department`}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-[10px] font-black rounded-full text-slate-500">L{item.level || item.subjectId?.level}</span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase">T{item.term || item.subjectId?.term}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => setDeleteTarget({ 
                          id: item._id, 
                          type: activeTab === 'NOTES' ? 'NOTE' : 'SUBJECT', 
                          name: item.noteName || item.subjectName 
                        })} 
                        className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <IconTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-24 text-center">
                    <div className="bg-slate-50 inline-block p-6 rounded-[2.5rem] mb-4">
                      <IconFile className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No cloud records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
