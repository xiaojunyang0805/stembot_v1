/**
 * Writing Context Manager for AI Conversations
 * Retrieves and formats writing progress for StemBot awareness
 */

export interface WritingSection {
  id: string;
  section_name: string;
  content: string;
  word_count: number;
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface WritingStatus {
  overall_progress: number; // percentage
  total_words: number;
  target_words: number;
  current_section: string | null;
  current_section_words: number;
  current_section_target: number;
  last_activity: string | null;
  next_section: string | null;
  sections: WritingSection[];
}

// Standard research paper structure with typical word counts
const STANDARD_SECTIONS = [
  { name: 'Introduction', targetWords: 800 },
  { name: 'Literature Review', targetWords: 1200 },
  { name: 'Methods', targetWords: 600 },
  { name: 'Results', targetWords: 400 },
  { name: 'Discussion', targetWords: 600 },
  { name: 'Conclusion', targetWords: 300 }
];

const TOTAL_TARGET_WORDS = STANDARD_SECTIONS.reduce((sum, s) => sum + s.targetWords, 0);

/**
 * Fetches writing status from the database
 */
export async function getWritingStatus(projectId: string): Promise<WritingStatus | null> {
  try {
    const response = await fetch(`/api/writing/sections?projectId=${projectId}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('Failed to fetch writing sections:', response.statusText);
      return null;
    }

    const { sections } = await response.json();

    if (!sections || sections.length === 0) {
      // No writing started yet
      return {
        overall_progress: 0,
        total_words: 0,
        target_words: TOTAL_TARGET_WORDS,
        current_section: null,
        current_section_words: 0,
        current_section_target: 0,
        last_activity: null,
        next_section: STANDARD_SECTIONS[0].name,
        sections: []
      };
    }

    // Calculate overall progress
    const totalWords = sections.reduce((sum: number, s: WritingSection) => sum + s.word_count, 0);
    const overallProgress = Math.round((totalWords / TOTAL_TARGET_WORDS) * 100);

    // Find current section (last updated in_progress or completed section)
    const sortedSections = [...sections].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    const currentSection = sortedSections.find(s => s.status === 'in_progress') || sortedSections[0];

    // Find next section
    const completedSections = sections.filter((s: WritingSection) => s.status === 'completed');
    const nextStandardSection = STANDARD_SECTIONS.find(std =>
      !sections.some((s: WritingSection) => s.section_name === std.name && s.status !== 'not_started')
    );

    // Get target words for current section
    const currentSectionTarget = STANDARD_SECTIONS.find(
      s => s.name === currentSection?.section_name
    )?.targetWords || 0;

    return {
      overall_progress: overallProgress,
      total_words: totalWords,
      target_words: TOTAL_TARGET_WORDS,
      current_section: currentSection?.section_name || null,
      current_section_words: currentSection?.word_count || 0,
      current_section_target: currentSectionTarget,
      last_activity: currentSection?.updated_at || null,
      next_section: nextStandardSection?.name || null,
      sections
    };

  } catch (error) {
    console.error('Error fetching writing status:', error);
    return null;
  }
}

/**
 * Formats writing status for AI context prompt
 */
export function formatWritingContext(writingStatus: WritingStatus | null): string {
  if (!writingStatus || writingStatus.total_words === 0) {
    return `\n\n📝 WRITING STATUS:
- No writing started yet
- Ready to begin academic paper writing when student is ready
`;
  }

  const parts: string[] = [];

  parts.push(`\n\n📝 STUDENT'S WRITING STATUS:`);
  parts.push(`\nOverall Progress: ${writingStatus.overall_progress}% (${writingStatus.total_words}/${writingStatus.target_words} words)`);

  if (writingStatus.current_section) {
    const sectionProgress = writingStatus.current_section_target > 0
      ? Math.round((writingStatus.current_section_words / writingStatus.current_section_target) * 100)
      : 0;

    parts.push(`\nCurrent Section: ${writingStatus.current_section} (${writingStatus.current_section_words}/${writingStatus.current_section_target} words, ${sectionProgress}%)`);
  }

  if (writingStatus.last_activity) {
    const lastActivity = new Date(writingStatus.last_activity);
    const hoursAgo = Math.round((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60));

    let activityText = 'just now';
    if (hoursAgo >= 24) {
      const daysAgo = Math.floor(hoursAgo / 24);
      activityText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    } else if (hoursAgo >= 1) {
      activityText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    }

    parts.push(`Last Activity: ${activityText}`);
  }

  if (writingStatus.next_section) {
    parts.push(`Next Section: ${writingStatus.next_section}`);
  }

  // Add snippet of current section content if available
  const currentSectionData = writingStatus.sections.find(
    s => s.section_name === writingStatus.current_section
  );

  if (currentSectionData && currentSectionData.content && currentSectionData.content.length > 0) {
    const contentSnippet = currentSectionData.content.substring(0, 200).trim();
    parts.push(`\nCurrent Section Content Preview:`);
    parts.push(`"${contentSnippet}${currentSectionData.content.length > 200 ? '...' : ''}"`);
  }

  // Add context guidance for AI
  parts.push(`\n💡 WRITING-AWARE GUIDANCE:`);
  parts.push(`- You KNOW about their writing progress without them having to tell you`);
  parts.push(`- Reference their progress naturally: "I see you've started your ${writingStatus.current_section}..."`);
  parts.push(`- Offer specific help: "For your ${writingStatus.next_section || 'next section'}, you'll need to..."`);
  parts.push(`- Provide content-aware suggestions based on what they've written`);
  parts.push(`- When they ask writing questions, connect to their actual progress`);

  return parts.join('\n');
}

/**
 * Determines if a user message is writing-related
 */
export function isWritingQuery(message: string): boolean {
  const writingKeywords = [
    'writing', 'write', 'paper', 'introduction', 'conclusion', 'methods', 'results',
    'discussion', 'literature review', 'section', 'paragraph', 'draft', 'stuck on',
    'how do i write', 'help me write', 'working on'
  ];

  const lowerMessage = message.toLowerCase();
  return writingKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Gets writing context for chat (to be called from enhanced-chat route)
 */
export async function getWritingContextForChat(
  projectId: string,
  userMessage?: string
): Promise<{
  hasWriting: boolean;
  contextPrompt: string;
  writingStatus: WritingStatus | null;
}> {
  try {
    const writingStatus = await getWritingStatus(projectId);

    if (!writingStatus || writingStatus.total_words === 0) {
      return {
        hasWriting: false,
        contextPrompt: '',
        writingStatus: null
      };
    }

    const contextPrompt = formatWritingContext(writingStatus);

    return {
      hasWriting: true,
      contextPrompt,
      writingStatus
    };

  } catch (error) {
    console.error('Error building writing context:', error);
    return {
      hasWriting: false,
      contextPrompt: '',
      writingStatus: null
    };
  }
}
