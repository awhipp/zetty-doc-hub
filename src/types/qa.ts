export interface QAQuestion {
  id: string;
  text: string;
  timestamp: Date;
}

export interface QAAnswer {
  id: string;
  questionId: string;
  text: string;
  sources: QASource[];
  confidence: number;
  timestamp: Date;
}

export interface QASource {
  filePath: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
}

export interface QASession {
  id: string;
  questions: QAQuestion[];
  answers: QAAnswer[];
  createdAt: Date;
}

export interface QAOptions {
  maxSources?: number;
  minConfidence?: number;
  contextLength?: number;
}