import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function gradeColor(p: number): string {
  if (p >= 80) return '#1B3A7A'
  if (p >= 60) return '#2349A0'
  if (p >= 40) return '#C9960A'
  return '#C53030'
}
export function gradeLabel(p: number): string {
  if (p >= 90) return 'A+'; if (p >= 80) return 'A'; if (p >= 70) return 'B'
  if (p >= 60) return 'C';  if (p >= 50) return 'D'; if (p >= 40) return 'E'
  return 'F'
}
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1048576).toFixed(1)} MB`
}
export function formatDate(d: string): string { return new Date(d).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'}) }
export function formatDateTime(d: string): string { return new Date(d).toLocaleString('en-PK',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) }
export const BOARDS   = ['Federal','Punjab','Sindh','AKU','KPK','Balochistan']
export const CLASSES  = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11 (Pre-Medical)','Class 11 (Pre-Engineering)','Class 11 (Computer Science)','Class 12 (Pre-Medical)','Class 12 (Pre-Engineering)','Class 12 (Computer Science)']
export const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Urdu','Islamiyat','Pakistan Studies','Computer Science','Economics','Statistics','History','Geography','General Science']
export function truncate(text: string, max: number): string { return text.length > max ? text.slice(0,max)+'...' : text }
export function calculateClassAverage(marks: Array<{percentage:number}>): number { if(!marks.length) return 0; return Math.round(marks.reduce((s,m)=>s+m.percentage,0)/marks.length*100)/100 }
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T { let t: ReturnType<typeof setTimeout>; return ((...args: unknown[])=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),delay) }) as T }
