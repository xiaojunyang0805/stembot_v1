import { supabase } from '../supabase'

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  confidence: number; // 0-100
  matchedDocuments: DuplicateMatch[];
  recommendation: 'overwrite' | 'keep_both' | 'merge' | 'skip';
}

export interface DuplicateMatch {
  id: string;
  filename: string;
  originalName: string;
  similarity: number;
  matchType: 'exact' | 'similar_name' | 'similar_content' | 'version';
  uploadDate: string;
  fileSize: number;
}

export interface DuplicateChoice {
  action: 'overwrite' | 'keep_both' | 'rename' | 'cancel';
  newName?: string;
  replaceDocumentId?: string;
}

/**
 * Intelligent duplicate detection system for uploaded documents
 */
export class DocumentDuplicateDetector {

  /**
   * Check if uploaded document is a duplicate of existing documents
   */
  async detectDuplicates(
    projectId: string,
    newFile: File,
    extractedText?: string
  ): Promise<DuplicateDetectionResult> {

    // Get all existing documents for this project
    const { data: existingDocs, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('upload_status', 'completed');

    console.log('📊 Database Query Results:');
    console.log('  Project ID:', projectId);
    console.log('  Query Error:', error ? error.message : 'None');
    console.log('  Documents Found:', existingDocs?.length || 0);

    if (error) {
      console.error('❌ Database error:', error);
      return {
        isDuplicate: false,
        confidence: 0,
        matchedDocuments: [],
        recommendation: 'keep_both'
      };
    }

    if (!existingDocs || existingDocs.length === 0) {
      console.log('📄 No existing documents found for comparison');
      return {
        isDuplicate: false,
        confidence: 0,
        matchedDocuments: [],
        recommendation: 'keep_both'
      };
    }

    const matches: DuplicateMatch[] = [];

    console.log('🔍 Starting similarity analysis...');
    for (const doc of existingDocs) {
      const similarity = this.calculateSimilarity(newFile, doc, extractedText);

      console.log(`📄 Comparing with "${doc.original_name}":`, {
        newFileName: newFile.name,
        existingFileName: doc.original_name,
        newFileSize: newFile.size,
        existingFileSize: doc.file_size,
        similarityScore: similarity.score,
        matchType: similarity.type,
        threshold: 'Need >30 for potential match, >70 for duplicate'
      });

      if (similarity.score > 30) { // Threshold for potential duplicate
        console.log(`✅ MATCH FOUND: ${similarity.score}% similarity`);
        matches.push({
          id: doc.id,
          filename: doc.filename,
          originalName: doc.original_name,
          similarity: similarity.score,
          matchType: similarity.type,
          uploadDate: doc.created_at,
          fileSize: doc.file_size
        });
      } else {
        console.log(`❌ Below threshold: ${similarity.score}% < 30%`);
      }
    }

    // Sort by similarity score
    matches.sort((a, b) => b.similarity - a.similarity);

    const highestMatch = matches[0];
    const isDuplicate = matches.length > 0 && highestMatch.similarity > 70;

    return {
      isDuplicate,
      confidence: highestMatch?.similarity || 0,
      matchedDocuments: matches.slice(0, 3), // Top 3 matches
      recommendation: this.getRecommendation(matches, newFile)
    };
  }

  /**
   * Calculate similarity between new file and existing document
   */
  private calculateSimilarity(
    newFile: File,
    existingDoc: any,
    newText?: string
  ): { score: number; type: 'exact' | 'similar_name' | 'similar_content' | 'version' } {

    const newName = newFile.name.toLowerCase();
    const existingName = existingDoc.original_name.toLowerCase();

    // 1. Exact filename match
    if (newName === existingName) {
      return { score: 95, type: 'exact' };
    }

    // 2. Exact size match (highly suspicious)
    if (newFile.size === existingDoc.file_size) {
      const nameScore = this.calculateNameSimilarity(newName, existingName);
      if (nameScore > 50) {
        return { score: 90, type: 'exact' };
      }
    }

    // 3. Version pattern detection
    const versionMatch = this.detectVersionPattern(newName, existingName);
    if (versionMatch.isVersion) {
      return { score: 85, type: 'version' };
    }

    // 4. Similar filename
    const nameScore = this.calculateNameSimilarity(newName, existingName);
    if (nameScore > 70) {
      return { score: Math.min(nameScore + 10, 95), type: 'similar_name' };
    }

    // 5. Content similarity (if text available)
    if (newText && existingDoc.extracted_text) {
      const contentScore = this.calculateTextSimilarity(newText, existingDoc.extracted_text);
      if (contentScore > 60) {
        return { score: contentScore, type: 'similar_content' };
      }
    }

    // 6. Research paper pattern matching
    const paperScore = this.calculateResearchPaperSimilarity(newName, existingName);
    if (paperScore > 50) {
      return { score: paperScore, type: 'similar_name' };
    }

    return { score: Math.max(nameScore, paperScore), type: 'similar_name' };
  }

  /**
   * Calculate filename similarity using multiple algorithms
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    // Remove common extensions and normalize
    const clean1 = this.cleanFilename(name1);
    const clean2 = this.cleanFilename(name2);

    // Jaccard similarity
    const jaccardScore = this.jaccardSimilarity(clean1, clean2) * 100;

    // Levenshtein similarity
    const levenshteinScore = this.levenshteinSimilarity(clean1, clean2) * 100;

    // Weighted average (Jaccard is better for documents)
    return Math.round(jaccardScore * 0.7 + levenshteinScore * 0.3);
  }

  /**
   * Clean filename for comparison
   */
  private cleanFilename(filename: string): string {
    return filename
      .replace(/\.(pdf|docx?|xlsx?|txt|png|jpe?g)$/i, '') // Remove extensions
      .replace(/[_\-\s]+/g, ' ') // Normalize separators
      .replace(/\d{4}[_\-\s]/g, '') // Remove years
      .replace(/v\d+|version\s*\d+|rev\s*\d+/gi, '') // Remove version numbers
      .replace(/\([^)]*\)/g, '') // Remove parentheses content
      .trim()
      .toLowerCase();
  }

