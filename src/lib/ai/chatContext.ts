'use client';

/**
 * Chat Context Manager for AI Conversations
 * Retrieves and formats research context (methodology, literature, etc.) for AI chat
 */

export interface MethodologyContext {
  method?: string;
  variables?: {
    independent?: string;
    dependent?: string;
    controlled?: string[];
  };
  sampleSize?: number;
  design?: string;
  procedures?: string[];
  dataCollection?: string[];
  analysis?: string[];
}

export interface LiteratureContext {
  sourceCount?: number;
  keyFindings?: string[];
  gaps?: string[];
  themes?: string[];
}

export interface ResearchQuestionContext {
  question?: string;
  stage?: string;
  focus?: string;
}

export interface ProjectChatContext {
  researchQuestion?: ResearchQuestionContext;
  methodology?: MethodologyContext;
  literature?: LiteratureContext;
  projectPhase?: 'question' | 'literature' | 'methodology' | 'design' | 'results';
}

/**
 * Formats methodology context for AI prompt
 */
export function formatMethodologyContext(methodology: MethodologyContext | null | undefined): string {
  if (!methodology || !methodology.method) {
    return '';
  }

  const parts: string[] = [];

  parts.push(`Student's Methodology:`);
  parts.push(`- Using ${methodology.method}`);

  if (methodology.variables?.independent && methodology.variables?.dependent) {
    parts.push(`- Testing effect of ${methodology.variables.independent} on ${methodology.variables.dependent}`);
  }

  if (methodology.sampleSize) {
    parts.push(`- Planning ${methodology.sampleSize} participants`);
  }

  if (methodology.design) {
    parts.push(`- Design: ${methodology.design}`);
  }

  if (methodology.procedures && methodology.procedures.length > 0) {
    parts.push(`- Key procedures: ${methodology.procedures.slice(0, 3).join(', ')}`);
  }

  if (methodology.dataCollection && methodology.dataCollection.length > 0) {
    parts.push(`- Data collection: ${methodology.dataCollection.slice(0, 2).join(', ')}`);
  }

  parts.push('');
  parts.push('Reference this methodology naturally when providing guidance.');

  return parts.join('\n');
}

/**
 * Formats literature context for AI prompt
 */
export function formatLiteratureContext(literature: LiteratureContext | null | undefined): string {
  if (!literature || !literature.sourceCount || literature.sourceCount === 0) {
    return '';
  }

  const parts: string[] = [];

  parts.push(`Student's Literature Review:`);
  parts.push(`- Reviewed ${literature.sourceCount} sources`);

  if (literature.keyFindings && literature.keyFindings.length > 0) {
    parts.push(`- Key findings: ${literature.keyFindings.slice(0, 2).join('; ')}`);
  }

  if (literature.gaps && literature.gaps.length > 0) {
    parts.push(`- Identified gaps: ${literature.gaps.slice(0, 2).join('; ')}`);
  }

  if (literature.themes && literature.themes.length > 0) {
    parts.push(`- Main themes: ${literature.themes.slice(0, 3).join(', ')}`);
  }

  parts.push('');
  parts.push('Reference this literature naturally when providing guidance.');

  return parts.join('\n');
}

/**
 * Formats research question context for AI prompt
 */
export function formatResearchQuestionContext(question: ResearchQuestionContext | null | undefined): string {
  if (!question || !question.question) {
    return '';
  }

  const parts: string[] = [];

  parts.push(`Student's Research Question:`);
  parts.push(`"${question.question}"`);

  if (question.stage) {
    parts.push(`- Stage: ${question.stage}`);
  }

  if (question.focus) {
    parts.push(`- Focus: ${question.focus}`);
  }

  parts.push('');

  return parts.join('\n');
}

/**
 * Builds complete chat context from project data
 */
export function buildChatContext(projectContext: ProjectChatContext): string {
  const contextParts: string[] = [];

  // Add project phase context
  if (projectContext.projectPhase) {
    contextParts.push(`Current Phase: ${projectContext.projectPhase}`);
    contextParts.push('');
  }

  // Add research question context
  const questionContext = formatResearchQuestionContext(projectContext.researchQuestion);
  if (questionContext) {
    contextParts.push(questionContext);
  }

  // Add literature context
  const literatureContext = formatLiteratureContext(projectContext.literature);
  if (literatureContext) {
    contextParts.push(literatureContext);
  }

  // Add methodology context
  const methodologyContext = formatMethodologyContext(projectContext.methodology);
  if (methodologyContext) {
    contextParts.push(methodologyContext);
  }

  // Add general instruction
  if (contextParts.length > 0) {
    contextParts.push('');
    contextParts.push('Use this context to provide personalized guidance that builds on their work.');
  }

  return contextParts.join('\n');
}

/**
 * Retrieves methodology context from project (mock implementation - replace with actual DB fetch)
 */
export async function getMethodologyContext(projectId: string): Promise<MethodologyContext | null> {
  try {
    // TODO: Replace with actual Supabase query
    // For now, return null - will be populated from actual data
    const response = await fetch(`/api/projects/${projectId}/methodology`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      method: data.methodType,
      variables: data.variables,
      sampleSize: data.sampleSize,
      design: data.design,
      procedures: data.procedures,
      dataCollection: data.dataCollection,
      analysis: data.analysis
    };
  } catch (error) {
    console.error('Error fetching methodology context:', error);
    return null;
  }
}

/**
 * Retrieves complete project context for chat
 */
export async function getProjectChatContext(
  projectId: string,
  options?: {
    includeMethodology?: boolean;
    includeLiterature?: boolean;
    includeQuestion?: boolean;
  }
): Promise<ProjectChatContext> {
  const {
    includeMethodology = true,
    includeLiterature = true,
    includeQuestion = true
  } = options || {};

  const context: ProjectChatContext = {};

  try {
    // Fetch all contexts in parallel for performance
    const promises: Promise<any>[] = [];

    if (includeQuestion) {
      promises.push(
        fetch(`/api/projects/${projectId}/question`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (includeLiterature) {
      promises.push(
        fetch(`/api/projects/${projectId}/literature`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (includeMethodology) {
      promises.push(getMethodologyContext(projectId));
    } else {
      promises.push(Promise.resolve(null));
    }

    const [questionData, literatureData, methodologyData] = await Promise.all(promises);

    // Populate context
    if (questionData) {
      context.researchQuestion = {
        question: questionData.question,
        stage: questionData.stage,
        focus: questionData.focus
      };
    }

    if (literatureData) {
      context.literature = {
        sourceCount: literatureData.sourceCount,
        keyFindings: literatureData.keyFindings,
        gaps: literatureData.gaps,
        themes: literatureData.themes
      };
    }

    if (methodologyData) {
      context.methodology = methodologyData;
    }

    // Determine project phase
    if (methodologyData?.method) {
      context.projectPhase = 'methodology';
    } else if (literatureData?.sourceCount > 0) {
      context.projectPhase = 'literature';
    } else if (questionData?.question) {
      context.projectPhase = 'question';
    }

    return context;
  } catch (error) {
    console.error('Error building project chat context:', error);
    return context;
  }
}
