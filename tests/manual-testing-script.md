# WP3-4.1 Manual Testing Script

## Pre-Testing Setup
1. Open Chrome browser
2. Navigate to: https://stembotv1.vercel.app
3. Open DevTools (F12)
4. Ensure you're logged in

---

## Scenario 1: Chemistry Research Testing

### Step 1: Create Project
**Actions:**
1. Navigate to https://stembotv1.vercel.app/projects/create
2. Enter title: "Buffer solution effectiveness in maintaining pH stability"
3. Enter research question: "How do different buffer compositions affect pH stability under temperature variations?"
4. Click "Create Project"

**Expected Results:**
- ✓ Project created successfully
- ✓ Redirected to project page
- ✓ Project appears in dashboard

**Actual Results:**
- [ ] Pass [ ] Fail
- Notes:

---

### Step 2: Navigate to Literature Review
**Actions:**
1. Click "Literature Review" tab or navigate to `/projects/[id]/literature`
2. Observe page load time in Network tab

**Expected Results:**
- ✓ Page loads in <2 seconds
- ✓ Empty state shown if no sources
- ✓ "Generate Search Strategy" button visible

**Actual Results:**
- [ ] Pass [ ] Fail
- Load time: _____ seconds
- Notes:

---

### Step 3: Generate Search Strategy
**Actions:**
1. Click "Generate Search Strategy" button
2. In console, measure time:
```javascript
console.time('searchStrategy');
// Click button
// When results appear:
console.timeEnd('searchStrategy');
```

**Expected Results:**
- ✓ Completes in <5 seconds
- ✓ Suggests chemistry databases (PubChem, ACS, RSC)
- ✓ Generates 8-12 relevant keywords:
  - "buffer capacity"
  - "pH stability"
  - "Henderson-Hasselbalch equation"
  - "temperature effects on buffers"
  - "phosphate buffer"
  - "acetate buffer"

**Actual Results:**
- [ ] Pass [ ] Fail
- Time: _____ seconds
- Keywords generated:
- Databases suggested:
- Notes:

---

### Step 4: Add Sources (Manual Entry)

Since PDF upload testing requires actual files, let's test with manual entry:

**Test Source 1: High Quality**
```
Title: pH-Dependent Buffer Capacity and Thermal Stability
Authors: Smith, J., Johnson, M.
Journal: Journal of the American Chemical Society
Year: 2024
DOI: 10.1021/jacs.2024.12345
Type: Journal Article
```

**Actions:**
1. Click "Add Source Manually" (if available) or use upload
2. Enter source details
3. Save source

**Expected Results:**
- ✓ Source saved successfully
- ✓ Appears in source list
- ✓ Shows in ProjectMemoryPanel: "Sources: 1"

**Actual Results:**
- [ ] Pass [ ] Fail
- Notes:

---

### Step 5: Trigger Credibility Assessment

**Actions:**
1. Click "Assess Credibility" for the added source
2. Measure time in console:
```javascript
console.time('credibilityAssessment');
// Click assess button
// When score appears:
console.timeEnd('credibilityAssessment');
```

**Expected Results:**
- ✓ Completes in <10 seconds
- ✓ High-quality journal → Score 85-95
- ✓ Shows "High" credibility label
- ✓ Displays factors:
  - ✓ Peer-reviewed: Yes
  - ✓ Journal impact: High
  - ✓ Methodology score: 80-100
  - ✓ Citation count (if available)

**Actual Results:**
- [ ] Pass [ ] Fail
- Time: _____ seconds
- Credibility score: _____
- Label: _____
- Factors shown:
- Notes:

---

### Step 6: Add More Sources (Total 5)

**Quick Entry for Testing:**

**Source 2** (High Quality):
- Title: Thermodynamic Analysis of Buffer Systems
- Journal: Nature Chemistry
- Year: 2023

**Source 3** (Moderate):
- Title: Buffer Performance in Biological Systems
- Journal: PLOS ONE
- Year: 2023

**Source 4** (Moderate):
- Title: Comparative Study of Buffer Effectiveness
- Journal: Chemical Research
- Year: 2022

**Source 5** (Low - Preprint):
- Title: Novel Buffer Compositions
- Journal: chemRxiv (preprint)
- Year: 2024

**Actions:**
1. Add each source
2. Assess credibility for each
3. Verify scoring matches quality level

**Expected Results:**
- ✓ All 5 sources added
- ✓ High-quality → 85-95 scores
- ✓ Moderate → 70-84 scores
- ✓ Preprint → 50-69 scores
- ✓ ProjectMemoryPanel: "Sources: 5"

**Actual Results:**
- [ ] Pass [ ] Fail
- Source count shown: _____
- Score distribution:
- Notes:

