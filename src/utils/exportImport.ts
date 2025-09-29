import { z } from 'zod';
import type {
  Step,
  Transition,
  Workflow,
  WorkflowPersistencePayload,
} from '../types';

const stepSchema: z.ZodType<Step> = z.object({
  id: z.string(),
  type: z.enum(['start', 'sms', 'email', 'custom', 'end']),
  name: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  transitions: z.array(z.string()),
});

const transitionSchema: z.ZodType<Transition> = z.object({
  id: z.string(),
  sourceStepId: z.string(),
  targetStepId: z.string(),
  condition: z.enum(['success', 'failure']),
});

const workflowSchema: z.ZodType<Workflow> = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  steps: z.array(stepSchema),
  transitions: z.array(transitionSchema),
});

const persistenceSchema: z.ZodType<WorkflowPersistencePayload> = z.object({
  workflow: workflowSchema,
  lastUpdated: z.string(),
});

export const exportWorkflowToJson = (
  workflow: Workflow,
  pretty = true
): string => {
  const payload: WorkflowPersistencePayload = {
    workflow,
    lastUpdated: new Date().toISOString(),
  };

  return JSON.stringify(payload, null, pretty ? 2 : undefined);
};

export const parseWorkflow = (payload: unknown) => {
  const result = persistenceSchema.safeParse(payload);

  if (!result.success) {
    throw new Error(`Workflow invalide: ${result.error.message}`);
  }

  return result.data;
}

export const importWorkflowFromJson = (
  json: string
): WorkflowPersistencePayload => {
  const parsed = JSON.parse(json);
  return parseWorkflow(parsed);
};

export const cloneWorkflow = (workflow: Workflow): Workflow =>
  JSON.parse(JSON.stringify(workflow));
