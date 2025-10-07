# WP5 Writing Phase - Integration Test Plan

## Test Date: 2025-01-07
## Phase: Final Integration & Testing (WP5-8)

---

## 🎯 Integration Checklist

### 1. Writing and Docs Page (`/projects/[id]/writing`)

**Core Functionality:**
- [ ] Outline generation from project memory (Literature + Methodology)
- [ ] Writing interface saves to `paper_sections` table
- [ ] Section navigation (Intro → Methods → Results → Discussion → Conclusion)
- [ ] Writing help uses actual project data (sources, gaps, methodology)
- [ ] Word count updates in real-time (on keystroke debounce)
- [ ] Export button generates Word/PDF documents

**API Endpoints:**
- `/api/writing/generate-outline` - Generates outline from project context
- `/api/writing/get-outline` - Retrieves saved outline
- `/api/writing/sections` (GET/POST) - Section CRUD operations
- `/api/writing/suggestions` - Context-aware writing help
- `/api/writing/export` - Document export

**Database Schema:**
```sql
paper_sections (
  id, project_id, section_name, content,
  word_count, status, created_at, updated_at
)
```

**Expected Behavior:**
1. **First Visit:** Outline generates automatically (<8 sec)
2. **Writing:** Auto-save every 30 seconds, word count updates instantly
3. **Section Switch:** Content preserved, status saved
4. **Export:** Clean .docx file with all sections formatted
5. **Help Suggestions:** 3-5 bullet points using project sources

---

### 2. Progress Page (`/projects/[id]/progress`)

**Core Functionality:**
- [ ] Timeline shows 5 phases (Question → Literature → Methodology → Writing → Review)
- [ ] Writing progress pulls from `paper_sections` table
- [ ] Section breakdown shows word counts (150/800 words per section)
- [ ] Recent activity displays writing timestamps
- [ ] Inactivity nudge appears after 7+ days
- [ ] Next milestone guidance shown

**API Endpoint:**
- `/api/projects/[id]/progress` - Calculates metrics from database

**Expected Behavior:**
1. **Timeline:** Current phase highlighted with "← You are here"
2. **Writing Card:** Shows all sections with progress bars
3. **Activity Feed:** Last 3 writing sessions with timestamps
4. **Nudge Banner:** Only if 7+ days inactive, dismissible
5. **Real-time Updates:** Reflects changes made in Writing page

---

### 3. Workspace Chat Integration (`/projects/[id]`)

**Core Functionality:**
- [ ] StemBot knows current writing status (progress %, section, word count)
- [ ] Can answer writing questions naturally
- [ ] References actual content from sections
- [ ] Suggests relevant next steps
- [ ] Context retrieval fast (<500ms)
- [ ] Writing tip nudge in memory panel

**Integration Points:**
- `getWritingContextForChat()` in `/api/ai/enhanced-chat`
- Writing context added to GPT-4o-mini system prompt
- Memory panel shows progress nudge from `getMemoryPanelNudge()`

**Expected Behavior:**
1. **Context Awareness:** "I see you've written 150/800 words on Introduction..."
2. **Natural Responses:** References sections by name, knows progress
3. **Suggestions:** "Ready to work on Methods section?"
4. **Memory Panel Nudge:** Yellow box with progress + [Continue Writing] button
5. **No Lag:** Chat feels instant despite context loading

---

### 4. Cross-Page Data Consistency

**Critical Integration Points:**
- [ ] Writing in "Writing and Docs" updates Progress page metrics
- [ ] Progress percentage updates everywhere (dashboard, nav, progress page)
- [ ] Database changes reflected immediately (<2 sec refresh)
- [ ] No data loss between sessions (24hr persistence test)
- [ ] Auto-save prevents content loss

**Data Flow:**
```
Writing Page → POST /api/writing/sections → paper_sections table
Progress Page → GET /api/projects/[id]/progress → Reads paper_sections
Workspace Chat → getWritingStatus() → Reads paper_sections
Memory Panel → getMemoryPanelNudge() → Reads paper_sections
```

**Expected Behavior:**
1. Write 200 words → Progress page shows updated count within 2 seconds
2. Navigate away → Content preserved in database
3. Return after 24 hours → All content still there
4. Workspace chat → Knows about 200 words immediately
5. Export → Includes all saved sections

---

## 🧪 Test Scenarios

### Scenario 1: New User Writing Flow

**Steps:**
1. Navigate to `/projects/[id]/writing` (first time)
2. Click "Generate Outline" button
3. Wait for outline generation (<8 sec)
4. Select "Introduction" section
5. Write 200 words
6. Click "Get Writing Help"
7. Switch to "Methods" section
8. Navigate to `/projects/[id]/progress`
9. Check writing progress card (should show 15% with section breakdown)
10. Navigate to `/projects/[id]` (Workspace)
11. Ask in chat: "What should I write next?"
12. Return to Writing page
13. Click "Export to Word"