---

### Step 7: Run Gap Analysis

**Actions:**
1. Click "Analyze Gaps" button
2. Measure time:
```javascript
console.time('gapAnalysis');
// Click button
// When results appear:
console.timeEnd('gapAnalysis');
```

**Expected Results:**
- ✓ Completes in <15 seconds
- ✓ Identifies 3-5 gaps
- ✓ Chemistry-relevant gaps like:
  - "Limited studies on extreme temperatures (>50°C)"
  - "Few comparisons of phosphate vs acetate buffers"
  - "Lack of long-term stability data (>6 months)"
- ✓ Each gap has:
  - Clear description
  - Gap type (methodology/timeframe/etc)
  - Actionable suggestions

**Actual Results:**
- [ ] Pass [ ] Fail
- Time: _____ seconds
- Number of gaps: _____
- Gap quality (1-5): _____
- Gaps identified:
  1.
  2.
  3.
- Notes:

---

### Step 8: Check Workspace Integration

**Actions:**
1. Navigate to project workspace/dashboard
2. Look for ProjectMemoryPanel
3. Check literature section

**Expected Results:**
- ✓ Shows "📚 Sources: 5"
- ✓ Shows latest source:
  - Title (truncated if long)
  - First author
  - Year
- ✓ Shows gap count
- ✓ Shows progress percentage (~60-80%)
- ✓ Shows next action recommendation
- ✓ "View Literature Review →" link works

**Actual Results:**
- [ ] Pass [ ] Fail
- Screenshot:
- Metrics shown:
- Notes:

---

### Step 9: Test Chat Integration

**Actions:**
1. Navigate to chat interface (if accessible)
2. Ask: "What do my sources say about buffer capacity?"
3. Measure response time

**Expected Results:**
- ✓ Response in <5 seconds
- ✓ Includes citations:
  - "Based on Smith & Johnson (2024)..."
  - References specific findings
- ✓ Natural language response
- ✓ Mentions 2-3 of the uploaded sources

**Actual Results:**
- [ ] Pass [ ] Fail
- Response time: _____ seconds
- Citations included: Yes / No
- Quality (1-5): _____
- Response excerpt:
- Notes:

---

## Scenario 2: Biology Research Testing

### Quick Test with Mixed Quality

**Actions:**
1. Create new project: "Bacterial growth under oxidative stress"
2. Add 5 sources with intentionally mixed quality:
   - 2 high (Cell, Nature Microbiology)
   - 2 moderate (PLOS ONE, BMC)
   - 1 low (bioRxiv preprint)
3. Assess all credibility scores
4. Verify categorization

**Expected Results:**
- ✓ High-quality → 85-95, "High" label
- ✓ Moderate → 70-84, "Moderate" label
- ✓ Preprint → 50-69, "Low" label
- ✓ Clear distinction between levels
- ✓ Peer-review status correctly detected

**Actual Results:**
- [ ] Pass [ ] Fail
- Score distribution matches: Yes / No
- Notes:

---

### Progressive Gap Analysis Test

**Test with 3 sources:**
1. Start with 3 sources
2. Run gap analysis
3. Note number and specificity of gaps

**Test with 5 sources:**
1. Add 2 more sources
2. Run gap analysis again
3. Compare results

**Test with 10 sources:**
1. Add 5 more sources
2. Run gap analysis
3. Compare results

**Expected Results:**
- ✓ 3 sources: 2-3 broad gaps
- ✓ 5 sources: 3-4 more specific gaps
- ✓ 10 sources: 4-6 detailed, actionable gaps
- ✓ Quality/specificity improves with more sources
- ✓ All complete in <20 seconds

**Actual Results:**
- [ ] Pass [ ] Fail
- 3 sources → _____ gaps (time: ___s)
- 5 sources → _____ gaps (time: ___s)
- 10 sources → _____ gaps (time: ___s)
- Quality progression: Yes / No / Partial
- Notes:

---

## Scenario 3: Cross-Session Continuity

### Day 1 Actions

**Actions:**
1. Create project: "Social media impact on academic performance"
2. Add 3 psychology sources
3. Run credibility assessment
4. Note ProjectMemoryPanel state: "Sources: 3"
5. Note dashboard progress
6. **Close browser completely**
7. Wait 5 minutes (simulate "next day")

**Expected Results:**
- ✓ All data saved
- ✓ No errors in console during save

**Actual Results:**
- [ ] Pass [ ] Fail
- Console errors: Yes / No
- Notes:

---

### Day 2 Return (Simulated)

**Actions:**
1. Open browser
2. Login (if needed)
3. Navigate to the project
4. Check all data

