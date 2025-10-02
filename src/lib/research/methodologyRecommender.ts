/**
 * WP4: Methodology Coach - Step 1.1: Intelligent Method Selector
 *
 * AI-powered system that recommends appropriate research methods based on:
 * - Research question type (causal, correlational, descriptive, comparative)
 * - Project constraints (time, resources, population access)
 * - Literature review findings (common methodologies in the field)
 * - Student feasibility (undergraduate/early graduate level)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type QuestionType =
  | 'causal'        // "How does X affect Y?" → Experimental design
  | 'correlational' // "Is X related to Y?" → Survey/correlational study
  | 'descriptive'   // "What is the current state of X?" → Survey/observational
  | 'comparative'   // "Do groups differ on X?" → Comparative study
  | 'mixed'         // Multiple question types
  | 'unknown';      // Cannot determine type

export type MethodologyCategory =
  | 'experimental'
  | 'quasi-experimental'
  | 'correlational'
  | 'survey'
  | 'observational'
  | 'comparative'
  | 'case-study'
  | 'mixed-methods';

export interface ProjectConstraints {
  timeAvailable?: string; // e.g., "8 weeks", "1 semester", "3 months"
  budget?: string; // e.g., "minimal", "$0-100", "limited"
  populationAccess?: string; // e.g., "college students", "general public", "specific patients"
  resources?: string; // e.g., "lab access", "online only", "field work possible"
  ethicsApproval?: 'required' | 'not-required' | 'unknown';
}

export interface LiteratureContext {
  commonMethods?: string[]; // Methods found in literature review
  sampleSizes?: number[]; // Typical sample sizes in field
  studyDurations?: string[]; // Typical study durations
}

export interface MethodRecommendation {
  methodName: string;
  methodType: MethodologyCategory;
  reasoning: string; // Plain-language explanation of why it fits
  stepByStepOverview: string[]; // What student will do (5-7 steps)
  timeEstimate: string; // Realistic time estimate
  feasibilityScore: number; // 1-10, how doable for students
  strengthsAndLimitations: {
    strengths: string[];
    limitations: string[];
  };
}

export interface MethodologyRecommendationResult {
  questionType: QuestionType;
  questionAnalysis: string; // AI's understanding of the question

  primaryMethod: MethodRecommendation;
  alternativeMethod: MethodRecommendation;
  methodsToAvoid: Array<{
    methodName: string;
    whyNotAppropriate: string;
  }>;

  ethicalConsiderations: string[];
  resourceRequirements: string[];
  confidenceLevel: 'high' | 'medium' | 'low';

  generatedAt: Date;
}

// ============================================================================
// QUESTION TYPE DETECTION
// ============================================================================

/**
 * Analyzes research question to identify question type
 */
export function detectQuestionType(researchQuestion: string): QuestionType {
  const question = researchQuestion.toLowerCase();

  // Causal indicators: "how does", "effect of", "impact of", "influence of", "cause"
  const causalPatterns = [
    /how does .+ affect/i,
    /how does .+ influence/i,
    /how does .+ impact/i,
    /effect of .+ on/i,
    /impact of .+ on/i,
    /influence of .+ on/i,
    /does .+ cause/i,
    /will .+ increase/i,
    /will .+ decrease/i,
    /can .+ improve/i,
    /can .+ reduce/i
  ];

  // Correlational indicators: "relationship between", "associated with", "related to"
  const correlationalPatterns = [
    /relationship between/i,
    /correlation between/i,
    /is .+ related to/i,
    /is .+ associated with/i,
    /are .+ related to/i,
    /are .+ associated with/i,
    /link between/i,
    /connection between/i
  ];

  // Descriptive indicators: "what is", "what are", "describe", "characterize"
  const descriptivePatterns = [
    /what is the current/i,
    /what are the current/i,
    /what is the state of/i,
    /how common is/i,
    /how prevalent is/i,
    /what percentage/i,
    /how many/i,
    /describe the/i,
    /characterize the/i
  ];

  // Comparative indicators: "difference between", "compare", "versus", "better than"
  const comparativePatterns = [
    /difference between .+ and/i,
    /differences between .+ and/i,
    /compare .+ and/i,
    /comparing .+ and/i,
    /.+ versus .+/i,
    /.+ vs\.? .+/i,
    /is .+ better than/i,
    /are .+ better than/i,
    /do .+ differ/i,
    /does .+ differ/i
  ];

  // Check patterns in priority order
  const isCausal = causalPatterns.some(pattern => pattern.test(question));
  const isCorrelational = correlationalPatterns.some(pattern => pattern.test(question));
  const isDescriptive = descriptivePatterns.some(pattern => pattern.test(question));
  const isComparative = comparativePatterns.some(pattern => pattern.test(question));

  // Count matches to detect mixed types
  const matchCount = [isCausal, isCorrelational, isDescriptive, isComparative].filter(Boolean).length;

  if (matchCount > 1) return 'mixed';
  if (isCausal) return 'causal';
  if (isCorrelational) return 'correlational';
  if (isDescriptive) return 'descriptive';
  if (isComparative) return 'comparative';

  return 'unknown';
}

