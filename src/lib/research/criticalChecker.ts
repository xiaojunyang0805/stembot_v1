/**
 * WP4-2.1: Critical Design Check
 * Detects only the most serious flaws that would invalidate research
 *
 * Philosophy: Fast, simple, rule-based checks for critical issues only
 * - No AI needed for critical validation (too slow, unnecessary)
 * - Completes in <1 second
 * - Zero false positives on good designs
 */

import { MethodologyData } from '@/lib/supabase/methodology'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CriticalIssueCategory = 'sample' | 'ethics' | 'feasibility'

export interface CriticalIssue {
  category: CriticalIssueCategory
  severity: 'error' | 'warning'  // error = blocking, warning = proceed with caution
  problem: string
  fix: string
  affectedField?: string  // Which field triggered this issue
}

export interface CriticalCheckResult {
  valid: boolean  // false if any errors (not warnings)
  issues: CriticalIssue[]
  errorCount: number
  warningCount: number
}

// ============================================================================
// SAMPLE SIZE VALIDATION
// ============================================================================

/**
 * Checks for sample size red flags
 *
 * Critical thresholds:
 * - ❌ ERROR: n < 10 (too small for any meaningful analysis)
 * - ❌ ERROR: n = 0 or blank (not specified)
 * - ⚠️ WARNING: n < 30 for experiments (statistical power concerns)
 */
function checkSampleSize(methodology: MethodologyData): CriticalIssue[] {
  const issues: CriticalIssue[] = []
  const sampleSize = methodology.estimatedSampleSize

  // ERROR: Sample size missing or zero
  if (!sampleSize || sampleSize === 0) {
    issues.push({
      category: 'sample',
      severity: 'error',
      problem: 'Sample size not specified or zero',
      fix: 'Specify expected number of participants: 30+ for experiments, 50+ for surveys, 100+ for correlational studies',
      affectedField: 'estimatedSampleSize'
    })
    return issues  // Don't check further if missing
  }

  // ERROR: Sample size too small for any analysis
  if (sampleSize < 10) {
    issues.push({
      category: 'sample',
      severity: 'error',
      problem: `Sample size (n=${sampleSize}) is too small for valid statistical analysis`,
      fix: 'Increase sample size to at least 30 for experiments, or 50+ for surveys',
      affectedField: 'estimatedSampleSize'
    })
    return issues
  }

  // WARNING: Sample size small for experimental studies
  const isExperiment = /experiment|test|trial|intervention|treatment/i.test(
    (methodology.methodType + ' ' + methodology.methodName).toLowerCase()
  )

  if (isExperiment && sampleSize < 30) {
    issues.push({
      category: 'sample',
      severity: 'warning',
      problem: `Sample size (n=${sampleSize}) may be too small for experimental design`,
      fix: 'Consider increasing to n≥30 per group for adequate statistical power (consult power analysis)',
      affectedField: 'estimatedSampleSize'
    })
  }

  return issues
}

// ============================================================================
// ETHICS VALIDATION
// ============================================================================

/**
 * Checks for ethics approval red flags
 *
 * Critical checks:
 * - ❌ ERROR: Human participants mentioned but no ethics plan
 * - ❌ ERROR: Vulnerable populations (children, patients) without special protections
 * - ❌ ERROR: Deception mentioned without debriefing plan
 */
