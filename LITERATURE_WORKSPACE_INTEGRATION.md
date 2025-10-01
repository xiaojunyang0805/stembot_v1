# Literature Workspace Integration - WP3-3.2

## Overview
This document describes the implementation of WP3-3.2: Workspace Integration, which connects the literature review system with project workspace memory and AI chat.

## Components Implemented

### 1. ProjectMemoryPanel Enhancement
**Location:** `src/components/workspace/ProjectMemoryPanel.tsx`

**Features Added:**
- Literature metrics display (source count, gaps count, progress percentage)
- Latest source preview with title and authors
- Next action recommendations
- Quick link to full literature review page
- Visual progress indicators

**Props Added:**
```typescript
interface ProjectMemoryPanelProps {
  projectId?: string;
  literatureState?: ProjectLiteratureState | null;
  // ... existing props
}
```

**Usage Example:**
```tsx
import { getLiteratureStateForProject } from '@/lib/research/crossPhaseIntegration';

const literatureState = await getLiteratureStateForProject(projectId);

<ProjectMemoryPanel
  projectId={projectId}
  literatureState={literatureState}
  currentQuestion="How does social media affect students?"
  questionStage="emerging"
/>
```

### 2. Literature Context for Chat
**Location:** `src/lib/chat/literatureContext.ts`

**Core Functions:**

#### `getLiteratureContextForChat(projectId, userQuery)`
Retrieves relevant literature sources based on user query and builds AI context prompt.

**Returns:**
```typescript
interface LiteratureContextResult {
  hasSources: boolean;
  sourceCount: number;
  contextPrompt: string;  // For AI system prompt
  citations: CitationEntry[];
  relevantSources: Array<{
    title: string;
    authors: string[];
    year: number;
    keyFindings: string[];
    citation: string;
  }>;
}
```

**Features:**
- Keyword extraction from user queries
- Relevance scoring based on title, abstract, findings, and topics
- Top 5 most relevant sources returned
- Automatic citation formatting
- Gap analysis integration

#### `isLiteratureQuery(query)`
Detects if user query is literature-related to optimize context retrieval.

**Usage Example:**
```typescript
const context = await getLiteratureContextForChat(projectId, "What do my sources say about methodology?");

if (context.hasSources) {
  console.log(`Found ${context.relevantSources.length} relevant sources`);
  // context.contextPrompt includes formatted source information for AI
}
```

### 3. Enhanced Chat API Integration
**Location:** `src/app/api/ai/enhanced-chat/route.ts`

**Integration Point:**
The literature context is automatically retrieved and added to the AI system prompt when:
1. Project ID is provided
2. User asks literature-related questions
3. Sources are available in the project

**Code Added:**
```typescript
// Add literature context if available
try {
  const literatureContext = await getLiteratureContextForChat(
    projectContext.projectId,
    userMessage
  );
  if (literatureContext.hasSources && literatureContext.contextPrompt) {
    basePrompt += literatureContext.contextPrompt;
  }
} catch (error) {
  console.warn('Error retrieving literature context:', error);
}
```

**AI Response Capabilities:**
- References specific sources with proper citations
- Connects findings to research questions
- Identifies patterns across sources
- Suggests methodology based on literature
- Answers "What do my sources say about X?" queries

### 4. Cross-Phase Data Flow
**Location:** `src/lib/research/crossPhaseIntegration.ts`

**Key Functions Already Implemented:**

#### `syncLiteratureAcrossPhases(projectId, sources, organization, gapAnalysis)`
Main synchronization function that:
1. Calculates literature progress
2. Generates methodology recommendations
3. Creates citation database
4. Updates dashboard progress
5. Generates cross-phase notifications
6. Updates project memory

#### `getLiteratureStateForProject(projectId)`
Retrieves complete literature state for other phases.

#### `getSourcesForCitation(projectId, topic?)`
Gets formatted citations for writing phase, optionally filtered by topic.

#### `getMethodologyRecommendations(projectId)`
Retrieves AI-generated methodology recommendations based on literature.

## Data Flow Example

```
User adds source in Literature Page
         ↓
saveSourceToProject() stores in Supabase
         ↓
Pinecone embedding created for semantic search
         ↓
syncLiteratureAcrossPhases() triggered
         ↓
        ┌────────────────────────────────┐
        │  Cross-Phase Data Flow         │
        ├────────────────────────────────┤
        │ 1. Project Memory Update       │
        │ 2. Dashboard Progress Update   │
        │ 3. Citation Database Created   │
        │ 4. Notifications Generated     │
        │ 5. Methodology Recommendations │
        └────────────────────────────────┘
         ↓
ProjectMemoryPanel displays metrics
         ↓
User asks question in chat
         ↓
getLiteratureContextForChat() retrieves relevant sources
         ↓
AI responds with source citations
```

## Integration Points

### Dashboard → Literature
- Literature progress displayed in dashboard
- Click-through to full literature page
- Milestone tracking (3+ sources, gap analysis, etc.)

### Literature → Methodology
- Methodology recommendations based on source analysis
- Common approaches identified and suggested
- Implementation steps provided

### Literature → Writing
- Citation database available for all phases
- APA and MLA formatted citations
- Quick copy/paste citation references

