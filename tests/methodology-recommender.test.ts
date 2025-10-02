/**
 * WP4 Step 1.1: Methodology Recommender Tests
 *
 * Tests for question type detection and method mapping
 */

import { detectQuestionType, mapQuestionTypeToMethods } from '../src/lib/research/methodologyRecommender';

describe('Question Type Detection', () => {
  test('Detects causal questions correctly', () => {
    const causalQuestions = [
      'How does sleep duration affect academic performance in college students?',
      'What is the effect of social media use on anxiety levels?',
      'Does caffeine consumption improve test scores?',
      'Can meditation reduce stress in university students?',
      'Will increasing study time improve GPA?'
    ];

    causalQuestions.forEach(q => {
      const type = detectQuestionType(q);
      expect(type).toBe('causal');
    });
  });

  test('Detects correlational questions correctly', () => {
    const correlationalQuestions = [
      'Is there a relationship between exercise frequency and mood?',
      'Are screen time and sleep quality related?',
      'What is the correlation between study habits and grades?',
      'Is GPA associated with hours spent studying?',
      'Are social media use and self-esteem related?'
    ];

    correlationalQuestions.forEach(q => {
      const type = detectQuestionType(q);
      expect(type).toBe('correlational');
    });
  });

  test('Detects descriptive questions correctly', () => {
    const descriptiveQuestions = [
      'What is the current state of mental health among college students?',
      'How common is procrastination in university freshmen?',
      'What percentage of students use study groups?',
      'How many hours per week do students exercise?',
      'What are the current sleep patterns of college students?'
    ];

    descriptiveQuestions.forEach(q => {
      const type = detectQuestionType(q);
      expect(type).toBe('descriptive');
    });
  });

  test('Detects comparative questions correctly', () => {
    const comparativeQuestions = [
      'Is there a difference between online and in-person learning outcomes?',
      'Do STEM majors differ from humanities majors in study habits?',
      'Are morning classes better than afternoon classes for retention?',
      'How do freshmen compare to seniors in time management?',
      'Do males and females differ in test anxiety levels?'
    ];

    comparativeQuestions.forEach(q => {
      const type = detectQuestionType(q);
      expect(type).toBe('comparative');
    });
  });

  test('Detects mixed questions correctly', () => {
    const mixedQuestion = 'How does sleep duration affect GPA, and is there a difference between males and females?';
    const type = detectQuestionType(mixedQuestion);
    expect(type).toBe('mixed');
  });

  test('Returns unknown for unclear questions', () => {
    const unclearQuestions = [
      'Tell me about students',
      'I want to study something',
      'Research topic ideas'
    ];

    unclearQuestions.forEach(q => {
      const type = detectQuestionType(q);
      expect(type).toBe('unknown');
    });
  });
});

describe('Method Mapping', () => {
  test('Maps causal questions to experimental methods', () => {
    const methods = mapQuestionTypeToMethods('causal');
    expect(methods).toContain('experimental');
    expect(methods).toContain('quasi-experimental');
  });

  test('Maps correlational questions to correlational/survey methods', () => {
    const methods = mapQuestionTypeToMethods('correlational');
    expect(methods).toContain('correlational');
    expect(methods).toContain('survey');
  });

  test('Maps descriptive questions to survey/observational methods', () => {
    const methods = mapQuestionTypeToMethods('descriptive');
    expect(methods).toContain('survey');
    expect(methods).toContain('observational');
  });

  test('Maps comparative questions to comparative methods', () => {
    const methods = mapQuestionTypeToMethods('comparative');
    expect(methods).toContain('comparative');
  });

  test('Maps unknown questions to safe defaults', () => {
    const methods = mapQuestionTypeToMethods('unknown');
    expect(methods).toContain('survey');
    expect(methods).toContain('observational');
  });
});

describe('Edge Cases', () => {
  test('Handles empty string', () => {
    const type = detectQuestionType('');
    expect(type).toBe('unknown');
  });

  test('Handles very long questions', () => {
    const longQuestion = 'How does the duration of sleep, measured in hours per night over a period of 8 weeks, affect the academic performance of undergraduate college students as measured by their GPA at the end of the semester, controlling for initial GPA, course difficulty, and study habits?';
    const type = detectQuestionType(longQuestion);
    expect(type).toBe('causal');
  });

  test('Case insensitive detection', () => {
    const upperCase = 'HOW DOES SLEEP AFFECT PERFORMANCE?';
    const lowerCase = 'how does sleep affect performance?';
    const mixedCase = 'How Does Sleep Affect Performance?';

    expect(detectQuestionType(upperCase)).toBe('causal');
    expect(detectQuestionType(lowerCase)).toBe('causal');
    expect(detectQuestionType(mixedCase)).toBe('causal');
  });
});