**Expected Results:**
- ✅ Outline generates with Introduction, Methods, Results, Discussion, Conclusion
- ✅ Writing interface responsive, word count updates in real-time
- ✅ Writing help returns 3-5 suggestions based on literature sources
- ✅ Methods section opens, Introduction content preserved
- ✅ Progress page shows "Introduction: 200/800 words (25%)"
- ✅ StemBot responds: "Great start! You've written 200 words on Introduction. For Methods, you'll need to describe your [methodology details]..."
- ✅ Word document downloads with formatted Introduction + Methods sections

---

### Scenario 2: Returning User Flow

**Setup:** User wrote 150 words yesterday in Introduction

**Steps:**
1. Navigate to `/projects/[id]/writing` (next day)
2. Verify content is preserved
3. Continue writing from 150 → 400 words
4. Navigate to `/projects/[id]/progress`
5. Check updated metrics
6. Navigate to Workspace
7. Check memory panel nudge

**Expected Results:**
- ✅ Introduction section loads with 150 words from yesterday
- ✅ Writing continues seamlessly, no data loss
- ✅ Progress page shows "Introduction: 400/800 words (50%)"
- ✅ Memory panel shows: "You're 10% done... Introduction is 50% complete"
- ✅ Last activity shows "1 day ago"

---

### Scenario 3: Cross-Page Consistency Test

**Steps:**
1. Write 200 words in Introduction
2. Navigate to Progress page → Check word count
3. Navigate to Workspace → Check memory panel
4. Return to Writing page → Verify content preserved
5. Ask StemBot in chat: "How much have I written?"
6. Navigate to Dashboard → Check project progress
7. Return to Writing page → Add 100 more words
8. Refresh all pages → Verify updates everywhere

**Expected Results:**
- ✅ Progress page shows 200 words immediately
- ✅ Memory panel shows "Introduction: 200/800 words"
- ✅ Content preserved when returning to Writing page
- ✅ StemBot responds: "You've written 200 words on your Introduction..."
- ✅ Dashboard shows updated writing progress percentage
- ✅ After adding 100 more words, all pages show 300 words
- ✅ No data loss on page refresh

---

## ⚡ Performance Benchmarks

### Target Performance:
- Outline generation: **<8 seconds**
- Writing help suggestions: **<5 seconds**
- Export generation: **<15 seconds**
- Auto-save: **No noticeable lag**
- Page loads: **<2 seconds**
- Chat context retrieval: **<500ms**

### Measurement Points:
1. **Outline Generation:**
   - Start: User clicks "Generate Outline"
   - End: Outline displayed in UI
   - Target: <8 seconds

2. **Writing Help:**
   - Start: User clicks "Get Writing Help"
   - End: Suggestions displayed
   - Target: <5 seconds

3. **Export:**
   - Start: User clicks "Export to Word"
   - End: File download begins
   - Target: <15 seconds

4. **Auto-save:**
   - Trigger: 30 seconds after last keystroke
   - Measure: UI freeze/lag
   - Target: No noticeable delay

5. **Chat Context:**
   - Measure: Time from message send to response
   - Include: Writing context fetch time
   - Target: Total <3 seconds (context <500ms)

---

## 🛡️ Error Handling Tests

### AI Service Failures:
- [ ] Outline generation fails → Show "Try again" button, don't block writing
- [ ] Writing help fails → Show error message with retry option
- [ ] Chat context fails → Degrade gracefully, still allow conversation

### Database Failures:
- [ ] Save fails → Keep local copy, retry automatically (3 attempts)
- [ ] Load fails → Show error with refresh option
- [ ] Network timeout → Queue saves, retry on reconnect

### Export Failures:
- [ ] Missing sections → Generate with available content
- [ ] Empty content → Show "No content to export" message
- [ ] Generation timeout → Clear error with retry button

### Missing Data:
- [ ] No literature sources → Generate outline with placeholders
- [ ] No methodology → Skip methodology-specific suggestions
- [ ] No writing content → Show getting started guide

---

## ✅ User Experience Checks

### Interface Quality:
- [ ] Clean, simple design - not overwhelming
- [ ] Clear next steps at every stage
- [ ] Progress visible and motivating
- [ ] No broken features or dead-ends
- [ ] Mobile-responsive (basic)

### Writing Flow:
- [ ] Not interrupted by auto-save
- [ ] Section navigation smooth
- [ ] Help suggestions useful, not distracting
- [ ] Export process one-click simple
- [ ] Word count motivating, not stressful

