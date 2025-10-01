/**
 * AI Search Strategy Generation API
 *
 * Generates optimized search terms and database recommendations
 * using GPT-4o-mini for literature discovery
 *
 * Location: src/app/api/ai/search-strategy/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (only if API key is available)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Academic database mapping for intelligent recommendations
const ACADEMIC_DATABASES = {
  'biology': [
    {
      name: 'PubMed',
      description: 'Biomedical and life sciences literature',
      url: 'https://pubmed.ncbi.nlm.nih.gov/',
      suitabilityReason: 'Premier database for biological and medical research',
      priority: 'primary'
    },
    {
      name: 'Nature',
      description: 'High-impact multidisciplinary research',
      url: 'https://www.nature.com/',
      suitabilityReason: 'Leading journals in biological sciences',
      priority: 'primary'
    },
    {
      name: 'Science Direct',
      description: 'Broad scientific research coverage',
      url: 'https://www.sciencedirect.com/',
      suitabilityReason: 'Comprehensive coverage of biological research',
      priority: 'secondary'
    }
  ],
  'chemistry': [
    {
      name: 'ACS Publications',
      description: 'Chemistry and chemical engineering research',
      url: 'https://pubs.acs.org/',
      suitabilityReason: 'Leading chemistry journals and research',
      priority: 'primary'
    },
    {
      name: 'Science Direct',
      description: 'Chemical engineering and materials science',
      url: 'https://www.sciencedirect.com/',
      suitabilityReason: 'Extensive chemistry and materials research',
      priority: 'primary'
    },
    {
      name: 'Nature Chemistry',
      description: 'High-impact chemistry research',
      url: 'https://www.nature.com/nchem/',
      suitabilityReason: 'Premier chemistry research publication',
      priority: 'secondary'
    }
  ],
  'physics': [
    {
      name: 'arXiv',
      description: 'Physics and mathematics preprints',
      url: 'https://arxiv.org/',
      suitabilityReason: 'Latest research in theoretical and experimental physics',
      priority: 'primary'
    },
    {
      name: 'Nature Physics',
      description: 'High-impact physics research',
      url: 'https://www.nature.com/nphys/',
      suitabilityReason: 'Leading physics research publication',
      priority: 'primary'
    },
    {
      name: 'Science Direct',
      description: 'Applied physics and engineering',
      url: 'https://www.sciencedirect.com/',
      suitabilityReason: 'Comprehensive physics and applied research',
      priority: 'secondary'
    }
  ],
  'engineering': [
    {
      name: 'IEEE Xplore',
      description: 'Engineering and technology research',
      url: 'https://ieeexplore.ieee.org/',
      suitabilityReason: 'Premier engineering and technology database',
      priority: 'primary'
    },
    {
      name: 'Science Direct',
      description: 'Engineering and applied sciences',
      url: 'https://www.sciencedirect.com/',
      suitabilityReason: 'Comprehensive engineering research coverage',
      priority: 'primary'
    },
    {
      name: 'Springer',
      description: 'Engineering and technology publications',
      url: 'https://link.springer.com/',
      suitabilityReason: 'Leading engineering research publications',
      priority: 'secondary'
    }
  ],
  'general': [
    {
      name: 'Science Direct',
      description: 'Multidisciplinary scientific research',
      url: 'https://www.sciencedirect.com/',
      suitabilityReason: 'Broad coverage across all scientific fields',
      priority: 'primary'
    },
    {
      name: 'Nature',
      description: 'High-impact multidisciplinary research',
      url: 'https://www.nature.com/',
      suitabilityReason: 'Premier scientific research across all fields',
      priority: 'primary'
    },
    {
      name: 'Google Scholar',
      description: 'Academic search across all disciplines',
      url: 'https://scholar.google.com/',
      suitabilityReason: 'Comprehensive academic search engine',
      priority: 'secondary'
    }
  ]
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { researchQuestion, projectId } = body;

    if (!researchQuestion || !projectId) {
      return NextResponse.json(
        { error: 'Research question and project ID are required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available, use fallback if not
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, using fallback search strategy generation');
      const fallbackStrategy = generateFallbackStrategy(researchQuestion);
      return NextResponse.json({
        success: true,
        searchStrategy: fallbackStrategy,
        generatedAt: new Date().toISOString(),
        source: 'fallback'
      });
    }

    // Generate search strategy using GPT-4o-mini
    const searchStrategy = await generateSearchStrategy(researchQuestion);

    return NextResponse.json({
      success: true,
      searchStrategy,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in search strategy generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate search strategy' },
      { status: 500 }
    );
  }
}

/**
 * Generate optimized search strategy using OpenAI GPT-4o-mini
 */
