// Mock AI responses for UI-only repository
// This provides realistic AI interactions without backend dependency

export interface MockAIResponse {
  content: string;
  type: 'helpful' | 'coaching' | 'analytical' | 'encouraging';
  confidence: number;
}

export const generateMockAIResponse = (userMessage: string): MockAIResponse => {
  const message = userMessage.toLowerCase();

  // Research methodology responses
  if (message.includes('methodology') || message.includes('method')) {
    return {
      content: "For your sleep and memory study, I'd recommend a mixed-methods approach. Start with a cross-sectional survey to establish baseline correlations, then consider a smaller longitudinal component if your timeline allows. Have you thought about using validated instruments like the Pittsburgh Sleep Quality Index (PSQI) for measuring sleep quality?",
      type: 'analytical',
      confidence: 0.92
    };
  }

  // Literature review responses
  if (message.includes('literature') || message.includes('sources') || message.includes('papers')) {
    return {
      content: "I notice you're focusing on undergraduate populations - that's a smart niche! Most sleep research focuses on clinical populations or older adults. Try searching PsycINFO with terms like 'sleep quality AND academic performance AND college students'. Also consider looking at circadian rhythm research in educational psychology journals.",
      type: 'helpful',
      confidence: 0.89
    };
  }

  // Statistical analysis responses
  if (message.includes('statistic') || message.includes('analysis') || message.includes('sample')) {
    return {
      content: "For a correlation study between sleep quality and memory performance, you'll want at least n=120 for 80% power to detect a medium effect size (r=0.25). Consider using Pearson correlations for continuous variables, and don't forget to check for normality assumptions. Would you like help planning your statistical analysis workflow?",
      type: 'analytical',
      confidence: 0.94
    };
  }

  // Research question refinement
  if (message.includes('question') || message.includes('research')) {
    return {
      content: "Your research question is developing well! To make it more specific, consider: (1) What type of memory are you focusing on - working memory, long-term retention, or episodic recall? (2) How will you operationally define 'sleep quality'? (3) What specific undergraduate characteristics matter - class year, major, living situation? These details will strengthen your methodology.",
      type: 'coaching',
      confidence: 0.87
    };
  }

  // Encouragement and general support
  if (message.includes('stuck') || message.includes('help') || message.includes('difficult')) {
    return {
      content: "Research can feel overwhelming, but you're making great progress! Breaking down complex problems is exactly what good researchers do. Based on our previous conversations, you've already identified a solid research gap and you're thinking critically about methodology. What specific aspect feels most challenging right now?",
      type: 'encouraging',
      confidence: 0.85
    };
  }

  // Ethics and IRB responses
  if (message.includes('ethics') || message.includes('irb') || message.includes('approval')) {
    return {
      content: "For your sleep and memory study with undergraduate participants, you'll likely need IRB approval since you're collecting data on human subjects. The process typically takes 2-4 weeks for expedited review. Make sure to address: (1) Informed consent procedures, (2) Data privacy protections, (3) Minimal risk assessment, (4) Right to withdraw. I can help you think through these requirements.",
      type: 'analytical',
      confidence: 0.91
    };
  }

  // Default response
  return {
    content: "That's an interesting point about your research. Based on your previous work on sleep and memory in undergraduate students, I can help you think through this systematically. What specific aspect would you like to explore further? I'm here to guide you through the research process step by step.",
    type: 'helpful',
    confidence: 0.83
  };
};

export const generateContextualSuggestions = (projectContext: string): string[] => {
  if (projectContext.includes('sleep') && projectContext.includes('memory')) {
    return [
      "Ask about statistical power analysis for your sample size",
      "Discuss sleep measurement tools and validation",
      "Explore control variables for your study design",
      "Review ethical considerations for sleep research"
    ];
  }

  return [
    "Ask about methodology design principles",
    "Discuss literature search strategies",
    "Explore statistical analysis options",
    "Review research ethics requirements"
  ];
};

export const simulateAITypingDelay = (): Promise<void> => {
  // Realistic typing delay between 800ms-2000ms
  const delay = Math.random() * 1200 + 800;
  return new Promise(resolve => setTimeout(resolve, delay));
};