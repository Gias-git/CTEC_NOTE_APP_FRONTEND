
export type Department = 'Yarn' | 'Fabric' | 'Wet' | 'Apparel';

export interface Subject {
  _id: string;
  subjectName: string;
  department: Department;
  level: number;
  term: number;
}

export interface Note {
  _id: string;
  noteName: string;
  noteGoogleDriveLink: string;
  subjectId: Subject; // Populated by Backend
  createdAt?: string;
}

export enum AppMode {
  VIEWER = 'viewer',
  ADMIN = 'admin'
}

export const DEPARTMENTS: Department[] = ['Yarn', 'Fabric', 'Wet', 'Apparel'];
export const LEVELS = [1, 2, 3, 4];
export const TERMS = [1, 2];