// ============================================================================
// BASIC METHOD MAPPING
// ============================================================================

/**
 * Maps question type to recommended methodology categories
 */
export function mapQuestionTypeToMethods(questionType: QuestionType): MethodologyCategory[] {
  const mapping: Record<QuestionType, MethodologyCategory[]> = {
    causal: ['experimental', 'quasi-experimental'],
    correlational: ['correlational', 'survey'],
    descriptive: ['survey', 'observational'],
    comparative: ['comparative', 'quasi-experimental'],
    mixed: ['mixed-methods', 'survey'],
    unknown: ['survey', 'observational'] // Safe defaults
  };

  return mapping[questionType];
}

// ============================================================================
// GPT-4O-MINI INTEGRATION
// ============================================================================

/**
 * Creates system prompt for GPT-4o-Mini methodology recommendation
 */
export function createMethodologyPrompt(
  researchQuestion: string,
  questionType: QuestionType,
  constraints?: ProjectConstraints,
  literatureContext?: LiteratureContext
): string {
  return `You are an expert research methodology advisor helping university STEM students design their research studies. Your goal is to recommend appropriate, feasible research methods that students can realistically execute.

**RESEARCH QUESTION:**
"${researchQuestion}"

**QUESTION TYPE DETECTED:** ${questionType}

**PROJECT CONSTRAINTS:**
${constraints ? `
- Time Available: ${constraints.timeAvailable || 'Not specified (assume 1 semester)'}
- Budget: ${constraints.budget || 'Minimal (student project)'}
- Population Access: ${constraints.populationAccess || 'College students or general public'}
- Resources: ${constraints.resources || 'Basic lab/online tools'}
- Ethics Approval: ${constraints.ethicsApproval || 'May be required'}
` : 'Assume typical student project constraints (1 semester, minimal budget, college population)'}

**LITERATURE CONTEXT:**
${literatureContext?.commonMethods?.length ? `
Common methods in this field: ${literatureContext.commonMethods.join(', ')}
Typical sample sizes: ${literatureContext.sampleSizes?.join(', ') || 'Not specified'}
Typical durations: ${literatureContext.studyDurations?.join(', ') || 'Not specified'}
` : 'No specific literature context provided'}

**YOUR TASK:**
Provide a comprehensive methodology recommendation following this exact JSON structure:

{
  "questionAnalysis": "Brief analysis of what the research question is asking and what kind of evidence would answer it",

  "primaryMethod": {
    "methodName": "Specific name (e.g., 'Randomized Controlled Experiment', 'Cross-Sectional Survey')",
    "methodType": "experimental|quasi-experimental|correlational|survey|observational|comparative|case-study|mixed-methods",
    "reasoning": "2-3 sentences explaining why this method is the BEST fit for this question, in simple language without jargon",
    "stepByStepOverview": [
      "Step 1: [First thing student does]",
      "Step 2: [Next step]",
      "Step 3: [Continue...]",
      "Step 4-7: [5-7 steps total, each actionable and concrete]"
    ],
    "timeEstimate": "Realistic estimate (e.g., '8-10 weeks', '1 semester')",
    "feasibilityScore": 7-10 (rate how doable this is for students),
    "strengthsAndLimitations": {
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "limitations": ["Limitation 1", "Limitation 2"]
    }
  },

  "alternativeMethod": {
    [Same structure as primaryMethod, but for a backup option]
    "reasoning": "Explain when this alternative might be better than the primary method"
  },

  "methodsToAvoid": [
    {
      "methodName": "Method that won't work",
      "whyNotAppropriate": "Clear explanation of why this method is inappropriate for this question"
    }
    [Include 2-3 methods to avoid]
  ],

  "ethicalConsiderations": [
    "Consideration 1 (e.g., 'Informed consent required')",
    "Consideration 2",
    "Consideration 3"
  ],

  "resourceRequirements": [
    "Resource 1 (e.g., 'Access to survey platform like Qualtrics')",
    "Resource 2",
    "Resource 3"
  ],

  "confidenceLevel": "high|medium|low (how confident you are this recommendation fits)"
}

**IMPORTANT GUIDELINES:**
1. **Use simple language** - Write for students who may not know research jargon
2. **Be realistic** - Only recommend methods students can actually execute
3. **Consider ethics** - Remind students about ethical approval if needed
4. **Focus on feasibility** - Prefer methods that are practical over theoretically perfect
5. **Provide alternatives** - Give students options with clear tradeoffs
6. **Prevent mistakes** - Explicitly warn about methods that won't work

**QUESTION TYPE MAPPING HINTS:**
- Causal questions ("How does X affect Y?") → Experimental or quasi-experimental
- Correlational ("Is X related to Y?") → Survey or correlational study
- Descriptive ("What is X like?") → Survey or observational methods
- Comparative ("Do groups differ?") → Comparative study design

Return ONLY the JSON object, no additional text.`;
}

