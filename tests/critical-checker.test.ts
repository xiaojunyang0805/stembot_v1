/**
 * Unit Tests for Critical Design Checker (WP4-2.1)
 *
 * Success Criteria:
 * ✅ Detects most serious flaws
 * ✅ No false positives on good designs
 * ✅ Check completes instantly (<1 second)
 */

import { describe, it, expect } from 'vitest'
import {
  checkCriticalIssues,
  formatCriticalIssues,
  hasBlockingErrors,
  getIssuesByCategory,
  CriticalCheckResult
} from '@/lib/research/criticalChecker'
import { MethodologyData } from '@/lib/supabase/methodology'

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Create valid baseline methodology for testing
 * IMPORTANT: Must include ethics keywords to pass all checks
 */
function createValidMethodology(): MethodologyData {
  return {
    projectId: 'test-project-123',
    methodType: 'Survey',  // Changed to Survey to avoid experimental warnings
    methodName: 'Memory retention study with spaced repetition',
    reasoning: 'Testing the effectiveness of spaced repetition on long-term memory',
    estimatedSampleSize: 50,  // Safe for surveys
    participantCriteria: 'University students aged 18-25',
    procedureDraft: 'Students will complete memory tests. IRB approval will be obtained and informed consent collected from all participants.',
    recruitmentStrategy: 'Recruit from psychology courses via announcement',
    independentVariables: [
      { name: 'Study interval', description: 'Time between study sessions' }
    ],
    dependentVariables: [
      { name: 'Recall score', description: 'Percentage of items recalled' }
    ]
  }
}

// ============================================================================
// SAMPLE SIZE VALIDATION TESTS
// ============================================================================

describe('Critical Checker - Sample Size', () => {
  it('should PASS with adequate sample size (n=40)', () => {
    const methodology = createValidMethodology()
    methodology.estimatedSampleSize = 40

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(getIssuesByCategory(result, 'sample')).toHaveLength(0)
  })

  it('should ERROR when sample size is zero', () => {
    const methodology = createValidMethodology()
    methodology.estimatedSampleSize = 0

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(false)
    expect(result.errorCount).toBeGreaterThan(0)

    const sampleIssues = getIssuesByCategory(result, 'sample')
    expect(sampleIssues.length).toBeGreaterThan(0)
    expect(sampleIssues[0].severity).toBe('error')
    expect(sampleIssues[0].problem).toContain('not specified or zero')
  })

  it('should ERROR when sample size is missing', () => {
    const methodology = createValidMethodology()
    methodology.estimatedSampleSize = undefined

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(false)
    expect(hasBlockingErrors(result)).toBe(true)

    const sampleIssues = getIssuesByCategory(result, 'sample')
    expect(sampleIssues[0].severity).toBe('error')
  })

  it('should ERROR when sample size < 10 (too small for any analysis)', () => {
    const methodology = createValidMethodology()
    methodology.estimatedSampleSize = 5

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(false)
    expect(result.errorCount).toBeGreaterThan(0)

    const sampleIssues = getIssuesByCategory(result, 'sample')
    expect(sampleIssues[0].problem).toContain('too small')
    expect(sampleIssues[0].problem).toContain('n=5')
  })

  it('should WARN when experimental study has n < 30', () => {
    const methodology = createValidMethodology()
    methodology.methodType = 'Experiment'
    methodology.estimatedSampleSize = 20

    const result = checkCriticalIssues(methodology)

    // Should be valid (warning, not error)
    expect(result.valid).toBe(true)
    expect(result.warningCount).toBeGreaterThan(0)

    const sampleIssues = getIssuesByCategory(result, 'sample')
    expect(sampleIssues[0].severity).toBe('warning')
    expect(sampleIssues[0].problem).toContain('may be too small')
  })

  it('should NOT warn for survey with n=20 (only warns for experiments)', () => {
    const methodology = createValidMethodology()
    methodology.methodType = 'Survey'
    methodology.estimatedSampleSize = 20

    const result = checkCriticalIssues(methodology)

    // No warnings for surveys with n >= 10
    expect(result.valid).toBe(true)
    expect(getIssuesByCategory(result, 'sample')).toHaveLength(0)
  })
})

// ============================================================================
// ETHICS VALIDATION TESTS
// ============================================================================