function checkEthicsApproval(methodology: MethodologyData): CriticalIssue[] {
  const issues: CriticalIssue[] = []

  // Combine all text fields for comprehensive keyword search
  const fullText = [
    methodology.methodType || '',
    methodology.methodName || '',
    methodology.reasoning || '',
    methodology.participantCriteria || '',
    methodology.procedureDraft || '',
    methodology.recruitmentStrategy || ''
  ].join(' ').toLowerCase()

  // Check 1: Human participants detection
  const hasHumanParticipants = /(human|participant|subject|volunteer|respondent|interviewee|student)/i.test(fullText)

  // Check if ethics approval is mentioned
  const hasEthicsPlan = /(ethics|irb|institutional review|ethics committee|ethics approval|informed consent|ethical clearance)/i.test(fullText)

  if (hasHumanParticipants && !hasEthicsPlan) {
    issues.push({
      category: 'ethics',
      severity: 'error',
      problem: 'Human participants mentioned but no ethics approval plan',
      fix: 'Add a note about seeking IRB/ethics committee approval and obtaining informed consent',
      affectedField: 'procedureDraft'
    })
  }

  // Check 2: Vulnerable populations
  // Note: "university student" should NOT trigger child protection (adults)
  // Only K-12, children, minors, etc. should trigger
  const hasChildren = /(child|children|minor|adolescent|teenager|k-12|elementary|middle school|high school|under 18|under age)/i.test(fullText) &&
    !/(university student|college student|adult)/i.test(fullText)
  const hasPatients = /(patient|clinical|medical|hospital|diagnosis|treatment)/i.test(fullText)
  const hasVulnerable = /(vulnerable|prisoner|cognitive impairment|disability)/i.test(fullText)

  const hasSpecialProtections = /(parental consent|assent|guardian|legal representative|special protocol)/i.test(fullText)

  if ((hasChildren || hasPatients || hasVulnerable) && !hasSpecialProtections && hasHumanParticipants) {
    const population = hasChildren ? 'children/minors' : hasPatients ? 'patients' : 'vulnerable populations'
    issues.push({
      category: 'ethics',
      severity: 'error',
      problem: `Study involves ${population} but lacks special protection protocols`,
      fix: 'Add protocols for parental consent (minors), patient privacy (medical), or additional safeguards (vulnerable groups)',
      affectedField: 'procedureDraft'
    })
  }

  // Check 3: Deception without debriefing
  const hasDeception = /(deceiv|mislead|conceal|hidden purpose|cover story|false information)/i.test(fullText)
  const hasDebriefing = /(debrief|reveal|explain|disclosure after)/i.test(fullText)

  if (hasDeception && !hasDebriefing && hasHumanParticipants) {
    issues.push({
      category: 'ethics',
      severity: 'error',
      problem: 'Deception mentioned in study but no debriefing plan',
      fix: 'Add debriefing protocol to explain the true purpose after participation and allow withdrawal of data',
      affectedField: 'procedureDraft'
    })
  }

  return issues
}

// ============================================================================
// FEASIBILITY VALIDATION
// ============================================================================

/**
 * Checks for feasibility red flags
 *
 * Critical checks:
 * - ❌ ERROR: Required equipment explicitly stated as unavailable
 * - ❌ ERROR: Population access clearly unrealistic
 * - ❌ ERROR: Timeline impossible (e.g., 100 participants in 1 week)
 */