/**
 * Calls GPT-4o-Mini to get methodology recommendation
 */
export async function getMethodologyRecommendation(
  researchQuestion: string,
  constraints?: ProjectConstraints,
  literatureContext?: LiteratureContext
): Promise<MethodologyRecommendationResult> {
  const startTime = Date.now();

  // Step 1: Detect question type
  const questionType = detectQuestionType(researchQuestion);

  // Step 2: Create prompt for GPT-4o-Mini
  const systemPrompt = createMethodologyPrompt(
    researchQuestion,
    questionType,
    constraints,
    literatureContext
  );

  try {
    // Step 3: Call GPT-4o-Mini API
    const response = await fetch('/api/ai/methodology-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        researchQuestion,
        questionType,
        constraints,
        literatureContext
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Step 4: Parse and return structured result
    const result: MethodologyRecommendationResult = {
      questionType,
      questionAnalysis: data.questionAnalysis,
      primaryMethod: data.primaryMethod,
      alternativeMethod: data.alternativeMethod,
      methodsToAvoid: data.methodsToAvoid,
      ethicalConsiderations: data.ethicalConsiderations,
      resourceRequirements: data.resourceRequirements,
      confidenceLevel: data.confidenceLevel,
      generatedAt: new Date()
    };

    const endTime = Date.now();
    console.log(`✅ Methodology recommendation generated in ${endTime - startTime}ms`);

    return result;

  } catch (error) {
    console.error('Error getting methodology recommendation:', error);

    // Fallback to basic recommendation if API fails
    return getFallbackRecommendation(researchQuestion, questionType);
  }
}

/**
 * Fallback recommendation if API fails
 */
function getFallbackRecommendation(
  researchQuestion: string,
  questionType: QuestionType
): MethodologyRecommendationResult {
  const methodCategories = mapQuestionTypeToMethods(questionType);

  // Basic recommendations based on question type
  const recommendations: Record<QuestionType, Partial<MethodologyRecommendationResult>> = {
    causal: {
      questionAnalysis: 'This is a causal question asking about the effect of one variable on another.',
      primaryMethod: {
        methodName: 'Randomized Controlled Experiment',
        methodType: 'experimental',
        reasoning: 'An experiment allows you to manipulate the independent variable and measure its effect on the dependent variable, establishing causation.',
        stepByStepOverview: [
          'Define your independent variable (what you will change) and dependent variable (what you will measure)',
          'Randomly assign participants to experimental and control groups',
          'Apply the treatment/intervention to the experimental group only',
          'Measure the dependent variable in both groups',
          'Compare results between groups to see if the treatment had an effect',
          'Analyze data using statistical tests (e.g., t-test)',
          'Draw conclusions about causation'
        ],
        timeEstimate: '8-12 weeks',
        feasibilityScore: 7,
        strengthsAndLimitations: {
          strengths: [
            'Can establish cause-and-effect relationships',
            'High internal validity with random assignment',
            'Clear comparison between treatment and control groups'
          ],
          limitations: [
            'May be challenging to manipulate variables ethically',
            'Requires larger sample size for statistical power',
            'May have limited real-world applicability (external validity)'
          ]
        }
      },
      alternativeMethod: {
        methodName: 'Quasi-Experimental Design',
        methodType: 'quasi-experimental',
        reasoning: 'If random assignment is not possible, a quasi-experimental design can still provide evidence of causation by comparing pre-existing groups.',
        stepByStepOverview: [
          'Identify naturally occurring groups (e.g., students in different classes)',
          'Measure baseline characteristics of both groups',
          'Apply intervention to one group only',
          'Measure outcomes in both groups',
          'Control for pre-existing differences statistically',
          'Analyze results with appropriate tests',
          'Acknowledge limitations due to lack of randomization'
        ],
        timeEstimate: '6-10 weeks',
        feasibilityScore: 8,
        strengthsAndLimitations: {
          strengths: [
            'More feasible than true experiments',
            'Can be done in natural settings',
            'Still provides evidence of causal relationships'
          ],
          limitations: [
            'Cannot definitively prove causation',
            'Pre-existing group differences may confound results',
            'Requires careful statistical controls'
          ]
        }
      }
    },
    correlational: {
      questionAnalysis: 'This is a correlational question examining the relationship between two or more variables.',
      primaryMethod: {
        methodName: 'Correlational Survey Study',
        methodType: 'correlational',
        reasoning: 'A correlational design measures multiple variables to see if they are related, without manipulating anything.',
        stepByStepOverview: [
          'Identify variables you want to correlate',
          'Develop measurement tools (surveys, tests, or observations)',
          'Recruit participants who vary on the variables of interest',
          'Collect data on all variables from each participant',
          'Calculate correlation coefficients (e.g., Pearson\'s r)',
          'Create scatterplots to visualize relationships',
          'Interpret correlations (remember: correlation ≠ causation!)'
        ],
        timeEstimate: '6-8 weeks',
        feasibilityScore: 9,
        strengthsAndLimitations: {
          strengths: [
            'Relatively quick and inexpensive',
            'Can examine multiple variables simultaneously',
            'Useful for identifying patterns to study further'
          ],
          limitations: [
            'Cannot establish causation',
            'Third variables may explain relationships',
            'Relies on self-report if using surveys'
          ]
        }
      },
      alternativeMethod: {
        methodName: 'Longitudinal Correlational Study',
        methodType: 'correlational',
        reasoning: 'If you want to see how relationships change over time, measure the same variables at multiple time points.',
        stepByStepOverview: [
          'Measure variables at Time 1',
          'Wait a predetermined interval (e.g., 4 weeks)',
          'Measure same variables at Time 2',
          'Optionally repeat at Time 3',
          'Analyze how correlations change over time',
          'Examine temporal precedence (which variable changes first)',
          'Draw conclusions about stability of relationships'
        ],
        timeEstimate: '10-16 weeks (includes waiting periods)',
        feasibilityScore: 6,
        strengthsAndLimitations: {
          strengths: [
            'Can examine changes over time',
            'Provides stronger evidence than cross-sectional studies',
            'May reveal temporal precedence (weak causation evidence)'
          ],
          limitations: [
            'Requires more time and resources',
            'Participant attrition between time points',
            'Still cannot establish definitive causation'
          ]
        }
      }
    },
    descriptive: {
      questionAnalysis: 'This is a descriptive question seeking to characterize or describe a phenomenon as it currently exists.',
      primaryMethod: {
        methodName: 'Cross-Sectional Survey',
        methodType: 'survey',
        reasoning: 'A survey allows you to collect data from many people to describe current attitudes, behaviors, or characteristics.',
        stepByStepOverview: [
          'Define what you want to describe (behaviors, attitudes, demographics)',
          'Create a survey with clear, unbiased questions',
          'Determine sampling strategy (who will you survey?)',
          'Distribute survey online or in-person',
          'Collect responses (aim for 50-100+ participants)',
          'Analyze descriptive statistics (means, percentages, frequencies)',
          'Report findings with visual aids (charts, graphs)'
        ],
        timeEstimate: '4-6 weeks',
        feasibilityScore: 10,
        strengthsAndLimitations: {
          strengths: [
            'Very feasible for student projects',
            'Can collect large amounts of data quickly',
            'Relatively inexpensive (online surveys are free)',
            'Provides useful baseline information'
          ],
          limitations: [
            'Only describes current state, no causation',
            'Response bias may affect results',
            'Cannot explain why patterns exist'
          ]
        }
      },
      alternativeMethod: {
        methodName: 'Observational Study',
        methodType: 'observational',
        reasoning: 'If you want to describe behaviors as they naturally occur, direct observation may be more accurate than self-report.',
        stepByStepOverview: [
          'Define behaviors or events you will observe',
          'Create observation coding scheme',
          'Choose observation setting (natural environment)',
          'Train observers to use coding scheme reliably',
          'Conduct observations and record data',
          'Calculate inter-rater reliability if multiple observers',
          'Summarize findings with descriptive statistics'
        ],
        timeEstimate: '6-10 weeks',
        feasibilityScore: 7,
        strengthsAndLimitations: {
          strengths: [
            'Captures actual behaviors, not just self-report',
            'High ecological validity (real-world setting)',
            'Minimizes response bias'
          ],
          limitations: [
            'Time-intensive to conduct observations',
            'Observer bias may affect coding',
            'Ethical concerns if observing without consent'
          ]
        }
      }
    },
    comparative: {
      questionAnalysis: 'This is a comparative question examining differences between groups or conditions.',
      primaryMethod: {
        methodName: 'Between-Groups Comparison Study',
        methodType: 'comparative',
        reasoning: 'A comparative design measures the same outcome in different groups to see if groups differ significantly.',
        stepByStepOverview: [
          'Define the groups you want to compare (e.g., males vs females, freshmen vs seniors)',
          'Identify the outcome variable to measure in all groups',
          'Ensure groups are comparable on other important variables',
          'Collect data from all groups using same measurement tools',
          'Calculate group means and standard deviations',
          'Run statistical test (t-test for 2 groups, ANOVA for 3+)',
          'Interpret whether differences are statistically significant'
        ],
        timeEstimate: '6-8 weeks',
        feasibilityScore: 8,
        strengthsAndLimitations: {
          strengths: [
            'Straightforward design to execute',
            'Can identify meaningful group differences',
            'Practical for student research'
          ],
          limitations: [
            'Cannot determine why groups differ',
            'Groups may differ on unmeasured variables',
            'May need large sample for statistical power'
          ]
        }
      },
      alternativeMethod: {
        methodName: 'Matched-Pairs Comparison',
        methodType: 'comparative',
        reasoning: 'If you want to control for individual differences, match participants on key variables before comparing groups.',
        stepByStepOverview: [
          'Identify key variables to match on (e.g., age, GPA)',
          'Recruit participants and measure matching variables',
          'Create matched pairs (participants similar on matching variables)',
          'Assign one from each pair to Group A, other to Group B',
          'Measure outcome variable in both groups',
          'Use paired t-test to compare matched pairs',
          'Report differences between matched groups'
        ],
        timeEstimate: '8-12 weeks',
        feasibilityScore: 6,
        strengthsAndLimitations: {
          strengths: [
            'Controls for individual differences',
            'More powerful than unmatched comparisons',
            'Can strengthen causal inferences'
          ],
          limitations: [
            'More complex to execute',
            'Requires careful matching process',
            'May be difficult to find good matches'
          ]
        }
      }
    },
    mixed: {
      questionAnalysis: 'This research question involves multiple types of inquiry and may benefit from a mixed-methods approach.',
      primaryMethod: {
        methodName: 'Mixed-Methods Study',
        methodType: 'mixed-methods',
        reasoning: 'A mixed-methods design combines quantitative and qualitative data to provide a comprehensive answer to complex questions.',
        stepByStepOverview: [
          'Break question into quantitative and qualitative components',
          'Design quantitative phase (e.g., survey or experiment)',
          'Design qualitative phase (e.g., interviews or observations)',
          'Collect quantitative data first to identify patterns',
          'Use qualitative data to explain or expand on quantitative findings',
          'Analyze each data type separately, then integrate',
          'Present findings showing how both methods inform the answer'
        ],
        timeEstimate: '12-16 weeks',
        feasibilityScore: 5,
        strengthsAndLimitations: {
          strengths: [
            'Provides comprehensive understanding',
            'Qualitative data explains quantitative patterns',
            'Triangulation increases validity'
          ],
          limitations: [
            'Very time-intensive',
            'Requires expertise in multiple methods',
            'May be too ambitious for student projects'
          ]
        }
      },
      alternativeMethod: {
        methodName: 'Sequential Explanatory Design',
        methodType: 'mixed-methods',
        reasoning: 'Start with quantitative study, then use qualitative follow-up to explain unexpected or interesting findings.',
        stepByStepOverview: [
          'Conduct quantitative study (survey or experiment)',
          'Analyze quantitative results',
          'Identify surprising or unclear findings',
          'Design qualitative follow-up (interviews with subset of participants)',
          'Collect qualitative data to explain quantitative patterns',
          'Integrate findings in final report',
          'Discuss how qualitative data illuminates quantitative results'
        ],
        timeEstimate: '10-14 weeks',
        feasibilityScore: 6,
        strengthsAndLimitations: {
          strengths: [
            'More manageable than full mixed-methods',
            'Provides depth to quantitative findings',
            'Allows flexibility in qualitative phase'
          ],
          limitations: [
            'Still requires significant time',
            'Qualitative analysis can be challenging',
            'Need smaller sample for qualitative phase'
          ]
        }
      }
    },
    unknown: {
      questionAnalysis: 'The research question type is unclear. A flexible exploratory approach may be most appropriate.',
      primaryMethod: {
        methodName: 'Exploratory Survey Study',
        methodType: 'survey',
        reasoning: 'When the question is unclear, start with a survey to explore the topic and refine your research direction.',
        stepByStepOverview: [
          'Review literature to understand the topic better',
          'Create broad survey covering multiple aspects of the topic',
          'Include both closed and open-ended questions',
          'Collect data from accessible population',
          'Analyze responses to identify patterns and themes',
          'Use findings to refine your research question',
          'Plan a more focused follow-up study'
        ],
        timeEstimate: '6-8 weeks',
        feasibilityScore: 9,
        strengthsAndLimitations: {
          strengths: [
            'Flexible and exploratory',
            'Helps refine research direction',
            'Low risk and feasible for students'
          ],
          limitations: [
            'May not answer original question directly',
            'Requires follow-up research',
            'Findings may be preliminary only'
          ]
        }
      },
      alternativeMethod: {
        methodName: 'Literature Review and Conceptual Replication',
        methodType: 'survey',
        reasoning: 'If your question is unclear, study what others have done and replicate a well-designed study from the literature.',
        stepByStepOverview: [
          'Conduct thorough literature review',
          'Find a high-quality study related to your topic',
          'Adapt their methodology to your population',
          'Replicate their study with minor modifications',
          'Compare your results to original study',
          'Discuss similarities and differences',
          'Use findings to develop clearer research question'
        ],
        timeEstimate: '8-12 weeks',
        feasibilityScore: 8,
        strengthsAndLimitations: {
          strengths: [
            'Builds on established research',
            'Provides clear methodological guidance',
            'Contributes to replication science'
          ],
          limitations: [
            'Less original than new research',
            'Dependent on quality of original study',
            'May not fully address your specific question'
          ]
        }
      }
    }
  };

  const baseRecommendation = recommendations[questionType] || recommendations.unknown;

  return {
    questionType,
    questionAnalysis: baseRecommendation.questionAnalysis || 'Could not analyze question type.',
    primaryMethod: baseRecommendation.primaryMethod!,
    alternativeMethod: baseRecommendation.alternativeMethod!,
    methodsToAvoid: [
      {
        methodName: 'Case Study (Single Subject)',
        whyNotAppropriate: 'Single case studies cannot establish generalizable patterns or test hypotheses effectively.'
      },
      {
        methodName: 'Purely Anecdotal Evidence',
        whyNotAppropriate: 'Personal stories or isolated examples are not systematic research and cannot support scientific conclusions.'
      }
    ],
    ethicalConsiderations: [
      'Obtain informed consent from all participants',
      'Ensure participant anonymity and data confidentiality',
      'Submit study to Institutional Review Board (IRB) if required'
    ],
    resourceRequirements: [
      'Access to participant population',
      'Data collection tools (surveys, equipment, or software)',
      'Basic statistical analysis software (Excel, SPSS, or R)'
    ],
    confidenceLevel: 'low',
    generatedAt: new Date()
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats methodology recommendation for display
 */
export function formatRecommendationForDisplay(
  result: MethodologyRecommendationResult
): string {
  return `
## 🔬 Methodology Recommendation

**Question Type:** ${result.questionType.charAt(0).toUpperCase() + result.questionType.slice(1)}

**Analysis:** ${result.questionAnalysis}

---

### ✅ Primary Recommendation: ${result.primaryMethod.methodName}

**Why this method?**
${result.primaryMethod.reasoning}

**Step-by-Step Overview:**
${result.primaryMethod.stepByStepOverview.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Time Estimate:** ${result.primaryMethod.timeEstimate}
**Feasibility Score:** ${result.primaryMethod.feasibilityScore}/10

**Strengths:**
${result.primaryMethod.strengthsAndLimitations.strengths.map(s => `• ${s}`).join('\n')}

**Limitations:**
${result.primaryMethod.strengthsAndLimitations.limitations.map(l => `• ${l}`).join('\n')}

---

### 🔄 Alternative Option: ${result.alternativeMethod.methodName}

**When to use this instead:**
${result.alternativeMethod.reasoning}

**Time Estimate:** ${result.alternativeMethod.timeEstimate}
**Feasibility Score:** ${result.alternativeMethod.feasibilityScore}/10

---

### ❌ Methods to Avoid

${result.methodsToAvoid.map(method => `
**${method.methodName}**
${method.whyNotAppropriate}
`).join('\n')}

---

### 🛡️ Ethical Considerations
${result.ethicalConsiderations.map(e => `• ${e}`).join('\n')}

### 📦 Resources Needed
${result.resourceRequirements.map(r => `• ${r}`).join('\n')}

---

**Confidence Level:** ${result.confidenceLevel.toUpperCase()}
`;
}
