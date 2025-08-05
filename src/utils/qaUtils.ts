import { searchDocumentation, buildSearchIndex } from './searchUtils';  
import type { QAAnswer, QAQuestion, QASource, QAOptions } from '../types/qa';

/**
 * Generate an answer for a given question using documentation content
 */
export const generateAnswer = async (question: QAQuestion, options: QAOptions = {}): Promise<QAAnswer> => {
  const {
    maxSources = 3
  } = options;

  // Ensure search index is built
  await buildSearchIndex();
  
  // Extract key terms from the question for searching
  const searchQuery = extractKeyTerms(question.text);
  
  // Search for relevant content
  const searchResults = await searchDocumentation(searchQuery, {
    maxResults: maxSources * 2, // Get more results to filter the best ones
    minScore: 0.1,
    includeContent: true
  });

  // Convert search results to QA sources and rank them
  const sources: QASource[] = searchResults
    .slice(0, maxSources)
    .map(result => ({
      filePath: result.filePath,
      title: result.title,
      excerpt: result.excerpt,
      relevanceScore: result.score
    }));

  // Generate answer text based on question type and sources
  const answerText = generateAnswerText(question.text, sources);
  
  // Calculate confidence based on source quality and question type
  const confidence = calculateConfidence(question.text, sources);

  return {
    id: generateId(),
    questionId: question.id,
    text: answerText,
    sources,
    confidence,
    timestamp: new Date()
  };
};

/**
 * Extract key terms from a question for searching
 */
const extractKeyTerms = (question: string): string => {
  // Remove question words and common words
  const stopWords = new Set([
    'what', 'how', 'where', 'when', 'why', 'who', 'which', 'can', 'could', 'should', 'would',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'shall', 'may', 'might', 'must', 'ought', 'need', 'to', 'of', 'in', 'on', 'at', 'by',
    'for', 'with', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'the', 'a', 'an'
  ]);

  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .join(' ');
};

/**
 * Generate answer text based on question and sources
 */
const generateAnswerText = (question: string, sources: QASource[]): string => {
  if (sources.length === 0) {
    return "I couldn't find specific information to answer your question in the documentation. You might want to try rephrasing your question or search for specific terms.";
  }

  const questionType = classifyQuestion(question);
  
  switch (questionType) {
    case 'how-to':
      return generateHowToAnswer(sources);
    case 'what-is':
      return generateDefinitionAnswer(sources);
    case 'where':
      return generateLocationAnswer(sources);
    case 'setup':
      return generateSetupAnswer(sources);
    default:
      return generateGeneralAnswer(sources);
  }
};

/**
 * Classify the type of question
 */
const classifyQuestion = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('how to') || lowerQuestion.includes('how do') || lowerQuestion.includes('how can')) {
    return 'how-to';
  }
  if (lowerQuestion.includes('what is') || lowerQuestion.includes('what are')) {
    return 'what-is';
  }
  if (lowerQuestion.includes('where') || lowerQuestion.includes('which file') || lowerQuestion.includes('located')) {
    return 'where';
  }
  if (lowerQuestion.includes('install') || lowerQuestion.includes('setup') || lowerQuestion.includes('configure')) {
    return 'setup';
  }
  
  return 'general';
};

/**
 * Generate how-to style answer
 */
const generateHowToAnswer = (sources: QASource[]): string => {
  const topSource = sources[0];
  return `Based on the documentation, here's how you can approach this:

${topSource.excerpt}

For more detailed information, check out "${topSource.title}".`;
};

/**
 * Generate definition style answer
 */
const generateDefinitionAnswer = (sources: QASource[]): string => {
  const topSource = sources[0];
  return `According to the documentation:

${topSource.excerpt}

You can find more details in "${topSource.title}".`;
};

/**
 * Generate location/where style answer
 */
const generateLocationAnswer = (sources: QASource[]): string => {
  const locations = sources.map(source => `"${source.title}"`).join(', ');
  return `You can find information about this in: ${locations}

Here's a relevant excerpt: ${sources[0].excerpt}`;
};

/**
 * Generate setup/installation style answer
 */
const generateSetupAnswer = (sources: QASource[]): string => {
  const setupSource = sources.find(source => 
    source.title.toLowerCase().includes('install') || 
    source.title.toLowerCase().includes('setup') ||
    source.title.toLowerCase().includes('getting started')
  ) || sources[0];

  return `For setup and installation:

${setupSource.excerpt}

Check the full guide in "${setupSource.title}" for step-by-step instructions.`;
};

/**
 * Generate general answer
 */
const generateGeneralAnswer = (sources: QASource[]): string => {
  const topSources = sources.slice(0, 2);
  
  let answer = "Based on the documentation:\n\n";
  
  topSources.forEach((source, index) => {
    answer += `${source.excerpt}\n\n`;
    if (index < topSources.length - 1) {
      answer += "Additionally:\n\n";
    }
  });
  
  const sourceList = topSources.map(s => `"${s.title}"`).join(' and ');
  answer += `For more information, see ${sourceList}.`;
  
  return answer;
};

/**
 * Calculate confidence score for the answer
 */
const calculateConfidence = (question: string, sources: QASource[]): number => {
  if (sources.length === 0) return 0.1;

  // Base confidence on source quality
  const avgRelevance = sources.reduce((sum, source) => sum + source.relevanceScore, 0) / sources.length;
  
  // Boost confidence for specific question types
  const questionType = classifyQuestion(question);
  const typeBoost = ['how-to', 'setup', 'what-is'].includes(questionType) ? 0.2 : 0.1;
  
  // Number of sources factor
  const sourcesFactor = Math.min(sources.length / 3, 1);
  
  return Math.min(avgRelevance + typeBoost + sourcesFactor, 1);
};

/**
 * Generate a unique ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Get common questions that users might ask
 */
export const getCommonQuestions = (): string[] => {
  return [
    "How do I install Zetty Doc Hub?",
    "What is Zetty Doc Hub?",
    "How do I configure the documentation hub?",
    "Where can I find examples?",
    "How does the file tree system work?",
    "What file formats are supported?",
    "How do I add new documentation?",
    "How do I customize the appearance?"
  ];
};