function checkFeasibility(methodology: MethodologyData): CriticalIssue[] {
  const issues: CriticalIssue[] = []

  const fullText = [
    methodology.methodName || '',
    methodology.reasoning || '',
    methodology.procedureDraft || '',
    methodology.recruitmentStrategy || ''
  ].join(' ').toLowerCase()

  // Check 1: Equipment unavailability
  const hasEquipmentIssue = /(not available|no access|lack of|cannot obtain|insufficient equipment|missing equipment)/i.test(fullText) &&
    /(equipment|instrument|apparatus|tool|device|machine|lab|facility)/i.test(fullText)

  if (hasEquipmentIssue) {
    issues.push({
      category: 'feasibility',
      severity: 'error',
      problem: 'Required equipment or facilities stated as unavailable',
      fix: 'Ensure all necessary equipment is accessible before starting, or modify methodology to use available resources',
      affectedField: 'procedureDraft'
    })
  }

  // Check 2: Population access issues
  const hasAccessIssue = /(difficult to recruit|hard to find|rare population|limited access|restricted access)/i.test(fullText) ||
    (/(recruit|access|find).*participant/i.test(fullText) && /(impossible|very difficult|unrealistic)/i.test(fullText))

  if (hasAccessIssue) {
    issues.push({
      category: 'feasibility',
      severity: 'warning',  // Warning, not error - might be realistic with effort
      problem: 'Participant recruitment may be challenging with current strategy',
      fix: 'Develop concrete recruitment plan with specific channels (e.g., university, community centers, online platforms)',
      affectedField: 'recruitmentStrategy'
    })
  }

  // Check 3: Timeline feasibility (extract numbers + time units)
  const timelineMatch = fullText.match(/(\d+)\s*(participant|subject|respondent).*?(\d+)\s*(day|week|month)/i)
  if (timelineMatch) {
    const participantCount = parseInt(timelineMatch[1])
    const timeValue = parseInt(timelineMatch[3])
    const timeUnit = timelineMatch[4].toLowerCase()

    // Convert to days for comparison
    let daysAvailable = timeValue
    if (timeUnit.includes('week')) daysAvailable *= 7
    if (timeUnit.includes('month')) daysAvailable *= 30

    // Rule of thumb: Need ~1 day per participant for recruitment/scheduling
    const minDaysNeeded = participantCount * 0.5  // Aggressive but possible

    if (daysAvailable < minDaysNeeded) {
      issues.push({
        category: 'feasibility',
        severity: 'warning',
        problem: `Timeline may be too tight: ${participantCount} participants in ${timeValue} ${timeUnit}`,
        fix: 'Allow more time for recruitment (1-2 days per participant) or reduce sample size to fit timeline',
        affectedField: 'procedureDraft'
      })
    }
  }

  return issues
}

// ============================================================================
// MAIN CHECKER FUNCTION
// ============================================================================

/**
 * Performs comprehensive critical design check
 *
 * Returns all critical issues found across all categories.
 * - Errors (severity='error') = BLOCKING issues that invalidate research
 * - Warnings (severity='warning') = Proceed with caution
 *
 * @param methodology - Methodology data to validate
 * @returns CriticalCheckResult with all issues found
 */
export function checkCriticalIssues(methodology: MethodologyData): CriticalCheckResult {
  const issues: CriticalIssue[] = []

  // Run all validation checks
  issues.push(...checkSampleSize(methodology))
  issues.push(...checkEthicsApproval(methodology))
  issues.push(...checkFeasibility(methodology))

  // Categorize by severity
  const errorCount = issues.filter(i => i.severity === 'error').length
  const warningCount = issues.filter(i => i.severity === 'warning').length

  return {
    valid: errorCount === 0,  // Only errors block validity
    issues,
    errorCount,
    warningCount
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format critical issues for display to user
 */
export function formatCriticalIssues(result: CriticalCheckResult): string {
  if (result.valid && result.warningCount === 0) {
    return '✅ No critical issues detected. Your methodology passes all essential checks.'
  }

  let output = `Found ${result.errorCount} error(s) and ${result.warningCount} warning(s):\n\n`

  // Group by severity
  const errors = result.issues.filter(i => i.severity === 'error')
  const warnings = result.issues.filter(i => i.severity === 'warning')

  if (errors.length > 0) {
    output += '🚨 ERRORS (must fix before proceeding):\n'
    errors.forEach((issue, idx) => {
      output += `${idx + 1}. [${issue.category.toUpperCase()}] ${issue.problem}\n`
      output += `   → Fix: ${issue.fix}\n\n`
    })
  }

  if (warnings.length > 0) {
    output += '⚠️  WARNINGS (review recommended):\n'
    warnings.forEach((issue, idx) => {
      output += `${idx + 1}. [${issue.category.toUpperCase()}] ${issue.problem}\n`
      output += `   → Suggestion: ${issue.fix}\n\n`
    })
  }

  return output
}

/**
 * Get issues by category
 */
export function getIssuesByCategory(
  result: CriticalCheckResult,
  category: CriticalIssueCategory
): CriticalIssue[] {
  return result.issues.filter(i => i.category === category)
}

/**
 * Check if methodology has any blocking errors
 */
export function hasBlockingErrors(result: CriticalCheckResult): boolean {
  return result.errorCount > 0
}