async function generateSearchStrategy(researchQuestion: string) {
  // Fallback if OpenAI is not available
  if (!openai) {
    console.warn('OpenAI client not initialized, using fallback strategy');
    return generateFallbackStrategy(researchQuestion);
  }
  const prompt = `Generate academic search terms for this research question: "${researchQuestion}"

Please provide:
1) Primary search string (3-4 key terms with AND/OR operators)
2) 2-3 alternative search combinations for broader/narrower results
3) Research field classification (biology, chemistry, physics, engineering, or general)
4) Brief explanation of search strategy

Format as JSON:
{
  "primarySearchString": "term1 AND term2 AND term3",
  "alternativeStrings": ["broader terms", "more specific terms"],
  "researchField": "biology|chemistry|physics|engineering|general",
  "explanation": "Brief strategy explanation"
}

Focus on terms that would find high-quality peer-reviewed research. Use academic terminology and consider synonyms researchers might use.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert research librarian helping students create effective literature search strategies. Generate search terms that will find relevant, high-quality academic sources.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more focused results
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response, using fallback');
      return generateFallbackStrategy(researchQuestion);
    }

    // Get database recommendations based on research field
    const researchField = parsedResponse.researchField || 'general';
    const recommendedDatabases = ACADEMIC_DATABASES[researchField as keyof typeof ACADEMIC_DATABASES] || ACADEMIC_DATABASES['general'];

    return {
      primarySearchString: parsedResponse.primarySearchString,
      alternativeStrings: parsedResponse.alternativeStrings || [],
      recommendedDatabases,
      researchField,
      explanation: parsedResponse.explanation,
      generatedAt: new Date()
    };

  } catch (error) {
    console.warn('OpenAI search strategy generation failed, using fallback:', error);
    return generateFallbackStrategy(researchQuestion);
  }
}

/**
 * Fallback search strategy generation when AI fails
 */
function generateFallbackStrategy(researchQuestion: string) {
  const questionLower = researchQuestion.toLowerCase();

  // Extract key terms
  const keyTerms = researchQuestion
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 4);

  // Detect research field
  let researchField = 'general';
  if (questionLower.includes('bacterial') || questionLower.includes('biology') || questionLower.includes('organism')) {
    researchField = 'biology';
  } else if (questionLower.includes('chemical') || questionLower.includes('reaction') || questionLower.includes('chemistry')) {
    researchField = 'chemistry';
  } else if (questionLower.includes('engineering') || questionLower.includes('technology')) {
    researchField = 'engineering';
  } else if (questionLower.includes('physics') || questionLower.includes('measurement') || questionLower.includes('accuracy')) {
    researchField = 'physics';
  }

  // Generate search strings
  const primarySearchString = keyTerms.slice(0, 3).join(' AND ');
  const alternativeStrings = [
    keyTerms.slice(0, 2).join(' AND '),
    keyTerms.join(' OR ')
  ];

  // Get appropriate databases
  const recommendedDatabases = ACADEMIC_DATABASES[researchField as keyof typeof ACADEMIC_DATABASES] || ACADEMIC_DATABASES['general'];

  return {
    primarySearchString,
    alternativeStrings,
    recommendedDatabases,
    researchField,
    explanation: `Fallback strategy generated from key terms: ${keyTerms.join(', ')}`,
    generatedAt: new Date()
  };
}