**Verification Checklist:**
- [ ] ✓ 3 sources still visible
- [ ] ✓ Credibility scores preserved
- [ ] ✓ Source metadata intact (titles, authors, years)
- [ ] ✓ ProjectMemoryPanel shows "Sources: 3"
- [ ] ✓ Dashboard shows correct progress
- [ ] ✓ No data loss

**Actual Results:**
- [ ] Pass [ ] Fail
- Data persistence: Full / Partial / None
- Issues:
- Notes:

---

### Add More Sources & Verify Updates

**Actions:**
1. Add 2 more sources (total: 5)
2. Observe real-time updates

**Expected Results:**
- ✓ ProjectMemoryPanel updates to "Sources: 5"
- ✓ Progress percentage increases
- ✓ Latest source updates automatically
- ✓ No page refresh needed
- ✓ Dashboard reflects changes

**Actual Results:**
- [ ] Pass [ ] Fail
- Real-time updates: Yes / No / Partial
- Notes:

---

### Gap Analysis Auto-Update Test

**Actions:**
1. Run gap analysis with all 5 sources
2. Note results
3. Check if methodology recommendations updated

**Expected Results:**
- ✓ Analysis includes all 5 sources
- ✓ Gaps refined based on new data
- ✓ Dashboard progress updates
- ✓ Methodology recommendations refresh

**Actual Results:**
- [ ] Pass [ ] Fail
- All sources included: Yes / No
- Recommendations updated: Yes / No
- Notes:

---

## Performance Testing Summary

### Timing Verification

Fill in actual times:

| Operation | Target | Actual | Pass/Fail |
|-----------|--------|--------|-----------|
| Search generation | <5s | ___s | [ ] |
| PDF processing | <30s | ___s | [ ] |
| Credibility assessment | <10s | ___s | [ ] |
| Gap analysis (5-10 sources) | <15s | ___s | [ ] |
| Page load with 10 sources | <2s | ___s | [ ] |
| Memory retrieval | <500ms | ___ms | [ ] |
| Chat response | <5s | ___s | [ ] |

---

### Lighthouse Performance Test

**Actions:**
1. Open literature page with 10 sources
2. Open DevTools → Lighthouse tab
3. Run performance audit (Desktop mode)

**Expected Scores:**
- Performance: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s

**Actual Scores:**
- Performance: _____
- FCP: _____s
- TTI: _____s
- [ ] Pass [ ] Fail

---

## Functionality Checklist

Check each feature:

### Core Features
- [ ] Search terms generate based on research question
- [ ] Sources can be added (upload or manual)
- [ ] Credibility assessment displays correctly
- [ ] Gap analysis identifies real opportunities
- [ ] Sources save to project memory
- [ ] Workspace shows literature progress
- [ ] Chat can reference sources with citations

### UI/UX
- [ ] Loading states show for async operations
- [ ] Error messages are clear and helpful
- [ ] Empty states guide user to next action
- [ ] Progress indicators update in real-time
- [ ] Navigation is intuitive

### Data Persistence
- [ ] Sources survive browser close
- [ ] Credibility scores preserved
- [ ] Gap analysis results saved
- [ ] Progress data persists
- [ ] Cross-session continuity works

### Integration
- [ ] ProjectMemoryPanel shows literature metrics
- [ ] Dashboard displays progress
- [ ] Methodology phase can access sources
- [ ] Writing phase has citation database
- [ ] Chat integration works

---

## Edge Cases Tested

- [ ] **No sources yet** - Shows appropriate empty state
- [ ] **Duplicate source** - Detection or handling
- [ ] **Gap analysis with <3 sources** - Shows message or handles gracefully
- [ ] **Chat without sources** - Appropriate response
- [ ] **Network error during operation** - Error handling works
- [ ] **Invalid PDF** - Clear error message
- [ ] **Very long titles/abstracts** - UI handles gracefully

---

## Issues Found

| # | Severity | Description | Steps to Reproduce | Status |
|---|----------|-------------|-------------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Overall Assessment

**Scenario 1 (Chemistry):** [ ] Pass [ ] Fail [ ] Partial
**Scenario 2 (Biology):** [ ] Pass [ ] Fail [ ] Partial
**Scenario 3 (Continuity):** [ ] Pass [ ] Fail [ ] Partial
**Performance:** [ ] Pass [ ] Fail [ ] Partial
**Functionality:** ___/10 features working

**Ready for Production:** [ ] Yes [ ] No [ ] With Fixes

---

## Recommendations

1.
2.
3.

---

## Tester Sign-Off

**Name:** ___________________
**Date:** ___________________
**Time Spent:** _____ minutes
**Overall Rating:** ___/10
