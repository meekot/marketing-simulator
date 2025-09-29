import { describe, it, expect, vi } from 'vitest';
import { simulateWorkflow, defaultExecute, SimulationError } from '../simulationEngine';
import type { Workflow } from '../../types';

// Sample workflow fixtures
const createSampleWorkflow = (): Workflow => ({
  id: 'wf1',
  name: 'Test Workflow',
  description: 'Test',
  steps: [
    {
      id: 'start',
      type: 'start',
      name: 'Start',
      position: { x: 0, y: 0 },
      transitions: ['trans1'],
    },
    {
      id: 'email1',
      type: 'email',
      name: 'Email Step',
      position: { x: 100, y: 0 },
      transitions: ['trans2'],
    },
    {
      id: 'end',
      type: 'end',
      name: 'End',
      position: { x: 200, y: 0 },
      transitions: [],
    },
  ],
  transitions: [
    {
      id: 'trans1',
      sourceStepId: 'start',
      targetStepId: 'email1',
      condition: 'success',
    },
    {
      id: 'trans2',
      sourceStepId: 'email1',
      targetStepId: 'end',
      condition: 'success',
    },
  ],
  version: '1.0',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
});

const createWorkflowWithFailurePath = (): Workflow => ({
  id: 'wf2',
  name: 'Workflow with Failure',
  description: 'Test',
  steps: [
    {
      id: 'start',
      type: 'start',
      name: 'Start',
      position: { x: 0, y: 0 },
      transitions: ['trans1'],
    },
    {
      id: 'email1',
      type: 'email',
      name: 'Email Step',
      position: { x: 100, y: 0 },
      transitions: ['trans2', 'trans3'],
    },
    {
      id: 'success_end',
      type: 'end',
      name: 'Success End',
      position: { x: 200, y: 0 },
      transitions: [],
    },
    {
      id: 'failure_end',
      type: 'end',
      name: 'Failure End',
      position: { x: 200, y: 100 },
      transitions: [],
    },
  ],
  transitions: [
    {
      id: 'trans1',
      sourceStepId: 'start',
      targetStepId: 'email1',
      condition: 'success',
    },
    {
      id: 'trans2',
      sourceStepId: 'email1',
      targetStepId: 'success_end',
      condition: 'success',
    },
    {
      id: 'trans3',
      sourceStepId: 'email1',
      targetStepId: 'failure_end',
      condition: 'failure',
    },
  ],
  version: '1.0',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
});

describe('defaultExecute', () => {
  it('returns success for non-email steps', () => {
    const step = {
      id: 'test',
      type: 'start' as const,
      name: 'Test',
      position: { x: 0, y: 0 },
      transitions: [],
    };
    const result = defaultExecute(step);
    expect(result).toBe('success');
  });
});

describe('SimulationError', () => {
  it('has step property', () => {
    const step = {
      id: 'test',
      type: 'start' as const,
      name: 'Test',
      position: { x: 0, y: 0 },
      transitions: [],
    };
    const error = new SimulationError('test message', step);
    expect(error.message).toBe('test message');
    expect(error.step).toBe(step);
  });
});

describe('simulateWorkflow', () => {
  it('executes workflow successfully with callbacks', async () => {
    const workflow = createSampleWorkflow();
    const callbacks = {
      onStart: vi.fn(),
      onStepStart: vi.fn(),
      onStepComplete: vi.fn(),
      onTransition: vi.fn(),
      onStepFailure: vi.fn(),
    };
    const mockExecute = vi.fn().mockReturnValue('success');

    await simulateWorkflow(workflow, 'start', callbacks, mockExecute);

    expect(callbacks.onStart).toHaveBeenCalledWith(workflow, workflow.steps[0]);
    expect(callbacks.onStepStart).toHaveBeenCalledTimes(3);
    expect(callbacks.onStepComplete).toHaveBeenCalledTimes(3);
    expect(callbacks.onTransition).not.toHaveBeenCalled();
    expect(callbacks.onStepFailure).not.toHaveBeenCalled();
  });

  it('handles end step correctly', async () => {
    const workflow = createSampleWorkflow();
    const endCallback = vi.fn();

    await simulateWorkflow(workflow, 'start', {
      onStepComplete: endCallback,
    });

    expect(endCallback).toHaveBeenCalled();
  });

  it('follows success and failure transitions', async () => {
    const workflow = createWorkflowWithFailurePath();
    const mockExecute = vi.fn();
    mockExecute.mockReturnValue('success');

    await simulateWorkflow(workflow, 'start', {}, mockExecute);

    
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it('throws error if start step is undefined', async () => {
    const workflow = createSampleWorkflow();

    await expect(simulateWorkflow(workflow, 'nonexistent', {})).rejects.toThrow('Start step undefined');
  });

  it('throws error on circuit detection (duplicate transitions)', async () => {
    const workflow = createSampleWorkflow();
   
    workflow.transitions.push({
      id: 'trans1',
      sourceStepId: 'start',
      targetStepId: 'email1',
      condition: 'success',
    });

    await expect(simulateWorkflow(workflow, 'start', {})).rejects.toThrow('Circuit was detected');
  });

  it('calls onStepFailure callback if target step is undefined', async () => {
    const workflow = createSampleWorkflow();
    
    workflow.transitions[0].targetStepId = 'nonexistent';
    const failureCallback = vi.fn();

    await simulateWorkflow(workflow, 'start', { onStepFailure: failureCallback });

    expect(failureCallback).toHaveBeenCalledWith('start', 'Target step is undefined nonexistent');
  });

  it('calls onStepFailure callback on max steps exceeded', async () => {
    const workflow = createSampleWorkflow();
    workflow.transitions.push({
      id: 'loop',
      sourceStepId: 'end',
      targetStepId: 'start',
      condition: 'success',
    });
    workflow.steps[0].type = 'custom';
    const failureCallback = vi.fn();

    await simulateWorkflow(workflow, 'start', { onStepFailure: failureCallback }, undefined, 2);

    expect(failureCallback).toHaveBeenCalled();
  });

  it('calls onStepFailure callback if branch has no end step', async () => {
    const workflow = createSampleWorkflow();
    const failureCallback = vi.fn();
    const mockExecute = vi.fn((step) => step.id === 'email1' ? 'failure' : 'success');

    await simulateWorkflow(workflow, 'start', { onStepFailure: failureCallback }, mockExecute);

    expect(failureCallback).toHaveBeenCalledWith('email1', "Branch don't have end step");
  });

  it('calls onStepFailure callback when SimulationError occurs', async () => {
    const workflow = createSampleWorkflow();
    workflow.steps = workflow.steps.filter(s => s.type !== 'end');
    const failureCallback = vi.fn();

    await simulateWorkflow(workflow, 'start', { onStepFailure: failureCallback });

    expect(failureCallback).toHaveBeenCalled();
  });

  it('re-throws non-SimulationError exceptions', async () => {
    const workflow = createSampleWorkflow();
    const mockExecute = vi.fn().mockRejectedValue(new Error('Custom error'));

    await expect(simulateWorkflow(workflow, 'start', {}, mockExecute)).rejects.toThrow('Custom error');
  });
});
