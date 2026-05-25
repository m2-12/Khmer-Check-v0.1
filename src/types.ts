export type ToneMode = 'formal' | 'friendly' | 'luxury' | 'youthful' | 'professional' | 'promotional';

export interface BoundingBox {
  x: number;      // % from left (0 - 100)
  y: number;      // % from top (0 - 100)
  width: number;  // % of width (0 - 100)
  height: number; // % of height (0 - 100)
}

export interface CorrectionItem {
  id: string;
  originalText: string;
  correctedText: string | null; // null if perfect
  boundingBox: BoundingBox;
  category: 'spelling' | 'grammar' | 'spacing' | 'typography' | 'tone' | 'ok';
  explanation: string; // Brief reason for the correction (bilingual or clear)
  alternatives: string[]; // Options for better copywriting
  readabilityRating: 'excellent' | 'fair' | 'poor';
  fontReadabilityWarning: string | null;
}

export interface LegalCompliance {
  isCompliant: boolean;
  hasKhmerAboveForeign: boolean;
  isKhmerSizeCompliant: boolean;
  complianceScore: number;
  complianceWarnings: string[];
}

export interface PosterAnalysis {
  id: string; // unique ID for session / history
  fileName: string;
  fileSize: string;
  createdAt: string;
  imageSrc: string; // Base64 or placeholder URL
  overallStats: {
    confidenceScore: number;     // 0 - 100
    grammarSpacerScore: number;  // 0 - 100
    marketingImpactScore: number; // 0 - 100
  };
  layoutAdvice: {
    hasOverlapIssue: boolean;
    overlapDetails: string | null;
    spacingDistributionRating: string; // e.g., "Good balance", "Crowded bottom"
    aestheticVibeMatch: string; // e.g. "Modern youth-focused food promotion"
  };
  marketingHooks: string[]; // List of AI Copywriting suggestions
  legalCompliance?: LegalCompliance; // Cambodian official signage laws auditor check
  items: CorrectionItem[];
}

export interface BrandDictionaryItem {
  id: string;
  term: string;       // Incorrect/source wording e.g. "ឆាប់ឡើង"
  replacement: string; // Approved brand standard e.g. "ប្រញាប់ឡើង"
  category: string;
}

export interface UserCustomRule {
  id: string;
  name: string;
  ruleType: 'find_replace' | 'strict_formal' | 'always_unicode' | 'force_tone';
  details: string;
}

export interface HistoryItem {
  id: string;
  name: string;
  imageSrc: string;
  createdAt: string;
  score: number;
  grammarIssuesCount: number;
}
