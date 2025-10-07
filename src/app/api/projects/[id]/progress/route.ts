import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('created_at, research_question')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch paper sections for writing progress
    const { data: sections, error: sectionsError } = await supabase
      .from('paper_sections')
      .select('section_name, content, word_count, status')
      .eq('project_id', projectId);

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
    }

    // Fetch literature sources count
    const { data: sources, error: sourcesError } = await supabase
      .from('literature_sources')
      .select('id')
      .eq('project_id', projectId);

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
    }

    // Fetch methodology data
    const { data: methodology, error: methodologyError } = await supabase
      .from('project_methodology')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (methodologyError && methodologyError.code !== 'PGRST116') {
      console.error('Error fetching methodology:', methodologyError);
    }

    // Fetch recent activities from project_activity
    const { data: activities, error: activitiesError } = await supabase
      .from('project_activity')
      .select('activity_type, last_accessed_at')
      .eq('project_id', projectId)
      .order('last_accessed_at', { ascending: false })
      .limit(5);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    // Calculate writing section progress
    const sectionTargets: { [key: string]: number } = {
      'Introduction': 800,
      'Methods': 600,
      'Results': 800,
      'Discussion': 1000,
      'Conclusion': 400
    };

    const writingSections = Object.keys(sectionTargets).map(sectionName => {
      const section = sections?.find(s => s.section_name === sectionName);
      return {
        name: sectionName,
        wordCount: section?.word_count || 0,
        targetWords: sectionTargets[sectionName],
        status: section?.status || 'not_started'
      };
    });

    const totalWords = writingSections.reduce((sum, s) => sum + s.wordCount, 0);
    const totalTarget = Object.values(sectionTargets).reduce((sum, t) => sum + t, 0);
    const writingProgress = Math.round((totalWords / totalTarget) * 100);

    // Calculate phase progress
    const literatureProgress = Math.min(100, (sources?.length || 0) * 20); // 5 sources = 100%
    const methodologyProgress = methodology ? 80 : 20; // Has methodology = 80%, otherwise 20%

    // Determine current phase
    let currentPhase = 'Question Refined';
    if (writingProgress > 0) {
      currentPhase = 'Writing Phase';
    } else if (methodologyProgress > 50) {
      currentPhase = 'Methodology';
    } else if (literatureProgress > 0) {
      currentPhase = 'Literature Review';
    }

    // Build timeline phases
    const getLiteratureStatus = (): 'completed' | 'in_progress' | 'pending' => {
      if (literatureProgress >= 100) return 'completed';
      if (literatureProgress > 0) return 'in_progress';
      return 'pending';
    };

    const getMethodologyStatus = (): 'completed' | 'in_progress' | 'pending' => {
      if (methodologyProgress >= 80) return 'completed';
      if (methodologyProgress > 20) return 'in_progress';
      return 'pending';
    };

    const getWritingStatus = (): 'completed' | 'in_progress' | 'pending' => {
      if (writingProgress >= 100) return 'completed';
      if (writingProgress > 0) return 'in_progress';
      return 'pending';
    };

    const phases = [
      {
        name: 'Question Refined',
        weeks: 'Week 1-2',
        status: 'completed' as const,
        icon: '✅'
      },
      {
        name: 'Literature Review',
        weeks: 'Week 3-4',
        status: getLiteratureStatus(),
        icon: literatureProgress >= 100 ? '✅' : literatureProgress > 0 ? '📚' : '⏳'
      },
      {
        name: 'Methodology',
        weeks: 'Week 5-6',
        status: getMethodologyStatus(),
        icon: methodologyProgress >= 80 ? '✅' : methodologyProgress > 20 ? '🔬' : '⏳'
      },
      {
        name: 'Writing Phase',
        weeks: 'Week 7-10',
        status: getWritingStatus(),
        icon: writingProgress >= 100 ? '✅' : writingProgress > 0 ? '✍️' : '⏳',
        subItems: writingSections.map(s => ({
          name: s.name,
          progress: `${s.wordCount}/${s.targetWords} words`,
          status: s.status
        }))
      },
      {
        name: 'Final Review',
        weeks: 'Week 11',
        status: 'pending' as const,
        icon: '⏳'
      }
    ];

    // Next milestone
    let nextMilestone = 'Start Literature Review';
    if (currentPhase === 'Writing Phase') {
      const nextSection = writingSections.find(s => s.status !== 'completed');
      if (nextSection) {
        const remaining = nextSection.targetWords - nextSection.wordCount;
        nextMilestone = `Complete ${nextSection.name} (${remaining} words to go)`;
      } else {
        nextMilestone = 'Complete Final Review';
      }
    } else if (currentPhase === 'Methodology') {
      nextMilestone = 'Complete Methodology Planning';
    } else if (currentPhase === 'Literature Review') {
      nextMilestone = 'Add more sources and complete literature review';
    }

    // Estimated completion (simple calculation: 11 weeks from project creation)
    const createdDate = new Date(project.created_at);
    const estimatedDate = new Date(createdDate);
    estimatedDate.setDate(estimatedDate.getDate() + (11 * 7)); // 11 weeks
    const estimatedCompletion = estimatedDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Build recent activities
    const recentActivities = (activities || []).map(activity => {
      const timestamp = new Date(activity.last_accessed_at);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let timeStr = '';
      if (diffDays > 0) {
        timeStr = diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
      } else if (diffHours > 0) {
        timeStr = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      } else {
        timeStr = 'Just now';
      }

      let icon = '📊';
      let text = 'Viewed project';

      if (activity.activity_type === 'writing') {
        icon = '✍️';
        text = 'Worked on writing';
      } else if (activity.activity_type === 'literature') {
        icon = '📚';
        text = 'Added literature sources';
      } else if (activity.activity_type === 'methodology') {
        icon = '🔬';
        text = 'Updated methodology';
      }

      return {
        icon,
        text,
        timestamp: timeStr
      };
    });

    return NextResponse.json({
      phases,
      currentPhase,
      nextMilestone,
      estimatedCompletion,
      writingSections,
      writingProgress,
      recentActivities: recentActivities.slice(0, 3) // Only top 3
    });

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}
