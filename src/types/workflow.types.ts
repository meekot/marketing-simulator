export type StepType = 'start' | 'sms' | 'email' | 'custom' | 'end';

export type TransitionStatus = 'success' | 'failure';

export interface Position {
  x: number;
  y: number;
}

export interface Transition {
  id: string;
  sourceStepId: string;
  targetStepId: string;
  condition: TransitionStatus;
}

export interface Step {
  id: string;
  type: StepType;
  name: string;
  position: Position;
  transitions: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: Step[];
  transitions: Transition[];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowValidationIssue {
  id: string;
  type: 'error' | 'warning';
  message: string;
  stepIds?: string[];
  transitionIds?: string[];
  autoFix?: boolean;
}

export interface WorkflowValidationReport {
  valid: boolean;
  errors: WorkflowValidationIssue[];
  warnings: WorkflowValidationIssue[];
  cycles: Array<{ id: string; steps: string[] }>;
}

export type WorkflowEntityType = 'step' | 'transition';

export interface WorkflowSelection {
  type: WorkflowEntityType | null;
  id: string | null;
}

export interface WorkflowPersistencePayload {
  workflow: Workflow;
  lastUpdated: string;
}

export interface WorkflowAnalytics {
  totalSteps: number;
  parallelBranches: number;
  averageDelayMs: number;
}
