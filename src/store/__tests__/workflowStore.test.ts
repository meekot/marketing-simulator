import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowStore } from '../workflowStore';
import type { Position, Workflow } from '../../types';

// Mock nanoid for consistent IDs in tests
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id'),
}));

describe('workflowStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useWorkflowStore.getState().setWorkflow({
      id: 'initial',
      name: 'Initial Workflow',
      description: 'Initial description',
      steps: [],
      transitions: [],
    });
  });

  describe('initial state', () => {
    it('has initial workflow with default structure', () => {
      const { workflow, selection, isDirty } = useWorkflowStore.getState();

      expect(workflow.id).toBe('initial');
      expect(workflow.name).toBe('Initial Workflow');
      expect(workflow.steps).toEqual([]);
      expect(workflow.transitions).toEqual([]);
      expect(selection).toEqual({ type: null, id: null });
      expect(isDirty).toBe(false);
    });
  });

  describe('setWorkflow', () => {
    it('sets workflow and clears selection and dirty state', () => {
      const newWorkflow: Workflow = {
        id: 'new-workflow',
        name: 'New Workflow',
        description: 'New description',
        steps: [],
        transitions: [],
      };

      useWorkflowStore.getState().setWorkflow(newWorkflow);

      const state = useWorkflowStore.getState();
      expect(state.workflow).toEqual(newWorkflow);
      expect(state.selection).toEqual({ type: null, id: null });
      expect(state.isDirty).toBe(false);
    });
  });

  describe('updateWorkflowMeta', () => {
    it('updates workflow name and description and marks as dirty', () => {
      useWorkflowStore.getState().updateWorkflowMeta({
        name: 'Updated Name',
        description: 'Updated Description',
      });

      const { workflow, isDirty } = useWorkflowStore.getState();
      expect(workflow.name).toBe('Updated Name');
      expect(workflow.description).toBe('Updated Description');
      expect(isDirty).toBe(true);
    });

    it('updates only provided fields', () => {
      useWorkflowStore.getState().updateWorkflowMeta({
        name: 'Updated Name',
      });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow.name).toBe('Updated Name');
      expect(workflow.description).toBe('Initial description');
    });
  });

  describe('addStep', () => {
    it('adds step with provided parameters and selects it', () => {
      const position: Position = { x: 100, y: 200 };
      useWorkflowStore.getState().addStep({
        type: 'email',
        name: 'Test Email Step',
        position,
      });

      const { workflow, selection, isDirty } = useWorkflowStore.getState();
      expect(workflow.steps).toHaveLength(1);
      expect(workflow.steps[0]).toEqual({
        id: 'test-id',
        type: 'email',
        name: 'Test Email Step',
        position,
        transitions: [],
      });
      expect(selection).toEqual({ type: 'step', id: 'test-id' });
      expect(isDirty).toBe(true);
    });

    it('adds step with default name and position', () => {
      useWorkflowStore.getState().addStep({
        type: 'email',
      });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow.steps[0]).toEqual({
        id: 'test-id',
        type: 'email',
        name: 'EMAIL-test', // Should be uppercase type prefix + first 4 chars of id
        position: { x: 0, y: 0 },
        transitions: [],
      });
    });
  });

  describe('updateStep', () => {
    beforeEach(() => {
      useWorkflowStore.getState().addStep({
        type: 'email',
        name: 'Original Name',
        position: { x: 0, y: 0 },
      });
    });

    it('updates step properties and marks as dirty', () => {
      useWorkflowStore.getState().updateStep({
        id: 'test-id',
        changes: {
          name: 'Updated Name',
          position: { x: 100, y: 200 },
        },
      });

      const { workflow, isDirty } = useWorkflowStore.getState();
      const step = workflow.steps[0];
      expect(step.name).toBe('Updated Name');
      expect(step.position).toEqual({ x: 100, y: 200 });
      expect(isDirty).toBe(true);
    });

    it('updates transitions array', () => {
      useWorkflowStore.getState().updateStep({
        id: 'test-id',
        changes: {
          transitions: ['trans1', 'trans2'],
        },
      });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow.steps[0].transitions).toEqual(['trans1', 'trans2']);
    });
  });

  describe('removeStep', () => {
    beforeEach(() => {
      // Set up a workflow with steps and transitions
      useWorkflowStore.setState({
        workflow: {
          id: 'test',
          name: 'Test',
          description: 'Test',
          steps: [
            { id: 'start', type: 'start', name: 'Start', position: { x: 0, y: 0 }, transitions: ['t1'] },
            { id: 'email', type: 'email', name: 'Email', position: { x: 100, y: 0 }, transitions: ['t2'] },
            { id: 'end', type: 'end', name: 'End', position: { x: 200, y: 0 }, transitions: [] },
          ],
          transitions: [
            { id: 't1', sourceStepId: 'start', targetStepId: 'email', condition: 'success' },
            { id: 't2', sourceStepId: 'email', targetStepId: 'end', condition: 'success' },
          ],
        },
        selection: { type: 'step', id: 'email' },
        isDirty: false,
      });
    });

    it('removes step and related transitions and clears selection if selected', () => {
      useWorkflowStore.getState().removeStep('email');

      const { workflow, selection, isDirty } = useWorkflowStore.getState();
      expect(workflow.steps).toHaveLength(2);
      expect(workflow.steps.map(s => s.id)).toEqual(['start', 'end']);
      expect(workflow.transitions).toHaveLength(0);
      expect(selection).toEqual({ type: null, id: null });
      expect(isDirty).toBe(true);
    });
  });

  describe('addTransition', () => {
    beforeEach(() => {
      // Set up workflow with steps
      useWorkflowStore.setState({
        workflow: {
          id: 'test',
          name: 'Test',
          description: 'Test',
          steps: [
            { id: 's1', type: 'start', name: 'Start', position: { x: 0, y: 0 }, transitions: [] },
            { id: 's2', type: 'end', name: 'End', position: { x: 100, y: 0 }, transitions: [] },
          ],
          transitions: [],
        },
        selection: { type: null, id: null },
        isDirty: false,
      });
    });

    it('adds transition and links to source step and selects it', () => {
      useWorkflowStore.getState().addTransition({
        sourceStepId: 's1',
        targetStepId: 's2',
        condition: 'success',
      });

      const { workflow, selection, isDirty } = useWorkflowStore.getState();
      expect(workflow.transitions).toHaveLength(1);
      expect(workflow.transitions[0]).toEqual({
        id: 'test-id',
        sourceStepId: 's1',
        targetStepId: 's2',
        condition: 'success',
      });
      expect(workflow.steps[0].transitions).toEqual(['test-id']);
      expect(selection).toEqual({ type: 'transition', id: 'test-id' });
      expect(isDirty).toBe(true);
    });

    it('does not add duplicate transitions', () => {
      useWorkflowStore.getState().addTransition({
        sourceStepId: 's1',
        targetStepId: 's2',
        condition: 'success',
      });

      // Try to add the same transition again
      useWorkflowStore.getState().addTransition({
        sourceStepId: 's1',
        targetStepId: 's2',
        condition: 'success',
      });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow.transitions).toHaveLength(1);
    });

    it('ignores transitions from step to itself', () => {
      useWorkflowStore.getState().addTransition({
        sourceStepId: 's1',
        targetStepId: 's1',
        condition: 'success',
      });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow.transitions).toHaveLength(0);
    });

    it('ignores transitions with invalid steps', () => {
      useWorkflowStore.getState().addTransition({
        sourceStepId: 's1',
        targetStepId: 'invalid',
        condition: 'success',
      });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow.transitions).toHaveLength(0);
    });
  });

  describe('updateTransition', () => {
    beforeEach(() => {
      useWorkflowStore.setState({
        workflow: {
          id: 'test',
          name: 'Test',
          description: 'Test',
          steps: [
            { id: 's1', type: 'start', name: 'Start', position: { x: 0, y: 0 }, transitions: ['t1'] },
            { id: 's2', type: 'end', name: 'End', position: { x: 100, y: 0 }, transitions: [] },
          ],
          transitions: [
            { id: 't1', sourceStepId: 's1', targetStepId: 's2', condition: 'success' },
          ],
        },
        selection: { type: null, id: null },
        isDirty: false,
      });
    });

    it('updates transition and marks as dirty', () => {
      useWorkflowStore.getState().updateTransition({
        id: 't1',
        changes: {
          condition: 'failure',
        },
      });

      const { workflow, isDirty } = useWorkflowStore.getState();
      expect(workflow.transitions[0].condition).toBe('failure');
      expect(isDirty).toBe(true);
    });
  });

  describe('removeTransition', () => {
    beforeEach(() => {
      useWorkflowStore.setState({
        workflow: {
          id: 'test',
          name: 'Test',
          description: 'Test',
          steps: [
            { id: 's1', type: 'start', name: 'Start', position: { x: 0, y: 0 }, transitions: ['t1'] },
            { id: 's2', type: 'end', name: 'End', position: { x: 100, y: 0 }, transitions: [] },
          ],
          transitions: [
            { id: 't1', sourceStepId: 's1', targetStepId: 's2', condition: 'success' },
          ],
        },
        selection: { type: 'transition', id: 't1' },
        isDirty: false,
      });
    });

    it('removes transition and unlinks from source step and clears selection if selected', () => {
      useWorkflowStore.getState().removeTransition('t1');

      const { workflow, selection, isDirty } = useWorkflowStore.getState();
      expect(workflow.transitions).toHaveLength(0);
      expect(workflow.steps[0].transitions).toEqual([]);
      expect(selection).toEqual({ type: null, id: null });
      expect(isDirty).toBe(true);
    });

    it('ignores non-existent transitions', () => {
      useWorkflowStore.getState().removeTransition('nonexistent');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow.transitions).toHaveLength(1);
    });
  });

  describe('selection management', () => {
    it('selectStep sets step selection', () => {
      useWorkflowStore.getState().selectStep('step-id');

      const { selection } = useWorkflowStore.getState();
      expect(selection).toEqual({ type: 'step', id: 'step-id' });
    });

    it('selectTransition sets transition selection', () => {
      useWorkflowStore.getState().selectTransition('transition-id');

      const { selection } = useWorkflowStore.getState();
      expect(selection).toEqual({ type: 'transition', id: 'transition-id' });
    });

    it('clearSelection clears selection', () => {
      useWorkflowStore.getState().selectStep('step-id');
      useWorkflowStore.getState().clearSelection();

      const { selection } = useWorkflowStore.getState();
      expect(selection).toEqual({ type: null, id: null });
    });
  });

  describe('markSaved', () => {
    it('clears dirty state', () => {
      useWorkflowStore.setState({ isDirty: true });
      useWorkflowStore.getState().markSaved();

      const { isDirty } = useWorkflowStore.getState();
      expect(isDirty).toBe(false);
    });
  });
});