  /**
   * Detect version patterns (v1, v2, revision, etc.)
   */
  private detectVersionPattern(name1: string, name2: string): { isVersion: boolean; confidence: number } {
    const base1 = name1.replace(/[_\-\s]*(v\d+|version\s*\d+|rev\s*\d+|final|draft|\(\d+\))[_\-\s]*/gi, '');
    const base2 = name2.replace(/[_\-\s]*(v\d+|version\s*\d+|rev\s*\d+|final|draft|\(\d+\))[_\-\s]*/gi, '');

    const baseSimilarity = this.jaccardSimilarity(base1, base2);

    const hasVersionPattern1 = /v\d+|version\s*\d+|rev\s*\d+|final|draft|\(\d+\)/i.test(name1);
    const hasVersionPattern2 = /v\d+|version\s*\d+|rev\s*\d+|final|draft|\(\d+\)/i.test(name2);

    if (baseSimilarity > 0.8 && (hasVersionPattern1 || hasVersionPattern2)) {
      return { isVersion: true, confidence: Math.round(baseSimilarity * 100) };
    }

    return { isVersion: false, confidence: 0 };
  }

  /**
   * Calculate research paper specific similarity
   */
  private calculateResearchPaperSimilarity(name1: string, name2: string): number {
    // Extract potential paper titles (remove years, authors, etc.)
    const title1 = this.extractPaperTitle(name1);
    const title2 = this.extractPaperTitle(name2);

    if (title1.length < 10 || title2.length < 10) return 0;

    return this.jaccardSimilarity(title1, title2) * 100;
  }

  /**
   * Extract likely paper title from filename
   */
  private extractPaperTitle(filename: string): string {
    return filename
      .replace(/\d{4}[_\-\s]/g, '') // Remove years
      .replace(/[_\-]/g, ' ') // Convert separators to spaces
      .replace(/\b\w{1,3}\b/g, '') // Remove short words (likely initials)
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .toLowerCase();
  }

  /**
   * Jaccard similarity for text comparison
   */
  private jaccardSimilarity(text1: string, text2: string): number {
    const set1 = new Set(text1.split(/\s+/).filter(w => w.length > 2));
    const set2 = new Set(text2.split(/\s+/).filter(w => w.length > 2));

    const intersection = new Set(Array.from(set1).filter(w => set2.has(w)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Levenshtein similarity (normalized)
   */
  private levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate text content similarity
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    // Normalize texts
    const normalize = (text: string) => text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const words1 = normalize(text1.substring(0, 2000)); // Limit for performance
    const words2 = normalize(text2.substring(0, 2000));

    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set(Array.from(set1).filter(w => set2.has(w)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);

    return Math.round((intersection.size / union.size) * 100);
  }

  /**
   * Get AI recommendation for duplicate handling
   */
  private getRecommendation(
    matches: DuplicateMatch[],
    newFile: File
  ): 'overwrite' | 'keep_both' | 'merge' | 'skip' {

    if (matches.length === 0) return 'keep_both';

    const topMatch = matches[0];

    // Exact duplicates -> recommend overwrite
    if (topMatch.similarity > 90 && topMatch.matchType === 'exact') {
      return 'overwrite';
    }

    // Version patterns -> keep both with clear naming
    if (topMatch.matchType === 'version' && topMatch.similarity > 80) {
      return 'keep_both';
    }

    // High content similarity -> merge or overwrite
    if (topMatch.matchType === 'similar_content' && topMatch.similarity > 85) {
      return 'overwrite';
    }

    // Similar names but different content -> keep both
    if (topMatch.similarity > 70) {
      return 'keep_both';
    }

    return 'keep_both';
  }
}

/**
 * Generate user-friendly duplicate detection message
 */
export function createDuplicateMessage(result: DuplicateDetectionResult): string {
  if (!result.isDuplicate) return '';

  const topMatch = result.matchedDocuments[0];
  const confidence = result.confidence;

  let message = `🔍 **Potential Duplicate Detected** (${confidence}% similarity)\n\n`;

  if (topMatch.matchType === 'exact') {
    message += `📄 **Exact match found:** "${topMatch.originalName}"\n`;
    message += `📅 Previously uploaded: ${new Date(topMatch.uploadDate).toLocaleDateString()}\n`;
  } else if (topMatch.matchType === 'version') {
    message += `📄 **Version of existing document:** "${topMatch.originalName}"\n`;
    message += `💡 This appears to be a different version of an existing file.\n`;
  } else if (topMatch.matchType === 'similar_content') {
    message += `📄 **Similar content found:** "${topMatch.originalName}"\n`;
    message += `💡 The content appears very similar to an existing document.\n`;
  } else {
    message += `📄 **Similar document found:** "${topMatch.originalName}"\n`;
  }

  message += `\n**What would you like to do?**\n`;

  switch (result.recommendation) {
    case 'overwrite':
      message += `💡 **Recommended:** Replace the existing file (appears to be same document)\n`;
      break;
    case 'keep_both':
      message += `💡 **Recommended:** Keep both files (appears to be different versions)\n`;
      break;
    case 'merge':
      message += `💡 **Recommended:** Consider merging or choosing the most recent version\n`;
      break;
  }

  return message;
}