import { useMemo } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { Button, TextField } from '../Common';

export const StepEditor = () => {
  const { workflow, selection, updateStep, removeStep } = useWorkflowStore();

  const selectedStep = useMemo(() => {
    if (selection.type !== 'step' || !selection.id) {
      return undefined;
    }

    return workflow.steps.find((step) => step.id === selection.id);
  }, [workflow, selection]);

  const fields = useMemo(() => {
    if (!selectedStep) {
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
          <TextField
            label="Nom de l'étape"
            value={selectedStep.name}
            onChange={(event) =>
              updateStep({
                id: selectedStep.id,
                changes: { name: event.target.value },
              })
            }
          />
        </div>
      </div>
    );
  }, [selectedStep, updateStep]);

  if (!selectedStep) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <h3 className="text-lg font-semibold text-white">
          Aucune étape sélectionnée
        </h3>
        <p className="mt-2 text-sm text-slate-300">
          Sélectionnez un nœud sur le canvas pour modifier ses propriétés.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Configuration · {selectedStep.name}
          </h3>
          <p className="text-sm text-slate-300">Type: {selectedStep.type}</p>
        </div>
        <Button
          variant="danger"
          onClick={() => removeStep(selectedStep.id)}
          type="button"
        >
          Supprimer l'étape
        </Button>
      </header>
      <div className="mt-4 space-y-6">{fields}</div>
    </section>
  );
};

export default StepEditor;
