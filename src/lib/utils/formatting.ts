/**
 * Formatting Utilities
 * 
 * Data formatting helpers for dates, numbers, text, progress values,
 * and other display formatting needs throughout the application.
 * 
 * Location: src/lib/utils/formatting.ts
 */

// Date formatting utilities using native JavaScript (no external dependencies)
export function formatDate(
  date: Date | string | number,
  formatStr: string = 'default',
  locale: 'en' | 'nl' = 'en'
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    if (!isValidDate(dateObj)) return 'Invalid Date';
    
    const options: Intl.DateTimeFormatOptions = getDateFormatOptions(formatStr);
    const localeCode = locale === 'nl' ? 'nl-NL' : 'en-US';
    
    return new Intl.DateTimeFormat(localeCode, options).format(dateObj);
  } catch {
    return 'Invalid Date';
  }
}

export function formatRelativeTime(
  date: Date | string | number,
  locale: 'en' | 'nl' = 'en'
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    if (!isValidDate(dateObj)) return 'Invalid Date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    const localeCode = locale === 'nl' ? 'nl-NL' : 'en-US';
    
    // Use Intl.RelativeTimeFormat for modern browsers
    if ('RelativeTimeFormat' in Intl) {
      const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });
      
      if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
      if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
      if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
      if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
      if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
    
    // Fallback for older browsers
    return formatRelativeTimeFallback(diffInSeconds);
  } catch {
    return 'Invalid Date';
  }
}

export function formatTime(date: Date | string | number): string {
  return formatDate(date, 'time');
}

export function formatDateTime(
  date: Date | string | number,
  locale: 'en' | 'nl' = 'en'
): string {
  return formatDate(date, 'datetime', locale);
}

export function formatDateShort(date: Date | string | number): string {
  return formatDate(date, 'short');
}

// Helper functions for date formatting
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

function getDateFormatOptions(formatStr: string): Intl.DateTimeFormatOptions {
  switch (formatStr) {
    case 'time':
      return { hour: '2-digit', minute: '2-digit' };
    case 'datetime':
      return { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      };
    case 'short':
      return { month: '2-digit', day: '2-digit', year: 'numeric' };
    case 'long':
      return { year: 'numeric', month: 'long', day: 'numeric' };
    default:
      return { year: 'numeric', month: 'long', day: 'numeric' };
  }
}

function formatRelativeTimeFallback(diffInSeconds: number): string {
  const absSeconds = Math.abs(diffInSeconds);
  const future = diffInSeconds < 0;
  const suffix = future ? ' ago' : ' from now';
  
  if (absSeconds < 60) return `${absSeconds} seconds${suffix}`;
  if (absSeconds < 3600) return `${Math.floor(absSeconds / 60)} minutes${suffix}`;
  if (absSeconds < 86400) return `${Math.floor(absSeconds / 3600)} hours${suffix}`;
  if (absSeconds < 2592000) return `${Math.floor(absSeconds / 86400)} days${suffix}`;
  if (absSeconds < 31536000) return `${Math.floor(absSeconds / 2592000)} months${suffix}`;
  return `${Math.floor(absSeconds / 31536000)} years${suffix}`;
}

// Number formatting utilities
export function formatNumber(
  num: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', options).format(num);
}