### Literature → Chat
- AI references sources in responses
- "Based on Smith (2024)..." citation format
- Literature-aware question answering
- Gap analysis suggestions

## Usage in Application

### Adding Literature to Project Workspace

```typescript
// In literature page component
import { saveSourceToProject } from '@/lib/database/sources';
import { syncLiteratureAcrossPhases } from '@/lib/research/crossPhaseIntegration';

// Save source
const { data, error } = await saveSourceToProject(projectId, sourceData);

// Sync across phases
await syncLiteratureAcrossPhases(
  projectId,
  allSources,
  organizationResult,
  gapAnalysisResult
);
```

### Displaying Literature in Workspace Panel

```tsx
// In project workspace page
import { ProjectMemoryPanel } from '@/components/workspace/ProjectMemoryPanel';
import { getLiteratureStateForProject } from '@/lib/research/crossPhaseIntegration';

export default async function ProjectWorkspace({ params }: { params: { id: string } }) {
  const literatureState = await getLiteratureStateForProject(params.id);

  return (
    <ProjectMemoryPanel
      projectId={params.id}
      literatureState={literatureState}
      // ... other props
    />
  );
}
```

### Chat Integration

```typescript
// Chat automatically includes literature context
// User: "What methodology do my sources suggest?"
// AI: "Based on your 5 research sources:
//
//      Smith et al. (2024) used experimental design with control groups...
//      Jones (2023) employed survey methodology with 500 participants...
//
//      I recommend considering a mixed-methods approach because..."
```

## Progress Tracking

Literature progress is calculated based on:
- **Source Count** (target: 10+ sources)
- **High-Quality Sources** (target: 5+ with high credibility)
- **Organization Completed** (themes and methodologies identified)
- **Gap Analysis Completed** (research gaps identified)
- **Overall Progress** (0-100%)

**Milestones:**
1. Initial Source Collection (3 sources)
2. Source Organization (themes identified)
3. Gap Analysis (gaps identified)
4. High-Quality Sources (5+ high credibility)
5. Comprehensive Review (10+ sources with full analysis)

## Database Schema

### Key Tables Used

**sources** - Stores literature sources
```sql
- id, project_id, title, authors, journal, year
- credibility_score, summary, notes
- memory_tags, citation_style
- status, created_at, updated_at
```

**project_literature_states** - Cached literature state
```sql
- id, project_id
- literature_data (JSONB)
- source_count, progress_percentage
- updated_at
```

**project_memory** - Cross-phase memory context
```sql
- id, project_id
- memory_type ('literature_context')
- memory_data (JSONB)
- updated_at
```

**project_notifications** - Cross-phase notifications
```sql
- id, project_id
- notification_data (JSONB)
- type, priority, read
- created_at
```

## Testing

To test the integration:

1. **Add sources to literature page**
   - Verify sources appear in database
   - Check Pinecone embedding creation

2. **Check ProjectMemoryPanel**
   - Literature section should appear
   - Metrics should update (source count, gaps)
   - Latest source should display
   - Click "View Literature Review" link

3. **Test chat integration**
   - Ask: "What do my sources say about X?"
   - Verify AI cites sources: "Based on Smith (2024)..."
   - Ask: "What methodology should I use?"
   - Verify methodology recommendations reference literature

4. **Verify cross-phase flow**
   - Dashboard shows literature progress
   - Notifications appear for milestones
   - Citation database accessible in writing phase

## Performance Considerations

- **Caching:** Literature state cached in `project_literature_states` table
- **Relevance Scoring:** Only top 5 sources returned to chat context
- **Lazy Loading:** Literature context only retrieved when needed
- **Error Handling:** Graceful fallbacks if literature unavailable

## Future Enhancements

Potential improvements:
1. **Real-time updates:** WebSocket notifications for literature changes
2. **Advanced search:** Semantic search across all project sources
3. **Citation suggestions:** AI suggests which sources to cite in writing
4. **Literature gaps:** Proactive suggestions to fill research gaps
5. **Cross-project insights:** Learn from literature patterns across projects

## Troubleshooting

### Literature not appearing in chat responses
- Check that `projectId` is passed to chat API
- Verify sources exist in database for project
- Ensure `getLiteratureContextForChat()` is called
- Check console for literature context errors

### ProjectMemoryPanel not showing literature
- Verify `literatureState` prop is passed
- Check that `getLiteratureStateForProject()` returns data
- Ensure sources saved with `syncLiteratureAcrossPhases()`

### Citations not formatting correctly
- Review `createCitationDatabase()` in crossPhaseIntegration.ts
- Check source data has authors, year, title
- Verify APA/MLA citation generation logic

## Summary

WP3-3.2 successfully integrates literature review with:
✅ **Project Memory Panel** - Visual literature metrics and quick access
✅ **AI Chat** - Citation-aware responses referencing sources
✅ **Cross-Phase Flow** - Literature data available across all research phases
✅ **Progress Tracking** - Dashboard updates with literature milestones
✅ **Methodology Recommendations** - AI suggests approaches based on sources

The integration creates a seamless research workflow where literature findings inform methodology, citations are ready for writing, and AI guidance is grounded in the student's actual sources.
