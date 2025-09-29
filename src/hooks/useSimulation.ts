import { useCallback, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import type { Workflow } from '../types';
import { simulateWorkflow } from '../utils/simulationEngine';

export const useSimulation = () => {
  const {
    status,
    stepStarted,
    appendLog,
    startSimulation,
    stepCompleted,
    stepFailed,
    resetSimulation,
    clearLog,
    completeSimulation,
    failSimulation,
  } = useSimulationStore();

  const runningPromiseRef = useRef<Promise<void> | null>(null);

  const start = useCallback(
    async (workflow: Workflow, startStepId: string) => {
      if (status === 'running') {
        return;
      }

      startSimulation({ workflowId: workflow.id });

      const promise = simulateWorkflow(workflow, startStepId, {
        onStart: () => {
          appendLog({
            level: 'info',
            message: 'Simulation démarrée',
            details: { startStepId },
          });
        },
        onStepStart: ({ id: stepId, name: stepName }) => {
          stepStarted(stepId);
          appendLog({
            level: 'info',
            message: `Début de l'étape ${stepName}`,
            stepId,
          });
        },
        onStepComplete: ({ id: stepId }, status) => {
          stepCompleted({ stepId });
          appendLog({
            level: status === 'success' ? 'success' : 'error',
            message: 'Étape terminée',
            stepId,
          });
        },
        onStepFailure: (stepId, message) => {
          stepFailed({ stepId, error: message });
          appendLog({
            level: 'error',
            message,
            stepId,
          });
        },
        onTransition: (
          { id: sourceStepId },
          { id: targetStepId },
          condition
        ) => {
          appendLog({
            level: 'info',
            message: 'Transition évaluée',
            stepId: sourceStepId,
            details: {
              cible: targetStepId,
              condition: condition,
            },
          });
        },
      });

      runningPromiseRef.current = promise;
      try {
        await promise;
        completeSimulation({
          result: {
            success: true,
            completedSteps: [],
            failedSteps: [],
            iterations: 0,
          },
          finishedAt: new Date().toISOString(),
        });
      } catch {
        failSimulation({ message: 'Failed' });
      }

      runningPromiseRef.current = null;
    },
    [status, startSimulation, appendLog, stepStarted, stepCompleted, stepFailed, completeSimulation, failSimulation]
  );

  const reset = useCallback(() => {
    resetSimulation();
    clearLog();
  }, [resetSimulation, clearLog]);

  return {
    start,
    reset,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isIdle: status === 'idle',
    runningPromiseRef,
  };
};