describe('Critical Checker - Ethics', () => {
  it('should PASS when ethics approval is mentioned', () => {
    const methodology = createValidMethodology()
    methodology.procedureDraft = 'We will recruit participants and obtain IRB approval and informed consent'

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(true)
    expect(getIssuesByCategory(result, 'ethics')).toHaveLength(0)
  })

  it('should ERROR when human participants mentioned but no ethics plan', () => {
    const methodology = createValidMethodology()
    methodology.participantCriteria = 'University students aged 18-25'
    methodology.procedureDraft = 'Participants will complete memory tests'  // No IRB mention

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(false)

    const ethicsIssues = getIssuesByCategory(result, 'ethics')
    expect(ethicsIssues.length).toBeGreaterThan(0)
    expect(ethicsIssues[0].severity).toBe('error')
    expect(ethicsIssues[0].problem).toContain('no ethics approval plan')
  })

  it('should ERROR when children involved without special protections', () => {
    const methodology = createValidMethodology()
    methodology.participantCriteria = 'Children aged 8-12 from local elementary schools'
    methodology.procedureDraft = 'Students will complete math tests. IRB approval obtained.'

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(false)

    const ethicsIssues = getIssuesByCategory(result, 'ethics')
    const childProtectionIssue = ethicsIssues.find(i => i.problem.includes('children'))
    expect(childProtectionIssue).toBeDefined()
    expect(childProtectionIssue?.severity).toBe('error')
  })

  it('should PASS when children involved WITH parental consent', () => {
    const methodology = createValidMethodology()
    methodology.participantCriteria = 'Children aged 8-12'
    methodology.procedureDraft = 'IRB approval obtained. Parental consent and child assent will be collected.'

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(true)
    expect(getIssuesByCategory(result, 'ethics')).toHaveLength(0)
  })

  it('should ERROR when deception used without debriefing', () => {
    const methodology = createValidMethodology()
    methodology.procedureDraft = 'Participants will be deceived about the true purpose. IRB approval obtained.'

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(false)

    const ethicsIssues = getIssuesByCategory(result, 'ethics')
    const deceptionIssue = ethicsIssues.find(i => i.problem.includes('Deception'))
    expect(deceptionIssue).toBeDefined()
  })

  it('should PASS when deception used WITH debriefing', () => {
    const methodology = createValidMethodology()
    methodology.procedureDraft = 'Participants will be deceived initially. IRB approval obtained. Full debriefing will reveal true purpose afterward.'

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(true)
    expect(getIssuesByCategory(result, 'ethics')).toHaveLength(0)
  })

  it('should NOT flag ethics issues for non-human studies', () => {
    const methodology = createValidMethodology()
    methodology.methodType = 'Observational'
    methodology.participantCriteria = 'N/A - observing plant growth'
    methodology.procedureDraft = 'Measure plant height daily for 30 days'

    const result = checkCriticalIssues(methodology)

    // No ethics issues for plant studies
    expect(result.valid).toBe(true)
    expect(getIssuesByCategory(result, 'ethics')).toHaveLength(0)
  })
})

// ============================================================================
// FEASIBILITY VALIDATION TESTS
// ============================================================================

