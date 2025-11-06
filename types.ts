export interface User {
  id: string;
  email: string;
  role: 'Associate' | 'Partner' | 'Admin';
}

export interface CaseSummary {
  // Core Fields
  caseName: string;
  parties: string[];
  factsOfCase: string;
  legalIssues: string[];
  judgmentAndReasoning: string;
  conclusion: string;
  citation: string;
  jurisdiction: string;

  // AI Intelligence & Automation Features
  caseCategory: 'Civil' | 'Criminal' | 'Constitutional' | 'Corporate' | 'Other';
  judgmentRatio: string; // e.g., "5-4 Majority"
  legalMaxims: string[];
  groundsForAppeal: string[];
  biasIndicators: string; // e.g., "Neutral tone, reliance on established precedent."
  bailProbabilityAnalysis?: string; // For criminal cases
  precedentAnalysis: string; // e.g., "Overrules 'X vs Y', distinguishes from 'A vs B'."
  outcomeClassification: 'Favorable to Petitioner' | 'Favorable to Respondent' | 'Mixed' | 'Neutral';
  legalWeight: 'High' | 'Medium' | 'Low';
  aiConfidenceScore: number; // 0.0 to 1.0
  timelineOfEvents: { date: string; event: string; }[];
  causeOfAction: string;
  arguments: { petitioner: string[]; respondent: string[]; };
  suggestedRelevantSections: string[];
  nextLegalSteps: string[];
  witnesses?: { name: string; summary: string; }[];
  citedPrecedents: { citation: string; summary: string; }[];

  // Legal Research & Knowledge Tools
  ratioDecidendi: string;
  obiterDicta: string;

  // Document Management & Automation
  tableOfContents?: string[];

  // Visualization & Analytics
  sentimentAnalysis: {
      overallTone: 'Positive' | 'Negative' | 'Neutral';
      score: number; // -1 to 1
  };
  
  // AI Interaction & Communication
  caseFAQs: { question: string; answer: string; }[];
}


export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface Case {
    id: string;
    userId: string;
    documentName: string;
    documentText: string;
    summary: CaseSummary;
    createdAt: string;
}

// Types for the new Client Request feature
export type RequestStatus = 'Pending' | 'In Progress' | 'Completed';
export type RequestPriority = 'Low' | 'Medium' | 'High';

export interface ClientRequest {
    id: string;
    userId: string;
    clientName: string;
    requestDetails: string;
    status: RequestStatus;
    priority: RequestPriority;
    dueDate: string; // YYYY-MM-DD
    createdAt: string;
}