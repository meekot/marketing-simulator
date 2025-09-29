import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type {
  ExecutionLogEntry,
  SimulationResult,
  SimulationState,
} from '../types';

const initialSimulationState: SimulationState = {
  workflowId: null,
  status: 'idle',
  currentStepId: null,
  activeStepIds: [],
  completedStepIds: [],
  failedStepIds: [],
  nodeState: {},
  log: [],
  snapshots: [],
  result: undefined,
  error: undefined,
  startedAt: undefined,
  finishedAt: undefined,
};

interface SimulationStore extends SimulationState {
  startSimulation: (payload: {
    workflowId: string;
    startedAt?: string;
  }) => void;
  stepStarted: (stepId: string) => void;
  stepCompleted: (payload: { stepId: string; transitionId?: string }) => void;
  stepFailed: (payload: {
    stepId: string;
    error?: string;
    transitionId?: string;
  }) => void;
  appendLog: (
    entry: Omit<ExecutionLogEntry, 'id' | 'timestamp'> & { timestamp?: string }
  ) => void;
  clearLog: () => void;
  completeSimulation: (payload: {
    result: SimulationResult;
    finishedAt?: string;
  }) => void;
  failSimulation: (payload: { message: string; finishedAt?: string }) => void;
  resetSimulation: () => void;
}

const ensureNodeState = (state: SimulationState, stepId: string) => {
  if (!state.nodeState[stepId]) {
    state.nodeState[stepId] = {
      stepId,
      status: 'pending',
      attempt: 0,
    };
  }

  return state.nodeState[stepId];
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  ...initialSimulationState,

  startSimulation: (payload) =>
    set((state) => {
      const { workflowId, startedAt } = payload;
      return {
        ...state,
        workflowId,
        status: 'running',
        error: undefined,
        currentStepId: null,
        activeStepIds: [],
        completedStepIds: [],
        failedStepIds: [],
        nodeState: {},
        log: [],
        result: undefined,
        startedAt: startedAt ?? new Date().toISOString(),
        finishedAt: undefined,
      };
    }),

  stepStarted: (stepId) =>
    set((state) => {
      const newSimulation = { ...state };
      newSimulation.currentStepId = stepId;
      const nodeState = ensureNodeState(newSimulation, stepId);
      nodeState.status = 'processing';
      nodeState.startedAt = new Date().toISOString();
      nodeState.attempt += 1;
      return newSimulation;
    }),

  stepCompleted: (payload) =>
    set((state) => {
      const { stepId, transitionId } = payload;
      const newSimulation = { ...state };
      const nodeState = ensureNodeState(newSimulation, stepId);
      nodeState.status = 'success';
      nodeState.completedAt = new Date().toISOString();
      nodeState.lastTransitionId = transitionId ?? nodeState.lastTransitionId;

      if (!newSimulation.completedStepIds.includes(stepId)) {
        newSimulation.completedStepIds.push(stepId);
      }

      newSimulation.activeStepIds = newSimulation.activeStepIds.filter(
        (id) => id !== stepId
      );
      return newSimulation;
    }),

  stepFailed: (payload) =>
    set((state) => {
      const { stepId, error, transitionId } = payload;
      const newSimulation = { ...state };
      const nodeState = ensureNodeState(newSimulation, stepId);
      nodeState.status = 'failure';
      nodeState.completedAt = new Date().toISOString();
      nodeState.lastTransitionId = transitionId ?? nodeState.lastTransitionId;

      if (!newSimulation.failedStepIds.includes(stepId)) {
        newSimulation.failedStepIds.push(stepId);
      }

      newSimulation.activeStepIds = newSimulation.activeStepIds.filter(
        (id) => id !== stepId
      );
      newSimulation.error = error ?? newSimulation.error;
      return newSimulation;
    }),

  appendLog: (entry) =>
    set((state) => {
      const logEntry: ExecutionLogEntry = {
        id: nanoid(),
        timestamp: entry.timestamp ?? new Date().toISOString(),
        level: entry.level,
        message: entry.message,
        stepId: entry.stepId,
        transitionId: entry.transitionId,
        details: entry.details,
      };

      return {
        ...state,
        log: [...state.log, logEntry],
      };
    }),

  clearLog: () =>
    set((state) => ({
      ...state,
      log: [],
    })),

  completeSimulation: (payload) =>
    set((state) => {
      const { result, finishedAt } = payload;
      return {
        ...state,
        status: 'completed',
        result,
        finishedAt: finishedAt ?? new Date().toISOString(),
        currentStepId: null,
        activeStepIds: [],
      };
    }),

  failSimulation: (payload) =>
    set((state) => {
      const { message, finishedAt } = payload;
      return {
        ...state,
        status: 'error',
        error: message,
        finishedAt: finishedAt ?? new Date().toISOString(),
        currentStepId: null,
        activeStepIds: [],
      };
    }),

  resetSimulation: () =>
    set(() => ({
      ...initialSimulationState,
    })),
}));

export type { SimulationStore };
