export type SimulationStatus =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'paused'
  | 'completed'
  | 'error';

export type SimulationNodeStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failure';

export interface SimulationNodeState {
  stepId: string;
  status: SimulationNodeStatus;
  attempt: number;
  startedAt?: string;
  completedAt?: string;
  lastTransitionId?: string;
}

export interface ExecutionLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  stepId?: string;
  transitionId?: string;
  details?: Record<string, unknown>;
}

export interface SimulationResult {
  success: boolean;
  completedSteps: string[];
  failedSteps: string[];
  iterations: number;
}

export interface SimulationSnapshot {
  id: string;
  timestamp: string;
  activeSteps: string[];
  completedSteps: string[];
  failedSteps: string[];
}

export interface SimulationState {
  workflowId: string | null;
  status: SimulationStatus;
  currentStepId: string | null;
  activeStepIds: string[];
  completedStepIds: string[];
  failedStepIds: string[];
  nodeState: Record<string, SimulationNodeState>;
  log: ExecutionLogEntry[];
  snapshots: SimulationSnapshot[];
  result?: SimulationResult;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface SimulationEvent {
  type:
    | 'start'
    | 'iteration-start'
    | 'step-enter'
    | 'step-complete'
    | 'step-failure'
    | 'transition'
    | 'iteration-complete'
    | 'finish'
    | 'log';
  timestamp: string;
  payload?: Record<string, unknown>;
}

export interface SimulationRuntimeConfig {
  autoAdvance: boolean;
  delayMs: number;
}