export function formatPercent(
  value: number,
  decimals: number = 0,
  showSymbol: boolean = true
): string {
  const formatted = value.toFixed(decimals);
  return showSymbol ? `${formatted}%` : formatted;
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Progress and statistics formatting
export function formatProgress(current: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = Math.round((current / total) * 100);
  return `${percentage}%`;
}

export function formatProgressWithNumbers(current: number, total: number): string {
  const percentage = formatProgress(current, total);
  return `${current}/${total} (${percentage})`;
}

export function formatStreak(days: number): string {
  if (days === 0) return 'No streak';
  if (days === 1) return '1 day streak';
  return `${days} days streak`;
}

export function formatAccuracy(correct: number, total: number): string {
  if (total === 0) return 'N/A';
  const percentage = Math.round((correct / total) * 100);
  return `${percentage}%`;
}

export function formatGrade(score: number, maxScore: number = 100): string {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

// Text formatting utilities with bulletproof undefined handling
export function formatName(firstName: string, lastName?: string): string {
  // Type guard to ensure firstName is a valid string
  if (typeof firstName !== 'string' || !firstName.trim()) {
    if (typeof lastName === 'string' && lastName.trim()) {
      return lastName.trim();
    }
    return 'Unknown User';
  }
  
  if (typeof lastName === 'string' && lastName.trim()) {
    return `${firstName.trim()} ${lastName.trim()}`;
  }
  
  return firstName.trim();
}

export function formatInitials(name: string): string {
  if (typeof name !== 'string' || !name.trim()) {
    return '??';
  }
  
  return name
    .split(' ')
    .map(part => part.trim().charAt(0).toUpperCase())
    .filter(initial => initial.length > 0)
    .join('')
    .slice(0, 3); // Limit to 3 characters
}

export function formatDisplayName(
  name: string,
  maxLength: number = 20
): string {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Unknown User';
  }
  
  const trimmedName = name.trim();
  if (trimmedName.length <= maxLength) return trimmedName;
  
  const parts = trimmedName.split(' ').filter(part => part.length > 0);
  if (parts.length === 1) {
    return trimmedName.slice(0, maxLength - 3) + '...';
  }
  
  // Try to show first name + last initial
  const firstName = parts[0];
  const lastPart = parts[parts.length - 1];
  
  if (!firstName || !lastPart) {
    return trimmedName.slice(0, maxLength - 3) + '...';
  }
  
  const lastInitial = lastPart.charAt(0);
  const formatted = `${firstName} ${lastInitial}.`;
  
  if (formatted.length <= maxLength) return formatted;
  
  // If still too long, truncate first name
  return firstName.slice(0, maxLength - 3) + '...';
}

export function formatSubject(subject: string): string {
  if (typeof subject !== 'string') return 'Unknown Subject';
  
  const subjectMap: Record<string, string> = {
    math: 'Mathematics',
    science: 'Science',
    coding: 'Programming',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    algebra: 'Algebra',
    geometry: 'Geometry',
    calculus: 'Calculus',
  };
  
  return subjectMap[subject.toLowerCase()] || subject;
}

export function formatGradeLevel(grade: string | number): string {
  const gradeNum = typeof grade === 'string' ? parseInt(grade, 10) : grade;
  
  if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
    return 'Unknown Grade';
  }
  
  if (gradeNum >= 4 && gradeNum <= 20) {
    return `${gradeNum}th Grade`;
  }
  
  const lastDigit = gradeNum % 10;
  const suffixes = ['st', 'nd', 'rd'];
  
  if (lastDigit >= 1 && lastDigit <= 3 && (gradeNum < 10 || gradeNum > 20)) {
    return `${gradeNum}${suffixes[lastDigit - 1]} Grade`;
  }
  
  return `${gradeNum}th Grade`;
}

// List and array formatting
export function formatList(
  items: string[],
  maxItems: number = 3,
  conjunction: string = 'and'
): string {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  const validItems = items.filter(item => typeof item === 'string' && item.trim().length > 0);
  
  if (validItems.length === 0) return '';
  if (validItems.length === 1) return validItems[0]!; // Non-null assertion safe after length check
  if (validItems.length === 2) return `${validItems[0]} ${conjunction} ${validItems[1]}`;
  
  if (validItems.length <= maxItems) {
    const itemsCopy = [...validItems];
    const lastItem = itemsCopy.pop();
    if (!lastItem) return validItems.join(', ');
    return `${itemsCopy.join(', ')}, ${conjunction} ${lastItem}`;
  }
  
  const displayed = validItems.slice(0, maxItems);
  const remaining = validItems.length - maxItems;
  return `${displayed.join(', ')}, and ${remaining} more`;
}

