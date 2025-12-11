export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REPORT_READY = 'REPORT_READY',
  SIMULATING = 'SIMULATING',
  SIMULATION_COMPLETE = 'SIMULATION_COMPLETE',
  ERROR = 'ERROR'
}

export enum IssueSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface CodeIssue {
  severity: IssueSeverity;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface AnalysisReport {
  isValid: boolean;
  score: number;
  issues: CodeIssue[];
  detectedNodes: string[];
  detectedTopics: string[];
  safetyCheck: {
    safe: boolean;
    details: string;
  };
}

export interface SimulationLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  node: string;
  message: string;
}

export interface SimulationResult {
  success: boolean;
  logs: SimulationLog[];
  frames: string[]; // Base64 image strings
}
