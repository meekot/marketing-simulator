import { useWorkflowStore } from '../../store/workflowStore';
import type { StepType } from '../../types';
import { Button } from '../Common';

const stepDefinitions: Array<{
  type: StepType;
  title: string;
  description: string;
  badge: string;
}> = [
  {
    type: 'start',
    title: 'Point de départ',
    description: 'Déclencheur initial du parcours marketing.',
    badge: 'Unique',
  },
  {
    type: 'sms',
    title: 'Envoi SMS',
    description: 'Envoyer un message personnalisé à vos contacts.',
    badge: 'Canal direct',
  },
  {
    type: 'email',
    title: 'Email',
    description: 'Planifier un email avec personnalisation.',
    badge: 'Automation',
  },
  {
    type: 'custom',
    title: 'Action personnalisée',
    description: 'Déclencher un webhook ou une action métier.',
    badge: 'No-code',
  },
  {
    type: 'end',
    title: 'Fin de parcours',
    description: 'Clôture du scénario marketing.',
    badge: 'Objectif',
  },
];

export const StepTypeSelector = ({ onClose }: { onClose: () => void }) => {
  const { addStep } = useWorkflowStore();

  const handleAddStep = (type: StepType) => {
    addStep({
      type,
      position: {
        x: Math.random() * 600 + 120,
        y: Math.random() * 400 + 120,
      },
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">
        Composez votre scénario avec les composants ci-dessous.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {stepDefinitions.map((definition) => {
          return (
            <article
              key={definition.type}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white">
                  {definition.title}
                </h4>
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-200">
                  {definition.badge}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {definition.description}
              </p>
              <Button
                className="mt-4"
                variant="secondary"
                onClick={() => handleAddStep(definition.type)}
                type="button"
              >
                {'Ajouter cette étape'}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default StepTypeSelector;