### Cross-Feature Integration:
- [ ] Writing page → Progress page → Workspace → All connected
- [ ] Data updates feel instant
- [ ] No confusion about which section is current
- [ ] Nudges helpful, not annoying
- [ ] Export includes everything written

---

## 🎯 Success Criteria

### Must Have (MVP):
- ✅ All core features work reliably
- ✅ No blocking bugs that prevent writing
- ✅ Data persists correctly across sessions
- ✅ Performance acceptable (within targets)
- ✅ Cross-page updates work
- ✅ Export generates valid documents

### Nice to Have:
- ✅ Writing help suggestions very relevant
- ✅ Nudges feel genuinely helpful
- ✅ Chat integration seamless
- ✅ Progress page motivating

### Ready for Pilot Testing When:
1. New user can write 500+ words without issues
2. Returning user finds their content preserved
3. All pages show consistent progress
4. Export works reliably
5. No data loss in 24-hour test
6. Performance meets all benchmarks

---

## 📝 Test Results Log

### Test Run #1 - [Date/Time]
**Tester:** [Name]
**Environment:** [Production/Staging]

#### Writing and Docs Page:
- Outline Generation: [ ] Pass [ ] Fail - Time: ___ seconds
- Writing Interface: [ ] Pass [ ] Fail - Notes: ___
- Writing Help: [ ] Pass [ ] Fail - Quality: ___
- Export: [ ] Pass [ ] Fail - File valid: ___

#### Progress Page:
- Timeline Display: [ ] Pass [ ] Fail
- Writing Metrics: [ ] Pass [ ] Fail - Accurate: ___
- Real-time Updates: [ ] Pass [ ] Fail - Delay: ___ seconds

#### Workspace Chat:
- Context Awareness: [ ] Pass [ ] Fail - Example: ___
- Response Quality: [ ] Pass [ ] Fail - Natural: ___
- Memory Panel Nudge: [ ] Pass [ ] Fail

#### Cross-Page Consistency:
- Data Persistence: [ ] Pass [ ] Fail
- Update Speed: [ ] Pass [ ] Fail - Delay: ___ seconds
- No Data Loss: [ ] Pass [ ] Fail

#### Performance:
- Outline: ___ sec (Target: <8)
- Writing Help: ___ sec (Target: <5)
- Export: ___ sec (Target: <15)
- Chat Context: ___ ms (Target: <500)

#### Issues Found:
1. [Issue description] - Severity: [High/Medium/Low]
2. [Issue description] - Severity: [High/Medium/Low]

#### Overall Status:
[ ] Ready for pilot testing
[ ] Needs fixes before pilot
[ ] Blocked by critical bugs

---

## 🔧 Integration Dependencies

### Database Schema:
- `paper_sections` - Main writing storage
- `projects` - Project metadata
- `project_documents` - Literature sources
- `project_conversations` - Chat history

### API Routes:
- `/api/writing/*` - Writing operations
- `/api/projects/[id]/progress` - Progress metrics
- `/api/ai/enhanced-chat` - Chat with writing context

### Library Functions:
- `getWritingStatus()` - Fetch writing from DB
- `formatWritingContext()` - Format for AI
- `getWritingContextForChat()` - Chat integration
- `detectWritingNudge()` - Nudge logic
- `getMemoryPanelNudge()` - Panel integration

### UI Components:
- `WritingEditor` - Main writing interface
- `WritingProgressDetail` - Progress breakdown
- `ProjectMemoryPanel` - Workspace nudge
- `ProjectTimeline` - Phase visualization

---

## 📊 Test Coverage Summary

| Component | Unit Tests | Integration Tests | E2E Tests |
|-----------|-----------|------------------|-----------|
| Writing API | N/A | Manual | Manual |
| Progress API | N/A | Manual | Manual |
| Chat Integration | N/A | Manual | Manual |
| Writing Context | N/A | Manual | Manual |
| Nudge Detection | N/A | Manual | Manual |
| UI Components | N/A | Manual | Manual |

**Note:** This is an MVP with manual testing. Automated tests recommended for production.

---

## 🚀 Deployment Checklist

Before marking as "Ready for Pilot":
- [ ] All integration tests pass
- [ ] Performance benchmarks met
- [ ] No critical bugs
- [ ] Error handling tested
- [ ] Data persistence verified (24hr)
- [ ] Cross-page consistency confirmed
- [ ] Export working reliably
- [ ] Chat integration seamless
- [ ] User experience smooth
- [ ] Documentation updated

---

**Last Updated:** 2025-01-07
**Status:** Testing in Progress
**Next Review:** After test completion
