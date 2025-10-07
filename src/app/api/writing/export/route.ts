import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Packer } from 'docx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, format, includeTitle, includeSections, includeCitations } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('title, created_at')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch user details (assuming project has user_id)
    const { data: projectWithUser } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    let authorName = 'Student';
    if (projectWithUser?.user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', projectWithUser.user_id)
        .single();

      if (userData?.full_name) {
        authorName = userData.full_name;
      } else if (userData?.email) {
        authorName = userData.email.split('@')[0];
      }
    }

    // Fetch paper sections
    const { data: sections, error: sectionsError } = await supabase
      .from('paper_sections')
      .select('section_name, content, word_count')
      .eq('project_id', projectId)
      .order('section_name');

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
    }

    // Fetch literature sources for citations
    const { data: sources, error: sourcesError } = await supabase
      .from('literature_sources')
      .select('title, authors, year, url')
      .eq('project_id', projectId)
      .order('created_at');

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
    }

    // Generate document
    const doc = await generateWordDocument({
      projectTitle: project.title,
      authorName,
      date: new Date(project.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      sections: sections || [],
      sources: sources || [],
      includeTitle,
      includeSections,
      includeCitations
    });

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);

    // For PDF format, we would need additional conversion
    // For now, we'll just return the DOCX format
    if (format === 'pdf') {
      // Note: PDF conversion would require additional library like pdf-lib or puppeteer
      // For simplicity, we'll return docx format for now
      return NextResponse.json(
        { error: 'PDF export coming soon. Please use Word format.' },
        { status: 400 }
      );
    }

    // Return the document as a downloadable file
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().getFullYear()}.docx"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}

interface DocumentData {
  projectTitle: string;
  authorName: string;
  date: string;
  sections: Array<{ section_name: string; content: string; word_count: number }>;
  sources: Array<{ title: string; authors?: string; year?: number; url?: string }>;
  includeTitle: boolean;
  includeSections: boolean;
  includeCitations: boolean;
}

async function generateWordDocument(data: DocumentData): Promise<Document> {
  const children: Paragraph[] = [];

  // Title Page
  if (data.includeTitle) {
    children.push(
      new Paragraph({
        text: data.projectTitle,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        text: data.authorName,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: data.date,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        text: '',
        pageBreakBefore: true
      })
    );
  }

  // Sections
  if (data.includeSections && data.sections.length > 0) {
    const orderedSections = ['Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion'];

    for (const sectionName of orderedSections) {
      const section = data.sections.find(s => s.section_name === sectionName);
      if (section && section.content) {
        // Section heading
        children.push(
          new Paragraph({
            text: section.section_name,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          })
        );

        // Section content - split by paragraphs
        const paragraphs = section.content.split('\n\n').filter(p => p.trim());
        for (const para of paragraphs) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para.trim(),
                  size: 24 // 12pt in half-points
                })
              ],
              spacing: { before: 120, after: 120, line: 360 } // Double spacing
            })
          );
        }
      }
    }
  }

  // References
  if (data.includeCitations && data.sources.length > 0) {
    children.push(
      new Paragraph({
        text: 'References',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: true
      })
    );

    for (const source of data.sources) {
      const citationText = formatCitation(source);
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: citationText,
              size: 24
            })
          ],
          spacing: { before: 120, after: 120 }
        })
      );
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips (1440 twips = 1 inch)
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }
    ]
  });
}

function formatCitation(source: { title: string; authors?: string; year?: number; url?: string }): string {
  const parts: string[] = [];

  if (source.authors) {
    parts.push(source.authors);
  }

  if (source.year) {
    parts.push(`(${source.year})`);
  }

  parts.push(source.title);

  if (source.url) {
    parts.push(`Retrieved from ${source.url}`);
  }

  return parts.join('. ') + '.';
}
