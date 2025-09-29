import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { useSimulationStore } from '../simulationStore';
import type { SimulationResult } from '../../types';

// Mock nanoid for consistent IDs in tests
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-log-id'),
}));

// Mock Date.now for consistent timestamps
const mockNow = new Date('2023-01-01T12:00:00.000Z').getTime();
beforeAll(() => {
  vi.setSystemTime(mockNow);
});

afterAll(() => {
  vi.useRealTimers();
});

describe('simulationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useSimulationStore.getState().resetSimulation();
  });

  describe('initial state', () => {
    it('has correct initial state', () => {
      const state = useSimulationStore.getState();

      expect(state.workflowId).toBe(null);
      expect(state.status).toBe('idle');
      expect(state.currentStepId).toBe(null);
      expect(state.activeStepIds).toEqual([]);
      expect(state.completedStepIds).toEqual([]);
      expect(state.failedStepIds).toEqual([]);
      expect(state.nodeState).toEqual({});
      expect(state.log).toEqual([]);
      expect(state.snapshots).toEqual([]);
      expect(state.result).toBeUndefined();
      expect(state.error).toBeUndefined();
      expect(state.startedAt).toBeUndefined();
      expect(state.finishedAt).toBeUndefined();
    });
  });

  describe('startSimulation', () => {
    it('starts simulation with provided workflow ID and timestamp', () => {
      const startedAt = '2023-01-01T10:00:00.000Z';

      useSimulationStore.getState().startSimulation({
        workflowId: 'test-workflow',
        startedAt,
      });

      const state = useSimulationStore.getState();
      expect(state.workflowId).toBe('test-workflow');
      expect(state.status).toBe('running');
      expect(state.activeStepIds).toEqual([]);
      expect(state.completedStepIds).toEqual([]);
      expect(state.failedStepIds).toEqual([]);
      expect(state.nodeState).toEqual({});
      expect(state.log).toEqual([]);
      expect(state.result).toBeUndefined();
      expect(state.error).toBeUndefined();
      expect(state.startedAt).toBe(startedAt);
      expect(state.finishedAt).toBeUndefined();
    });

    it('starts simulation with auto-generated timestamp when not provided', () => {
      useSimulationStore.getState().startSimulation({
        workflowId: 'test-workflow',
      });

      const state = useSimulationStore.getState();
      expect(state.startedAt).toBe('2023-01-01T12:00:00.000Z');
    });
  });

  describe('stepStarted', () => {
    beforeEach(() => {
      useSimulationStore.getState().startSimulation({
        workflowId: 'test-workflow',
      });
    });

    it('starts step and updates node state', () => {
      useSimulationStore.getState().stepStarted('step1');

      const state = useSimulationStore.getState();
      expect(state.currentStepId).toBe('step1');
      expect(state.nodeState['step1']).toEqual({
        stepId: 'step1',
        status: 'processing',
        attempt: 1,
        startedAt: '2023-01-01T12:00:00.000Z',
      });
    });

    it('increments attempt count for subsequent calls', () => {
      useSimulationStore.getState().stepStarted('step1');
      useSimulationStore.getState().stepStarted('step1');

      const state = useSimulationStore.getState();
      expect(state.nodeState['step1'].attempt).toBe(2);
    });
  });

  describe('stepCompleted', () => {
    beforeEach(() => {
      useSimulationStore.getState().startSimulation({
        workflowId: 'test-workflow',
      });
      useSimulationStore.getState().stepStarted('step1');
    });

    it('completes step and updates node state', () => {
      useSimulationStore.getState().stepCompleted({
        stepId: 'step1',
        transitionId: 'trans1',
      });

      const state = useSimulationStore.getState();
      expect(state.nodeState['step1']).toEqual({
        stepId: 'step1',
        status: 'success',
        attempt: 1,
        startedAt: '2023-01-01T12:00:00.000Z',
        completedAt: '2023-01-01T12:00:00.000Z',
        lastTransitionId: 'trans1',
      });
      expect(state.completedStepIds).toEqual(['step1']);
      expect(state.activeStepIds).toEqual([]);
    });

    it('adds to completedStepIds without duplicates', () => {
      useSimulationStore.getState().stepCompleted({
        stepId: 'step1',
        transitionId: 'trans1',
      });

      useSimulationStore.getState().stepCompleted({
        stepId: 'step1',
        transitionId: 'trans2',
      });

      const state = useSimulationStore.getState();
      expect(state.completedStepIds).toEqual(['step1']);
    });

    it('completes step without transitionId', () => {
      useSimulationStore.getState().stepCompleted({
        stepId: 'step1',
      });

      const state = useSimulationStore.getState();
      expect(state.nodeState['step1'].lastTransitionId).toBeUndefined();
    });
  });

  describe('stepFailed', () => {
    beforeEach(() => {
      useSimulationStore.getState().startSimulation({
        workflowId: 'test-workflow',
      });
      useSimulationStore.getState().stepStarted('step1');
    });

    it('fails step and updates node state', () => {
      useSimulationStore.getState().stepFailed({
        stepId: 'step1',
        error: 'Step execution failed',
        transitionId: 'trans1',
      });

      const state = useSimulationStore.getState();
      expect(state.nodeState['step1']).toEqual({
        stepId: 'step1',
        status: 'failure',
        attempt: 1,
        startedAt: '2023-01-01T12:00:00.000Z',
        completedAt: '2023-01-01T12:00:00.000Z',
        lastTransitionId: 'trans1',
      });
      expect(state.failedStepIds).toEqual(['step1']);
      expect(state.activeStepIds).toEqual([]);
      expect(state.error).toBe('Step execution failed');
    });

    it('fails step without error message', () => {
      useSimulationStore.getState().stepFailed({
        stepId: 'step1',
      });

      const state = useSimulationStore.getState();
      expect(state.nodeState['step1'].status).toBe('failure');
      expect(state.failedStepIds).toEqual(['step1']);
      expect(state.error).toBeUndefined();
    });
  });

  describe('appendLog', () => {
    it('appends log entry with provided parameters', () => {
      useSimulationStore.getState().appendLog({
        level: 'info',
        message: 'Test message',
        stepId: 'step1',
        transitionId: 'trans1',
        details: { key: 'value' },
        timestamp: '2023-01-01T11:00:00.000Z',
      });

      const state = useSimulationStore.getState();
      expect(state.log).toHaveLength(1);
      expect(state.log[0]).toEqual({
        id: 'test-log-id',
        timestamp: '2023-01-01T11:00:00.000Z',
        level: 'info',
        message: 'Test message',
        stepId: 'step1',
        transitionId: 'trans1',
        details: { key: 'value' },
      });
    });

    it('appends log entry with auto-generated timestamp', () => {
      useSimulationStore.getState().appendLog({
        level: 'error',
        message: 'Test error',
      });

      const state = useSimulationStore.getState();
      expect(state.log).toHaveLength(1);
      expect(state.log[0]).toEqual({
        id: 'test-log-id',
        timestamp: '2023-01-01T12:00:00.000Z',
        level: 'error',
        message: 'Test error',
        stepId: undefined,
        transitionId: undefined,
        details: undefined,
      });
    });
  });

  describe('clearLog', () => {
    beforeEach(() => {
      useSimulationStore.getState().appendLog({
        level: 'info',
        message: 'Test message',
      });
    });

    it('clears all log entries', () => {
      useSimulationStore.getState().clearLog();

      const state = useSimulationStore.getState();
      expect(state.log).toEqual([]);
    });
  });

  describe('completeSimulation', () => {
    beforeEach(() => {
      useSimulationStore.getState().startSimulation({
        workflowId: 'test-workflow',
      });
    });

    it('completes simulation with result and timestamp', () => {
      const result: SimulationResult = {
        success: true,
        completedSteps: ['step1', 'step2', 'step3', 'step4', 'step5'],
        failedSteps: [],
        iterations: 1,
      };
      const finishedAt = '2023-01-01T13:00:00.000Z';

      useSimulationStore.getState().completeSimulation({
        result,
        finishedAt,
      });

      const state = useSimulationStore.getState();
      expect(state.status).toBe('completed');
      expect(state.result).toEqual(result);
      expect(state.finishedAt).toBe(finishedAt);
      expect(state.currentStepId).toBe(null);
      expect(state.activeStepIds).toEqual([]);
    });

    it('completes simulation with auto-generated timestamp', () => {
      const result: SimulationResult = {
        success: false,
        completedSteps: ['step1', 'step2'],
        failedSteps: ['step3', 'step4'],
        iterations: 2,
      };

      useSimulationStore.getState().completeSimulation({
        result,
      });

      const state = useSimulationStore.getState();
      expect(state.finishedAt).toBe('2023-01-01T12:00:00.000Z');
    });
  });

  describe('failSimulation', () => {
    beforeEach(() => {
      useSimulationStore.getState().startSimulation({
        workflowId: 'test-workflow',
      });
    });

    it('fails simulation with message and timestamp', () => {
      const message = 'Simulation failed due to timeout';
      const finishedAt = '2023-01-01T13:00:00.000Z';

      useSimulationStore.getState().failSimulation({
        message,
        finishedAt,
      });

      const state = useSimulationStore.getState();
      expect(state.status).toBe('error');
      expect(state.error).toBe(message);
      expect(state.finishedAt).toBe(finishedAt);
      expect(state.currentStepId).toBe(null);
      expect(state.activeStepIds).toEqual([]);
    });

    it('fails simulation with auto-generated timestamp', () => {
      const message = 'Simulation crashed';

      useSimulationStore.getState().failSimulation({
        message,
      });

      const state = useSimulationStore.getState();
      expect(state.error).toBe(message);
      expect(state.finishedAt).toBe('2023-01-01T12:00:00.000Z');
    });
  });

  describe('resetSimulation', () => {
    beforeEach(() => {
      useSimulationStore.getState().startSimulation({
        workflowId: 'test-workflow',
      });
      useSimulationStore.getState().stepStarted('step1');
      useSimulationStore.getState().appendLog({
        level: 'info',
        message: 'Test log',
      });
    });

    it('resets simulation to initial state', () => {
      useSimulationStore.getState().resetSimulation();

      const state = useSimulationStore.getState();
      expect(state.workflowId).toBe(null);
      expect(state.status).toBe('idle');
      expect(state.currentStepId).toBe(null);
      expect(state.activeStepIds).toEqual([]);
      expect(state.completedStepIds).toEqual([]);
      expect(state.failedStepIds).toEqual([]);
      expect(state.nodeState).toEqual({});
      expect(state.log).toEqual([]);
      expect(state.snapshots).toEqual([]);
      expect(state.result).toBeUndefined();
      expect(state.error).toBeUndefined();
      expect(state.startedAt).toBeUndefined();
      expect(state.finishedAt).toBeUndefined();
    });
  });
});
