import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type {
  Position,
  Step,
  StepType,
  Transition,
  Workflow,
  WorkflowSelection,
} from '../types';

interface WorkflowState {
  workflow: Workflow;
  selection: WorkflowSelection;
  isDirty: boolean;
}

import initialWorkflow from '../../example.json'
import { importWorkflowFromJson, parseWorkflow } from '../utils/exportImport';

const createStep = (type: StepType, overrides: Partial<Step> = {}): Step => {
  const id = overrides.id ?? nanoid();

  return {
    id,
    type,
    name: overrides.name ?? `${type.toUpperCase()}-${id.slice(0, 4)}`,
    position: overrides.position ?? { x: 0, y: 0 },
    transitions: overrides.transitions ?? [],
  };
};

const createInitialWorkflow = (): Workflow => {
  const start = createStep('start', {
    name: 'Start',
    position: { x: 120, y: 200 },
  });

  const end = createStep('end', {
    name: 'End',
    position: { x: 640, y: 200 },
  });

  const transitionId = nanoid();
  const transition: Transition = {
    id: transitionId,
    sourceStepId: start.id,
    targetStepId: end.id,
    condition: 'success',
  };

  start.transitions.push(transitionId);

  return {
    id: nanoid(),
    name: 'Nouvelle campagne',
    description: 'Workflow marketing initial',
    steps: [start, end],
    transitions: [transition],
  };
};


// Initial states
const initialWorkflowState: WorkflowState = {
  workflow: parseWorkflow(initialWorkflow).workflow,
  selection: { type: null, id: null },
  isDirty: false,
};

interface WorkflowStore extends WorkflowState {
  // Workflow actions
  setWorkflow: (workflow: Workflow) => void;
  updateWorkflowMeta: (changes: {
    name?: string;
    description?: string;
  }) => void;
  addStep: (payload: {
    type: StepType;
    name?: string;
    position?: Position;
  }) => void;
  updateStep: (payload: {
    id: string;
    changes: Partial<Omit<Step, 'id' | 'transitions'>> & {
      transitions?: string[];
    };
  }) => void;
  removeStep: (stepId: string) => void;
  addTransition: (payload: {
    sourceStepId: string;
    targetStepId: string;
    condition: Transition['condition'];
  }) => void;
  updateTransition: (payload: {
    id: string;
    changes: Partial<Omit<Transition, 'id'>>;
  }) => void;
  removeTransition: (transitionId: string) => void;
  selectStep: (stepId: string) => void;
  selectTransition: (transitionId: string) => void;
  clearSelection: () => void;
  markSaved: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  ...initialWorkflowState,

  // Workflow actions
  setWorkflow: (workflow) =>
    set(() => ({
      workflow,
      selection: { type: null, id: null },
      isDirty: false,
    })),

  updateWorkflowMeta: (changes) =>
    set((state) => ({
      workflow: {
        ...state.workflow,
        ...changes,
      },
      isDirty: true,
    })),

  addStep: (payload) =>
    set((state) => {
      const { type, name, position } = payload;
      const step = createStep(type, { name, position });
      return {
        workflow: {
          ...state.workflow,
          steps: [...state.workflow.steps, step],
        },
        selection: { type: 'step', id: step.id },
        isDirty: true,
      };
    }),

  updateStep: (payload) =>
    set((state) => {
      const { id, changes } = payload;
      return {
        workflow: {
          ...state.workflow,
          steps: state.workflow.steps.map((step) =>
            step.id === id ? { ...step, ...changes } : step
          ),
        },
        isDirty: true,
      };
    }),

  removeStep: (stepId) =>
    set((state) => {
      const newSelection =
        state.selection.id === stepId
          ? { type: null, id: null }
          : state.selection;

      return {
        workflow: {
          ...state.workflow,
          steps: state.workflow.steps.filter((step) => step.id !== stepId),
          transitions: state.workflow.transitions.filter(
            (transition) =>
              transition.sourceStepId !== stepId &&
              transition.targetStepId !== stepId
          ),
        },
        selection: newSelection,
        isDirty: true,
      };
    }),

  addTransition: (payload) =>
    set((state) => {
      const { sourceStepId, targetStepId, condition } = payload;

      if (sourceStepId === targetStepId) return state;

      const sourceStep = state.workflow.steps.find(
        (step) => step.id === sourceStepId
      );
      const targetStep = state.workflow.steps.find(
        (step) => step.id === targetStepId
      );

      if (!sourceStep || !targetStep) return state;

      const alreadyExists = state.workflow.transitions.some(
        (transition) =>
          transition.sourceStepId === sourceStepId &&
          transition.targetStepId === targetStepId &&
          transition.condition === condition
      );

      if (alreadyExists) return state;

      const transition: Transition = {
        id: nanoid(),
        sourceStepId,
        targetStepId,
        condition,
      };

      return {
        workflow: {
          ...state.workflow,
          steps: state.workflow.steps.map((step) =>
            step.id === sourceStepId
              ? { ...step, transitions: [...step.transitions, transition.id] }
              : step
          ),
          transitions: [...state.workflow.transitions, transition],
        },
        selection: { type: 'transition', id: transition.id },
        isDirty: true,
      };
    }),

  updateTransition: (payload) =>
    set((state) => {
      const { id, changes } = payload;
      return {
        workflow: {
          ...state.workflow,
          transitions: state.workflow.transitions.map((transition) =>
            transition.id === id ? { ...transition, ...changes } : transition
          ),
        },
        isDirty: true,
      };
    }),

  removeTransition: (transitionId) =>
    set((state) => {
      const transition = state.workflow.transitions.find(
        (t) => t.id === transitionId
      );
      if (!transition) return state;

      const newSelection =
        state.selection.id === transitionId
          ? { type: null, id: null }
          : state.selection;

      return {
        workflow: {
          ...state.workflow,
          steps: state.workflow.steps.map((step) =>
            step.id === transition.sourceStepId
              ? {
                  ...step,
                  transitions: step.transitions.filter(
                    (id) => id !== transitionId
                  ),
                }
              : step
          ),
          transitions: state.workflow.transitions.filter(
            (t) => t.id !== transitionId
          ),
        },
        selection: newSelection,
        isDirty: true,
      };
    }),

  selectStep: (stepId) =>
    set(() => ({
      selection: { type: 'step', id: stepId },
    })),

  selectTransition: (transitionId) =>
    set(() => ({
      selection: { type: 'transition', id: transitionId },
    })),

  clearSelection: () =>
    set(() => ({
      selection: { type: null, id: null },
    })),

  markSaved: () =>
    set(() => ({
      isDirty: false,
    })),
}));

export type { WorkflowStore };
