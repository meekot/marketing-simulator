import { useMemo } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Button } from '../Common';

export const TransitionEditor = () => {
  const { workflow, selection, updateTransition, removeTransition } =
    useWorkflowStore();

  const selectedTransition = useMemo(() => {
    if (selection.type !== 'transition' || !selection.id) {
      return undefined;
    }

    return workflow.transitions.find(
      (transition) => transition.id === selection.id
    );
  }, [workflow, selection]);

  const metadata = useMemo(() => {
    if (!selectedTransition) {
      return null;
    }

    const source = workflow.steps.find(
      (step) => step.id === selectedTransition.sourceStepId
    );
    const target = workflow.steps.find(
      (step) => step.id === selectedTransition.targetStepId
    );

    return {
      sourceName: source?.name ?? selectedTransition.sourceStepId,
      targetName: target?.name ?? selectedTransition.targetStepId,
    };
  }, [selectedTransition, workflow.steps]);

  if (!selectedTransition || !metadata) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <h3 className="text-lg font-semibold  text-white">Transition</h3>
        <p className="mt-2 text-sm text-slate-300">
          Sélectionnez un lien entre deux étapes pour modifier ses conditions.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold  text-white">
            Transition sélectionnée
          </h3>
          <p className="text-sm text-slate-300">
            {metadata.sourceName} → {metadata.targetName}
          </p>
        </div>
        <Button
          variant="danger"
          onClick={() => removeTransition(selectedTransition.id)}
          type="button"
        >
          Supprimer la transition
        </Button>
      </header>
      <div className="mt-4 space-y-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              updateTransition({
                id: selectedTransition.id,
                changes: { condition: 'success' },
              })
            }
            className={`flex-1 rounded-xl border px-4 py-2 text-sm transition ${selectedTransition.condition === 'success' ? 'border-brand-400 bg-brand-500/20 text-brand-100' : 'border-white/20 bg-white/5 text-slate-200'}`}
          >
            Succès
          </button>
          <button
            type="button"
            onClick={() =>
              updateTransition({
                id: selectedTransition.id,
                changes: { condition: 'failure' },
              })
            }
            className={`flex-1 rounded-xl border px-4 py-2 text-sm transition ${selectedTransition.condition === 'failure' ? 'border-orange-400 bg-orange-500/20 text-orange-100' : 'border-white/20 bg-white/5 text-slate-200'}`}
          >
            Échec
          </button>
        </div>
      </div>
    </section>
  );
};

export default TransitionEditor;