export function formatTags(tags: string[], maxTags: number = 3): string {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  
  const validTags = tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
  
  if (validTags.length === 0) return '';
  if (validTags.length <= maxTags) return validTags.join(', ');
  
  const displayed = validTags.slice(0, maxTags);
  const remaining = validTags.length - maxTags;
  return `${displayed.join(', ')}, +${remaining} more`;
}

// URL and slug formatting
export function createSlug(text: string): string {
  if (typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatUrl(url: string): string {
  if (typeof url !== 'string' || !url.trim()) return '';
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `https://${trimmedUrl}`;
  }
  return trimmedUrl;
}

// Badge and achievement formatting
export function formatBadgeRarity(rarity: string): string {
  if (typeof rarity !== 'string') return 'Unknown';
  
  const rarityMap: Record<string, string> = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  };
  
  return rarityMap[rarity.toLowerCase()] || rarity;
}

export function formatAchievementDescription(
  type: string,
  value: number
): string {
  if (typeof type !== 'string' || typeof value !== 'number') {
    return 'Unknown Achievement';
  }
  
  const descriptions: Record<string, (value: number) => string> = {
    streak: (days) => `Maintained a ${days}-day learning streak`,
    problems_solved: (count) => `Solved ${count} problems`,
    time_spent: (minutes) => `Spent ${formatDuration(minutes)} learning`,
    accuracy: (percent) => `Achieved ${percent}% accuracy`,
    topics_mastered: (count) => `Mastered ${count} topics`,
  };
  
  const formatter = descriptions[type];
  return formatter ? formatter(value) : `Achievement: ${value}`;
}

// Error message formatting
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

export function formatValidationErrors(errors: Record<string, string[]>): string {
  if (typeof errors !== 'object' || errors === null) return '';
  
  const errorMessages = Object.values(errors).flat().filter(msg => typeof msg === 'string');
  return errorMessages.join('. ');
}

// Search and highlight formatting
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (typeof text !== 'string' || typeof searchTerm !== 'string' || !searchTerm.trim()) {
    return text || '';
  }
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function truncateWithHighlight(
  text: string,
  searchTerm: string,
  maxLength: number = 150
): string {
  if (typeof text !== 'string') return '';
  if (typeof searchTerm !== 'string' || !searchTerm.trim() || text.length <= maxLength) {
    return highlightSearchTerm(text, searchTerm);
  }
  
  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (index === -1) {
    return highlightSearchTerm(text.slice(0, maxLength) + '...', searchTerm);
  }
  
  // Try to center the search term in the truncated text
  const start = Math.max(0, index - Math.floor(maxLength / 2));
  const end = Math.min(text.length, start + maxLength);
  
  let truncated = text.slice(start, end);
  if (start > 0) truncated = '...' + truncated;
  if (end < text.length) truncated = truncated + '...';
  
  return highlightSearchTerm(truncated, searchTerm);
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  return phone; // Return original if can't format
}

// Address formatting
export function formatAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string {
  if (typeof address !== 'object' || address === null) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state && address.zipCode ? `${address.state} ${address.zipCode}` : address.state || address.zipCode,
    address.country,
  ].filter(part => typeof part === 'string' && part.trim().length > 0);
  
  return parts.join(', ');
}

