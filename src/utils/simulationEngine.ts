import type { Step, Transition, TransitionStatus, Workflow } from '../types';

type Outcome = TransitionStatus;
type ExecuteFn = (step: Step) => Promise<Outcome> | Outcome;

export interface SimulationCallbacks {
  onStart?: (workflow: Workflow, startStep: Step) => void;
  onStepStart?: (step: Step, processedStepsCount: number) => void;
  onStepComplete?: (step: Step, outcome: TransitionStatus) => void;
  onStepFailure?: (stepId: string, message: string) => void;
  onTransition?: (from: Step, to: Step, condition: TransitionStatus) => void;
}

const DEFAULT_MAX_STEPS = 10000;

export const defaultExecute: ExecuteFn = (step) =>
  step.type === 'email'
    ? Math.random() < 0.5
      ? 'success'
      : 'failure'
    : 'success';

export class SimulationError extends Error {
  readonly step: Step;
  constructor(msg: string, step: Step) {
    super(msg);
    this.step = step;
  }
}

export async function simulateWorkflow(
  wf: Workflow,
  startStepId: string,
  callbacks: SimulationCallbacks = {},
  execute: ExecuteFn = defaultExecute,
  maxSteps = DEFAULT_MAX_STEPS
) {
  const stepsMap = new Map<string, Step>();
  wf.steps.forEach((s) => stepsMap.set(s.id, s));
  const transitionsBySourceStepId = new Map<string, Map<string, Transition>>();
  wf.transitions.forEach((t) => {
    const sourceStepId = t.sourceStepId;
    if (transitionsBySourceStepId.has(sourceStepId)) {
      const sourcesTransitions = transitionsBySourceStepId.get(sourceStepId);
      if (sourcesTransitions!.has(t.id)) {
        throw new Error('Circuit was detected');
      }
      sourcesTransitions!.set(t.id, t);
    } else {
      transitionsBySourceStepId.set(sourceStepId, new Map([[t.id, t]]));
    }
  });

  try {
    const startStep = stepsMap.get(startStepId);

    if (!startStep) {
      throw Error('Start step undefined');
    }

    const processedSteps = new Set();

    callbacks.onStart?.(wf, startStep);

    const processStep = async (step: Step): Promise<void> => {
      callbacks.onStepStart?.(step, processedSteps.size);
      processedSteps.add(step.id);

      if (processedSteps.size > maxSteps) {
        throw new SimulationError('Max steps exceeded', step);
      }

      if (step.type === 'end') {
        callbacks.onStepComplete?.(step, 'success');
        return;
      }

      const result = await execute(step);
      callbacks.onStepComplete?.(step, result);
      const transitions = transitionsBySourceStepId.get(step.id);

      const promisses = [] as Promise<void>[];

      for (const t of transitions?.values() || []) {
        if (t.condition !== result) {
          continue;
        }

        const targetStep = stepsMap.get(t.targetStepId);
        if (!targetStep) {
          throw new SimulationError(
            `Target step is undefined ${t.targetStepId}`,
            step
          );
        }

        const promise = processStep(targetStep);

        promisses.push(promise);
      }

      if (!promisses?.length) {
        throw new SimulationError(`Branch don't have end step`, step);
      }

      await Promise.all(promisses);
    };

    await processStep(startStep);
  } catch (error) {
    if (error instanceof SimulationError) {
      callbacks.onStepFailure?.(error.step.id, error.message);
    } else {
      throw error;
    }
  }
}
