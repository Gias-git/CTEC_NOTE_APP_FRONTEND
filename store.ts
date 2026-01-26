
import { Note, Department, Subject } from './types';

const API_BASE = 'https://ctec-note-app-backend.vercel.app/api';
const AUTH_KEY = 'ctec_auth_token';

/**
 * Helper to extract an array from common API response patterns
 */
const extractArray = (data: any, key?: string): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    // Try specific key if provided
    if (key && Array.isArray(data[key])) return data[key];
    // Check if the object itself is the wrapper for the list
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.notes)) return data.notes;
    if (Array.isArray(data.subjects)) return data.subjects;
    
    // Fallback: Find the first property that is an array
    const firstArray = Object.values(data).find(val => Array.isArray(val));
    if (Array.isArray(firstArray)) return firstArray;
  }
  return [];
};

// Note APIs
export const fetchNotes = async (filters?: { department?: string; level?: number; term?: number; subjectId?: string }): Promise<Note[]> => {
  const params = new URLSearchParams();
  if (filters?.department) params.append('department', filters.department);
  if (filters?.level) params.append('level', filters.level.toString());
  if (filters?.term) params.append('term', filters.term.toString());
  if (filters?.subjectId) params.append('subjectId', filters.subjectId);
  
  const response = await fetch(`${API_BASE}/notes?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch notes');
  const data = await response.json();
  return extractArray(data, 'notes');
};

export const createNote = async (data: { noteName: string; noteGoogleDriveLink: string; subjectId: string }): Promise<Note> => {
  const response = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
};

export const deleteNoteApi = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete note');
};

// Subject APIs
export const fetchAllSubjects = async (): Promise<Subject[]> => {
  const response = await fetch(`${API_BASE}/subjects/all`);
  if (!response.ok) throw new Error('Failed to fetch all subjects');
  const data = await response.json();
  return extractArray(data, 'subjects');
};

export const fetchFilteredSubjects = async (dept: string, lvl: number): Promise<Subject[]> => {
  const response = await fetch(`${API_BASE}/subjects/filter?dept=${dept}&lvl=${lvl}`);
  if (!response.ok) throw new Error('Failed to fetch filtered subjects');
  const data = await response.json();
  return extractArray(data, 'subjects');
};

export const createSubject = async (subject: Omit<Subject, '_id'>): Promise<Subject> => {
  const response = await fetch(`${API_BASE}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create subject');
  }
  return response.json();
};

export const deleteSubjectApi = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete subject');
};

// Auth Helpers
export const checkAuth = (): boolean => {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
};

export const loginAdmin = (user: string, pass: string): boolean => {
  if (user === 'admin' && pass === 'admin123') {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logoutAdmin = () => {
  sessionStorage.removeItem(AUTH_KEY);
};
