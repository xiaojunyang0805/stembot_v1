/**
 * Nudge Detector - Gentle Progress Reminders
 * Detects when students might benefit from gentle nudges (never aggressive)
 */

import { WritingStatus } from './writingContext';

export interface NudgeInfo {
  shouldShow: boolean;
  type: 'none' | 'inactivity' | 'almost_done' | 'low_progress';
  message: string;
  actionText: string;
  actionUrl: string;
  daysInactive?: number;
  sectionName?: string;
  wordsRemaining?: number;
}

/**
 * Detects if a gentle nudge should be shown based on writing status
 */
export function detectWritingNudge(
  writingStatus: WritingStatus | null,
  projectId: string
): NudgeInfo {
  const defaultNudge: NudgeInfo = {
    shouldShow: false,
    type: 'none',
    message: '',
    actionText: '',
    actionUrl: ''
  };

  // No writing started yet - no nudge
  if (!writingStatus || writingStatus.total_words === 0) {
    return defaultNudge;
  }

  const currentSection = writingStatus.current_section;
  const lastActivity = writingStatus.last_activity
    ? new Date(writingStatus.last_activity)
    : null;

  if (!lastActivity) {
    return defaultNudge;
  }

  // Calculate days since last activity
  const daysInactive = Math.floor(
    (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  // TRIGGER 1: Inactivity - Show after 7 days
  if (daysInactive >= 7) {
    const timeText = daysInactive >= 14
      ? `${Math.floor(daysInactive / 7)} week${daysInactive >= 21 ? 's' : ''}`
      : `${daysInactive} day${daysInactive > 1 ? 's' : ''}`;

    return {
      shouldShow: true,
      type: 'inactivity',
      message: currentSection
        ? `It's been ${timeText} since you worked on your paper. Your ${currentSection} is waiting at ${writingStatus.current_section_words}/${writingStatus.current_section_target} words.`
        : `It's been ${timeText} since you worked on your paper. Ready to continue writing?`,
      actionText: currentSection ? `Continue ${currentSection}` : 'Continue Writing',
      actionUrl: `/projects/${projectId}/writing`,
      daysInactive,
      sectionName: currentSection || undefined
    };
  }

  // TRIGGER 2: Section almost done (>80% complete)
  if (
    currentSection &&
    writingStatus.current_section_target > 0 &&
    writingStatus.current_section_words >= writingStatus.current_section_target * 0.8 &&
    writingStatus.current_section_words < writingStatus.current_section_target
  ) {
    const wordsRemaining = writingStatus.current_section_target - writingStatus.current_section_words;

    return {
      shouldShow: true,
      type: 'almost_done',
      message: `Great progress! Your ${currentSection} is ${writingStatus.current_section_words}/${writingStatus.current_section_target} words. Just ${wordsRemaining} more word${wordsRemaining > 1 ? 's' : ''} to complete this section.`,
      actionText: `Finish ${currentSection}`,
      actionUrl: `/projects/${projectId}/writing`,
      sectionName: currentSection,
      wordsRemaining
    };
  }

  // TRIGGER 3: Low progress (<20%) and section started but stalled
  if (
    writingStatus.overall_progress < 20 &&
    writingStatus.current_section_words >= 50 &&
    writingStatus.current_section_words < writingStatus.current_section_target * 0.5 &&
    daysInactive >= 3
  ) {
    return {
      shouldShow: true,
      type: 'low_progress',
      message: currentSection
        ? `You're ${writingStatus.overall_progress}% done with your paper. Your ${currentSection} is in progress (${writingStatus.current_section_words}/${writingStatus.current_section_target} words).`
        : `You're ${writingStatus.overall_progress}% done with your paper. Ready to continue?`,
      actionText: 'Continue Writing',
      actionUrl: `/projects/${projectId}/writing`,
      daysInactive,
      sectionName: currentSection || undefined
    };
  }

  // No nudge needed
  return defaultNudge;
}

/**
 * Gets a gentle, positive nudge message for the memory panel
 */
export function getMemoryPanelNudge(
  writingStatus: WritingStatus | null,
  projectId: string
): { message: string; actionUrl: string } | null {
  if (!writingStatus || writingStatus.total_words === 0) {
    return null;
  }

  const currentSection = writingStatus.current_section;
  const progressPercent = writingStatus.overall_progress;

  // Always show current progress in memory panel (gentle, informative)
  if (currentSection && writingStatus.current_section_target > 0) {
    const sectionPercent = Math.round(
      (writingStatus.current_section_words / writingStatus.current_section_target) * 100
    );

    return {
      message: `You're ${progressPercent}% done with your paper. Your ${currentSection} is ${sectionPercent}% complete (${writingStatus.current_section_words}/${writingStatus.current_section_target} words).`,
      actionUrl: `/projects/${projectId}/writing`
    };
  }

  // Generic progress message
  return {
    message: `You're ${progressPercent}% done with your paper (${writingStatus.total_words}/${writingStatus.target_words} words).`,
    actionUrl: `/projects/${projectId}/writing`
  };
}

/**
 * Formats time since last activity in human-readable format
 */
export function formatTimeSinceActivity(lastActivity: string | null): string {
  if (!lastActivity) {
    return 'No recent activity';
  }

  const lastDate = new Date(lastActivity);
  const hoursAgo = Math.round((Date.now() - lastDate.getTime()) / (1000 * 60 * 60));

  if (hoursAgo < 1) {
    return 'just now';
  } else if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  } else {
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  }
}
