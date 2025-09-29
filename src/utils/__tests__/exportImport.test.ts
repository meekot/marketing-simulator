import { describe, it, expect } from 'vitest';
import {
  exportWorkflowToJson,
  importWorkflowFromJson,
  cloneWorkflow,
} from '../exportImport';
import type { Workflow } from '../../types';

const sampleWorkflow: Workflow = {
  id: 'wf1',
  name: 'Test Workflow',
  description: 'A test workflow',
  steps: [
    {
      id: 'step1',
      type: 'start',
      name: 'Start',
      position: { x: 0, y: 0 },
      transitions: ['trans1'],
    },
    {
      id: 'step2',
      type: 'end',
      name: 'End',
      position: { x: 100, y: 100 },
      transitions: [],
    },
  ],
  transitions: [
    {
      id: 'trans1',
      sourceStepId: 'step1',
      targetStepId: 'step2',
      condition: 'success',
    },
  ],
};

describe('exportWorkflowToJson', () => {
  it('exports workflow to JSON string with default pretty printing', () => {
    const result = exportWorkflowToJson(sampleWorkflow);
    expect(typeof result).toBe('string');

    const parsed = JSON.parse(result);
    expect(parsed.workflow).toEqual(sampleWorkflow);
    expect(parsed.lastUpdated).toBeDefined();
  });

  it('exports workflow to pretty-printed JSON when pretty is true', () => {
    const result = exportWorkflowToJson(sampleWorkflow, true);
    expect(typeof result).toBe('string');

    const parsed = JSON.parse(result);
    expect(parsed.workflow).toEqual(sampleWorkflow);
    expect(result).toContain('\n'); // Check for newlines in pretty print
  });

  it('exports workflow to compact JSON when pretty is false', () => {
    const result = exportWorkflowToJson(sampleWorkflow, false);
    expect(typeof result).toBe('string');

    const parsed = JSON.parse(result);
    expect(parsed.workflow).toEqual(sampleWorkflow);
    // Compact JSON shouldn't have newlines between top-level properties
    expect(result.split('\n').length).toBe(1);
  });
});

describe('importWorkflowFromJson', () => {
  it('imports valid workflow JSON', () => {
    const json = exportWorkflowToJson(sampleWorkflow);
    const result = importWorkflowFromJson(json);
    expect(result.workflow).toEqual(sampleWorkflow);
    expect(result.lastUpdated).toBeDefined();
  });

  it('throws on invalid JSON', () => {
    const invalidJson = '{invalid json}';
    expect(() => importWorkflowFromJson(invalidJson)).toThrow();
  });

  it('throws on invalid schema', () => {
    const invalidJson = JSON.stringify({
      workflow: {
        id: 'invalid',
        name: '',
        description: 'test',
        steps: [],
        transitions: [],
      },
      lastUpdated: '2023-01-01T00:00:00.000Z',
    });
    expect(() => importWorkflowFromJson(invalidJson)).toThrow();
  });

  it('throws when transitions array contains invalid data', () => {
    const invalidJson = JSON.stringify({
      workflow: { ...sampleWorkflow, transitions: [{ invalid: 'data' }] },
      lastUpdated: '2023-01-01T00:00:00.000Z',
    });
    expect(() => importWorkflowFromJson(invalidJson)).toThrow();
  });
});

describe('cloneWorkflow', () => {
  it('clones workflow deeply', () => {
    const cloned = cloneWorkflow(sampleWorkflow);
    expect(cloned).toEqual(sampleWorkflow);
    expect(cloned).not.toBe(sampleWorkflow); // Different reference

    // Modify nested properties to test deep clone
    if (cloned.steps[0]) {
      cloned.steps[0].position.x = 999;
      expect(sampleWorkflow.steps[0].position.x).not.toBe(999);
    }
  });

  it('handles empty workflow', () => {
    const emptyWorkflow: Workflow = {
      id: 'empty',
      name: 'Empty Workflow',
      description: '',
      steps: [],
      transitions: [],
    };
    const cloned = cloneWorkflow(emptyWorkflow);
    expect(cloned).toEqual(emptyWorkflow);
    expect(cloned).not.toBe(emptyWorkflow);
  });
});