describe('Critical Checker - Feasibility', () => {
  it('should ERROR when equipment explicitly unavailable', () => {
    const methodology = createValidMethodology()
    methodology.procedureDraft = 'We need an fMRI machine but it is not available at our institution'

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(false)

    const feasibilityIssues = getIssuesByCategory(result, 'feasibility')
    expect(feasibilityIssues.length).toBeGreaterThan(0)
    expect(feasibilityIssues[0].severity).toBe('error')
    expect(feasibilityIssues[0].problem).toContain('unavailable')
  })

  it('should PASS when equipment availability confirmed', () => {
    const methodology = createValidMethodology()
    methodology.procedureDraft = 'We have access to the psychology lab and all required equipment. IRB approval will be obtained and informed consent collected from all participants.'

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(true)
    expect(getIssuesByCategory(result, 'feasibility')).toHaveLength(0)
  })

  it('should WARN when recruitment explicitly difficult', () => {
    const methodology = createValidMethodology()
    methodology.recruitmentStrategy = 'It will be difficult to recruit this rare population'

    const result = checkCriticalIssues(methodology)

    // Warning, not error
    expect(result.valid).toBe(true)
    expect(result.warningCount).toBeGreaterThan(0)

    const feasibilityIssues = getIssuesByCategory(result, 'feasibility')
    expect(feasibilityIssues[0].severity).toBe('warning')
  })

  it('should WARN for unrealistic timeline (100 participants in 1 week)', () => {
    const methodology = createValidMethodology()
    methodology.estimatedSampleSize = 100
    methodology.procedureDraft = 'We will recruit 100 participants in 1 week'

    const result = checkCriticalIssues(methodology)

    expect(result.warningCount).toBeGreaterThan(0)

    const feasibilityIssues = getIssuesByCategory(result, 'feasibility')
    const timelineIssue = feasibilityIssues.find(i => i.problem.includes('Timeline'))
    expect(timelineIssue?.severity).toBe('warning')
  })

  it('should PASS for realistic timeline (30 participants in 2 months)', () => {
    const methodology = createValidMethodology()
    methodology.estimatedSampleSize = 30
    methodology.procedureDraft = 'We will recruit 30 participants over 2 months. IRB approval will be obtained and informed consent collected.'

    const result = checkCriticalIssues(methodology)

    // Should pass without timeline warnings
    expect(result.valid).toBe(true)
    const timelineIssues = getIssuesByCategory(result, 'feasibility').filter(i =>
      i.problem.includes('Timeline')
    )
    expect(timelineIssues).toHaveLength(0)
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Critical Checker - Integration', () => {
  it('should detect multiple issues across categories', () => {
    const methodology: MethodologyData = {
      projectId: 'test-123',
      methodType: 'Experiment',
      methodName: 'Flawed study',
      estimatedSampleSize: 5,  // ❌ Too small
      participantCriteria: 'Human participants',  // ❌ No ethics
      procedureDraft: 'Test participants with equipment that is not available',  // ❌ Equipment
      recruitmentStrategy: 'TBD'
    }

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(false)
    expect(result.errorCount).toBeGreaterThanOrEqual(3)
    expect(getIssuesByCategory(result, 'sample').length).toBeGreaterThan(0)
    expect(getIssuesByCategory(result, 'ethics').length).toBeGreaterThan(0)
    expect(getIssuesByCategory(result, 'feasibility').length).toBeGreaterThan(0)
  })

  it('should return valid for well-designed methodology', () => {
    const methodology = createValidMethodology()

    const result = checkCriticalIssues(methodology)

    expect(result.valid).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(result.issues).toHaveLength(0)
  })

  it('should complete check in < 1 second', () => {
    const methodology = createValidMethodology()

    const startTime = performance.now()
    checkCriticalIssues(methodology)
    const endTime = performance.now()

    const duration = endTime - startTime
    expect(duration).toBeLessThan(1000)  // < 1 second
  })
})

// ============================================================================
// FORMATTING TESTS
// ============================================================================

describe('Critical Checker - Formatting', () => {
  it('should format clean result for valid methodology', () => {
    const methodology = createValidMethodology()
    const result = checkCriticalIssues(methodology)
    const formatted = formatCriticalIssues(result)

    expect(formatted).toContain('✅')
    expect(formatted).toContain('No critical issues')
  })

  it('should format errors and warnings separately', () => {
    const methodology = createValidMethodology()
    methodology.estimatedSampleSize = 0  // ERROR - zero sample size
    methodology.methodType = 'Experiment'

    const result = checkCriticalIssues(methodology)
    const formatted = formatCriticalIssues(result)

    expect(formatted).toContain('ERRORS')
    expect(formatted).toContain('Fix:')
  })

  it('should include fix suggestions in formatted output', () => {
    const methodology = createValidMethodology()
    methodology.estimatedSampleSize = undefined

    const result = checkCriticalIssues(methodology)
    const formatted = formatCriticalIssues(result)

    expect(formatted).toContain('Fix:')
    expect(formatted).toContain('Specify')
  })
})

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Critical Checker - Edge Cases', () => {
  it('should handle missing optional fields gracefully', () => {
    const methodology: MethodologyData = {
      projectId: 'test-123',
      methodType: 'Survey',
      methodName: 'Basic survey',
      estimatedSampleSize: 50,
      // All optional fields missing
    }

    const result = checkCriticalIssues(methodology)

    // Should not crash, but may flag ethics issues
    expect(result).toBeDefined()
  })

  it('should handle empty strings', () => {
    const methodology = createValidMethodology()
    methodology.procedureDraft = ''
    methodology.participantCriteria = ''

    const result = checkCriticalIssues(methodology)

    // Should process without errors
    expect(result).toBeDefined()
  })

  it('should be case-insensitive for keyword detection', () => {
    const methodology = createValidMethodology()
    methodology.procedureDraft = 'PARTICIPANTS will complete tests. IRB APPROVAL obtained.'

    const result = checkCriticalIssues(methodology)

    // Should recognize uppercase keywords
    expect(getIssuesByCategory(result, 'ethics')).toHaveLength(0)
  })
})
