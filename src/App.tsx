import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { WorkflowCanvas } from './components/Canvas/WorkflowCanvas';
import {
  Button,
  Modal,
  Tabs,
  TextAreaField,
  TextField,
} from './components/Common';
import { StepEditor } from './components/Editor/StepEditor';
import { StepTypeSelector } from './components/Editor/StepTypeSelector';
import { TransitionEditor } from './components/Editor/TransitionEditor';
import { ExecutionLog } from './components/Simulator/ExecutionLog';
import { useWorkflowStore } from './store/workflowStore';
import {
  exportWorkflowToJson,
  importWorkflowFromJson,
} from './utils/exportImport';

const App = () => {
  const { workflow, updateWorkflowMeta, setWorkflow, markSaved } =
    useWorkflowStore();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isStepTypeModalOpen, setIsStepTypeModalOpen] = useState(false);

  const handleExportFile = () => {
    const payload = exportWorkflowToJson(workflow, true);
    const anchor = document.createElement('a');
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    anchor.href = url;
    anchor.download = `${workflow.name.replace(/\s+/g, '_')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    try {
      const parsed = importWorkflowFromJson(content);
      setWorkflow(parsed.workflow);
      markSaved();
    } catch (error) {
      console.error("Impossible d'importer le workflow", error);
    }
  };

  const tabs = [
    {
      id: 'editors',
      label: 'Éditeurs',
      content: (
        <div className="space-y-6 p-4">
          <StepEditor />
          <TransitionEditor />
        </div>
      ),
    },
    {
      id: 'log',
      label: 'Journal',
      content: <ExecutionLog />,
    },
  ];

  return (
    <div className="lg:h-screen bg-slate-950/95 text-white flex flex-col overflow-y-auto">
      <main className="flex flex-col flex-1  px-6 py-6 gap-6 overflow-y-auto">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-card backdrop-blur flex-shrink-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-3">
              <TextField
                label="Nom de la campagne"
                value={workflow.name}
                onChange={(event) =>
                  updateWorkflowMeta({ name: event.target.value })
                }
              />
              <TextAreaField
                label="Description"
                value={workflow.description}
                onChange={(event) =>
                  updateWorkflowMeta({ description: event.target.value })
                }
              />
              <p className="text-xs text-slate-300">
                {workflow.version && `Version ${workflow.version} · `}
                {workflow.updatedAt &&
                  `Dernière mise à jour le ${new Date(workflow.updatedAt).toLocaleString()}`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
              <Button variant="ghost" onClick={handleExportFile} type="button">
                Exporter en JSON
              </Button>
              <Button variant="ghost" onClick={handleImportClick} type="button">
                Importer un JSON
              </Button>
            </div>
          </div>
        </header>
        <Modal
          open={isStepTypeModalOpen}
          title="Ajouter une étape"
          onClose={() => setIsStepTypeModalOpen(false)}
        >
          <StepTypeSelector
            onClose={() => {
              setIsStepTypeModalOpen(false);
            }}
          />
        </Modal>

        <section className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          <div className="flex-1  rounded-3xl border border-white/10 bg-white/10 p-6 shadow-card backdrop-blur">
            <WorkflowCanvas
              onOpenStepTypeModal={() => setIsStepTypeModalOpen(true)}
            />
          </div>
          <div className="w-96 rounded-3xl border border-white/10 bg-white/10 shadow-card backdrop-blur overflow-hidden">
            <Tabs tabs={tabs} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
