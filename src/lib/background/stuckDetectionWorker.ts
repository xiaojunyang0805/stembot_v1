/**
 * Background Stuck Detection Worker
 * Runs every 10 minutes to detect stuck students and offer proactive help
 * Lightweight background processing without blocking UI
 */

import { analyzeQuestionProgressCached } from '../research/cachedQuestionAnalyzer';
import { QuestionMemoryHelpers } from '../memory/questionMemory';

export interface StuckStudentAlert {
  projectId: string;
  userId: string;
  stuckDuration: number; // minutes
  indicators: string[];
  suggestedHelp: string;
  confidence: number;
  lastActivity: Date;
}

interface StudentSession {
  projectId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  questionChanges: number;
  documentsUploaded: number;
  conversationCount: number;
  currentQuestion: string;
  timeSpent: number; // minutes
}

// In-memory session tracking (in production, this would be in database)
const activeSessions = new Map<string, StudentSession>();
const stuckAlerts = new Map<string, StuckStudentAlert>();

/**
 * Register student activity to track for stuck detection
 */
export function trackStudentActivity(
  projectId: string,
  userId: string,
  activityType: 'question_change' | 'document_upload' | 'conversation' | 'page_view',
  currentQuestion: string = ''
): void {
  const sessionKey = `${userId}:${projectId}`;
  const now = new Date();

  let session = activeSessions.get(sessionKey);

  if (!session) {
    // New session
    session = {
      projectId,
      userId,
      startTime: now,
      lastActivity: now,
      questionChanges: 0,
      documentsUploaded: 0,
      conversationCount: 0,
      currentQuestion,
      timeSpent: 0
    };
  } else {
    // Update existing session
    session.lastActivity = now;
    session.timeSpent = Math.round((now.getTime() - session.startTime.getTime()) / (1000 * 60));
    if (currentQuestion && currentQuestion !== session.currentQuestion) {
      session.currentQuestion = currentQuestion;
    }
  }

  // Track specific activity
  switch (activityType) {
    case 'question_change':
      session.questionChanges++;
      break;
    case 'document_upload':
      session.documentsUploaded++;
      break;
    case 'conversation':
      session.conversationCount++;
      break;
    case 'page_view':
      // Just update last activity time
      break;
  }

  activeSessions.set(sessionKey, session);

  console.log(`📊 Activity tracked: ${activityType} for ${sessionKey} (${session.timeSpent}min)`);
}

/**
 * Detect if a student appears to be stuck
 */
function detectStuckPatterns(session: StudentSession): StuckStudentAlert | null {
  const indicators: string[] = [];
  let confidence = 0;

  // Pattern 1: Long time, no question progress
  if (session.timeSpent > 30 && session.questionChanges === 0) {
    indicators.push('No question refinement after 30+ minutes');
    confidence += 0.3;
  }

  // Pattern 2: Documents uploaded but no engagement
  if (session.documentsUploaded > 0 && session.conversationCount <= 1 && session.timeSpent > 20) {
    indicators.push('Documents uploaded but minimal AI interaction');
    confidence += 0.4;
  }

  // Pattern 3: Very long session with little progress
  if (session.timeSpent > 45 && session.conversationCount < 3) {
    indicators.push('Extended session with low engagement');
    confidence += 0.2;
  }

  // Pattern 4: Multiple documents but same vague question
  if (session.documentsUploaded > 2 && session.questionChanges === 0) {
    indicators.push('Multiple documents but question unchanged');
    confidence += 0.3;
  }

  // Analyze question quality if available
  if (session.currentQuestion) {
    const questionAnalysis = analyzeQuestionProgressCached(
      session.currentQuestion,
      session.conversationCount,
      session.documentsUploaded
    );

    if (questionAnalysis.progress < 30 && session.timeSpent > 25) {
      indicators.push('Low question progress despite time investment');
      confidence += 0.2;
    }
  }

  // Only consider it "stuck" if confidence is high enough
  if (confidence < 0.4 || indicators.length < 2) {
    return null;
  }

  // Generate contextual help suggestion
  let suggestedHelp = "I notice you've been working on this for a while. What aspect of your research interests you most?";

  if (session.documentsUploaded > 0) {
    suggestedHelp = `Your uploaded ${session.documentsUploaded > 1 ? 'documents suggest' : 'document suggests'} specific research directions. What caught your attention in the material?`;
  }

  if (session.currentQuestion.toLowerCase().includes('measurement') || session.currentQuestion.toLowerCase().includes('accuracy')) {
    suggestedHelp = "Your research seems focused on measurement techniques. Are you interested in precision, accuracy, or systematic errors?";
  }

  if (session.currentQuestion.toLowerCase().includes('reaction') || session.currentQuestion.toLowerCase().includes('chemical')) {
    suggestedHelp = "Chemical research is fascinating! Are you more interested in reaction kinetics, mechanisms, or outcomes?";
  }

  if (session.currentQuestion.toLowerCase().includes('growth') || session.currentQuestion.toLowerCase().includes('bacterial')) {
    suggestedHelp = "Biological growth studies offer many directions. Are you focusing on environmental factors, growth rates, or specific organisms?";
  }

  return {
    projectId: session.projectId,
    userId: session.userId,
    stuckDuration: session.timeSpent,
    indicators,
    suggestedHelp,
    confidence,
    lastActivity: session.lastActivity
  };
}

