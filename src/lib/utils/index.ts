import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
return 'just now';
}
  if (diffInSeconds < 3600) {
return `${Math.floor(diffInSeconds / 60)} minutes ago`;
}
  if (diffInSeconds < 86400) {
return `${Math.floor(diffInSeconds / 3600)} hours ago`;
}
  if (diffInSeconds < 604800) {
return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

  return formatDate(date);
}

export function safeJsonParse(jsonString: string, fallback: any = null): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fallback;
  }
}