// Social media formatting
export function formatMention(username: string): string {
  if (typeof username !== 'string' || !username.trim()) return '';
  
  const trimmed = username.trim();
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function formatHashtag(tag: string): string {
  if (typeof tag !== 'string' || !tag.trim()) return '';
  
  const trimmed = tag.trim();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

// Code formatting
export function formatCodeSnippet(code: string, language: string = ''): string {
  if (typeof code !== 'string') return '';
  
  const lang = typeof language === 'string' ? language : '';
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

export function formatInlineCode(code: string): string {
  if (typeof code !== 'string') return '';
  return `\`${code}\``;
}

// Metric formatting for dashboards
export function formatMetric(
  value: number,
  type: 'number' | 'percentage' | 'currency' | 'duration' = 'number'
): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  
  switch (type) {
    case 'percentage':
      return formatPercent(value);
    case 'currency':
      return formatCurrency(value);
    case 'duration':
      return formatDuration(value);
    default:
      return formatNumber(value);
  }
}

export function formatChangeIndicator(
  current: number,
  previous: number,
  format: 'percentage' | 'absolute' = 'percentage'
): { value: string; trend: 'up' | 'down' | 'neutral'; color: string } {
  if (typeof current !== 'number' || typeof previous !== 'number' || isNaN(current) || isNaN(previous)) {
    return { value: 'N/A', trend: 'neutral', color: 'text-gray-600' };
  }
  
  const change = current - previous;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  let value: string;
  if (format === 'percentage' && previous !== 0) {
    const percentChange = (change / previous) * 100;
    value = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
  } else {
    value = `${change > 0 ? '+' : ''}${change}`;
  }
  
  const color = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  
  return { value, trend, color };
}

// Export type helpers for commonly formatted data
export interface FormattedMetric {
  value: string;
  label: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    color: string;
  };
}

export interface FormattedProgress {
  percentage: string;
  fraction: string;
  remaining: number;
  isComplete: boolean;
}

export interface FormattedUser {
  displayName: string;
  initials: string;
  fullName: string;
}

// Type-safe user data formatter class
export class UserNameFormatter {
  // Comprehensive formatter with type guards
  static format(user: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  }, options: {
    style?: 'full' | 'first' | 'last' | 'initials';
    fallback?: string;
    required?: boolean;
  } = {}): string {
    const { style = 'full', fallback = 'Anonymous', required = false } = options;
    
    // Safe extraction with type guards
    const firstName = typeof user.firstName === 'string' ? user.firstName.trim() : '';
    const lastName = typeof user.lastName === 'string' ? user.lastName.trim() : '';
    const name = typeof user.name === 'string' ? user.name.trim() : '';
    
    // Required validation
    if (required && !firstName && !lastName && !name) {
      throw new Error('At least one name component is required');
    }
    
    switch (style) {
      case 'full':
        if (name) return name;
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        return fullName || fallback;
        
      case 'first':
        return firstName || name.split(' ')[0] || fallback;
        
      case 'last':
        return lastName || name.split(' ').pop() || fallback;
        
      case 'initials':
        const nameForInitials = name || [firstName, lastName].filter(Boolean).join(' ');
        const initials = nameForInitials
          .split(' ')
          .map(part => part.charAt(0)?.toUpperCase())
          .filter(Boolean)
          .join('');
        return initials || fallback;
        
      default:
        return fallback;
    }
  }
}

// Utility to format user data consistently with bulletproof typing
export function formatUserData(user: {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}): FormattedUser {
  // Type-safe extraction
  const firstName = typeof user.firstName === 'string' ? user.firstName.trim() : '';
  const lastName = typeof user.lastName === 'string' ? user.lastName.trim() : '';
  const providedName = typeof user.name === 'string' ? user.name.trim() : '';
  
  // Build full name with proper fallbacks
  const fullName = providedName || [firstName, lastName].filter(Boolean).join(' ') || 'Unknown User';
  const displayName = formatDisplayName(fullName);
  const initials = formatInitials(fullName);
  
  return {
    displayName,
    initials,
    fullName,
  };
}

// Utility to format progress data consistently
export function formatProgressData(current: number, total: number): FormattedProgress {
  if (typeof current !== 'number' || typeof total !== 'number' || isNaN(current) || isNaN(total)) {
    return {
      percentage: '0%',
      fraction: '0/0',
      remaining: 0,
      isComplete: false,
    };
  }
  
  const percentage = formatProgress(current, total);
  const fraction = `${current}/${total}`;
  const remaining = Math.max(0, total - current);
  const isComplete = current >= total;
  
  return {
    percentage,
    fraction,
    remaining,
    isComplete,
  };
}