/**
 * Background worker function - runs every 10 minutes
 */
export async function runStuckDetectionScan(): Promise<StuckStudentAlert[]> {
  const alerts: StuckStudentAlert[] = [];
  const now = new Date();

  console.log(`🔍 Running stuck detection scan at ${now.toLocaleTimeString()}`);

  for (const [sessionKey, session] of activeSessions.entries()) {
    // Only check sessions that are recent (last 2 hours)
    const timeSinceActivity = (now.getTime() - session.lastActivity.getTime()) / (1000 * 60);
    if (timeSinceActivity > 120) {
      // Clean up old sessions
      activeSessions.delete(sessionKey);
      continue;
    }

    // Check if student appears stuck
    const stuckAlert = detectStuckPatterns(session);

    if (stuckAlert) {
      // Check if we already alerted for this session recently
      const existingAlert = stuckAlerts.get(sessionKey);
      if (!existingAlert || (now.getTime() - existingAlert.lastActivity.getTime()) > 30 * 60 * 1000) {
        // New alert or it's been 30+ minutes since last alert
        alerts.push(stuckAlert);
        stuckAlerts.set(sessionKey, stuckAlert);

        // Store the proactive help in memory
        try {
          await QuestionMemoryHelpers.storeAISuggestion(
            session.projectId,
            `Proactive help: ${stuckAlert.suggestedHelp}`,
            session.currentQuestion
          );
          console.log(`🤖 Proactive help stored for stuck student: ${sessionKey}`);
        } catch (error) {
          console.warn('Error storing proactive help:', error);
        }
      }
    }
  }

  console.log(`📊 Stuck detection completed: ${alerts.length} new alerts, ${activeSessions.size} active sessions`);
  return alerts;
}

/**
 * Start the background stuck detection worker
 */
export function startStuckDetectionWorker(): NodeJS.Timer {
  console.log('🚀 Starting background stuck detection worker (10-minute intervals)');

  // Run initial scan
  runStuckDetectionScan();

  // Schedule recurring scans every 10 minutes
  return setInterval(() => {
    runStuckDetectionScan().catch(error => {
      console.error('Error in stuck detection scan:', error);
    });
  }, 10 * 60 * 1000); // 10 minutes
}

/**
 * Get current session statistics for monitoring
 */
export function getSessionStats() {
  const now = new Date();
  let activeStudents = 0;
  let stuckStudents = 0;

  for (const [sessionKey, session] of activeSessions.entries()) {
    const timeSinceActivity = (now.getTime() - session.lastActivity.getTime()) / (1000 * 60);
    if (timeSinceActivity <= 30) { // Active in last 30 minutes
      activeStudents++;
      if (stuckAlerts.has(sessionKey)) {
        stuckStudents++;
      }
    }
  }

  return {
    activeStudents,
    stuckStudents,
    totalSessions: activeSessions.size,
    alertsGenerated: stuckAlerts.size
  };
}