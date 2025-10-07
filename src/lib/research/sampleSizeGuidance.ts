/**
 * WP4-2.3: Simple Statistical Guidance for Sample Sizes
 *
 * Provides simple, memorable rules of thumb for sample sizes.
 * No complex calculations - just practical guidelines for student researchers.
 */

export interface SampleSizeGuidance {
  guideline: string;
  example?: string;
  explanation: string;
}

/**
 * Get sample size guidance based on methodology type
 *
 * Returns simple rule of thumb - no complex power analysis needed
 * @param methodType - The type of research methodology
 * @param methodName - Optional full method name for more specific guidance
 */
export function getSampleSizeGuidance(
  methodType: string,
  methodName?: string
): SampleSizeGuidance {
  // Normalize method type for matching
  const normalizedType = methodType.toLowerCase();
  const normalizedName = methodName?.toLowerCase() || '';

  // Check for experimental designs
  if (
    normalizedType.includes('experiment') ||
    normalizedName.includes('experiment') ||
    normalizedName.includes('test') ||
    normalizedName.includes('trial')
  ) {
    return {
      guideline: 'Aim for 30 participants per group',
      example: 'Example: 3 conditions = 90 total participants',
      explanation:
        'This gives you enough statistical power to detect meaningful differences between groups.'
    };
  }

  // Check for survey designs
  if (
    normalizedType.includes('survey') ||
    normalizedName.includes('survey') ||
    normalizedName.includes('questionnaire')
  ) {
    return {
      guideline: 'Aim for 100+ responses for reliable results',
      example: 'Example: For 5 subgroups, aim for 20+ responses each',
      explanation:
        'More responses give you better representation of your population and more confidence in your findings.'
    };
  }

  // Check for observational designs
  if (
    normalizedType.includes('observ') ||
    normalizedName.includes('observ') ||
    normalizedName.includes('field study') ||
    normalizedName.includes('case study')
  ) {
    return {
      guideline: 'Aim for 20-30 observations or cases',
      example: 'Example: Observe 25 different participants or events',
      explanation:
        'This provides enough data to identify patterns while remaining manageable for detailed observation.'
    };
  }

  // Check for comparative designs
  if (
    normalizedType.includes('compar') ||
    normalizedName.includes('compar') ||
    normalizedName.includes('between') ||
    normalizedName.includes('versus')
  ) {
    return {
      guideline: 'Aim for 30 participants per group you\'re comparing',
      example: 'Example: Comparing 2 schools = 60 total (30 per school)',
      explanation:
        'Equal group sizes help ensure fair comparisons and reliable statistical tests.'
    };
  }

  // Check for correlational designs
  if (
    normalizedType.includes('correlat') ||
    normalizedName.includes('correlat') ||
    normalizedName.includes('relationship') ||
    normalizedName.includes('association')
  ) {
    return {
      guideline: 'Aim for 50-100 participants',
      example: 'Example: 75 participants to examine relationship between variables',
      explanation:
        'You need enough data points to reliably detect relationships between variables.'
    };
  }

  // Check for qualitative designs
  if (
    normalizedType.includes('qualitative') ||
    normalizedName.includes('interview') ||
    normalizedName.includes('focus group') ||
    normalizedName.includes('ethnograph')
  ) {
    return {
      guideline: 'Aim for 10-20 participants for in-depth interviews',
      example: 'Example: 15 interviews until themes repeat (saturation)',
      explanation:
        'Qualitative research focuses on depth over breadth. Stop when new interviews reveal no new themes.'
    };
  }

  // Default guidance for unrecognized types
  return {
    guideline: 'Consult your advisor for appropriate sample size',
    explanation:
      'Sample size depends on your specific research design, available resources, and statistical requirements. Your advisor can help determine the right number for your study.'
  };
}

/**
 * Get additional tips based on sample size entered
 * @param sampleSize - The proposed sample size
 * @param methodType - The research method type
 */
export function getSampleSizeFeedback(sampleSize: number, methodType: string): string | null {
  const normalizedType = methodType.toLowerCase();

  // Too small for any design
  if (sampleSize < 10) {
    return '⚠️ This sample size may be too small for reliable results. Consider increasing to at least 20-30.';
  }

  // Small for experiments
  if (
    (normalizedType.includes('experiment') || normalizedType.includes('test')) &&
    sampleSize < 30
  ) {
    return '💡 For experimental designs, 30+ participants per group is recommended for statistical power.';
  }

  // Small for surveys
  if (normalizedType.includes('survey') && sampleSize < 50) {
    return '💡 Survey research typically benefits from 100+ responses for better population representation.';
  }

  // Good sample size
  if (sampleSize >= 30) {
    return null; // No feedback needed - sample size is adequate
  }

  return null;
}
