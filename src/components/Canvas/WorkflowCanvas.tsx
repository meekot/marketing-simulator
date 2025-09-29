import { useCallback, useMemo } from 'react';
import type { Connection } from 'reactflow';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulation } from '../../hooks';
import { useWorkflowStore } from '../../store/workflowStore';
import type { Step } from '../../types';
import { Button } from '../Common';
import { ConnectionLine } from './ConnectionLine';
import { StepNode } from './StepNode';

const nodeTypes = { step: StepNode };
const edgeTypes = { connection: ConnectionLine };

const calculateEdgeLabel = (step: Step) => {
  const successCount = step.transitions.length;
  if (successCount === 0) {
    return 'isolé';
  }

  if (successCount === 1) {
    return 'flux linéaire';
  }

  return `${successCount} branches`;
};

const WorkflowCanvasInner = ({
  onOpenStepTypeModal,
}: {
  onOpenStepTypeModal: () => void;
}) => {
  const {
    workflow,
    selection,
    selectStep,
    selectTransition,
    clearSelection,
    addTransition,
    updateStep,
  } = useWorkflowStore();

  const { start } = useSimulation();

  const reactFlow = useReactFlow();

  const selectedStep = useMemo(() => {
    if (selection.type !== 'step' || !selection.id) {
      return undefined;
    }

    return workflow.steps.find((step) => step.id === selection.id);
  }, [workflow, selection]);

  const selectedTransition = useMemo(() => {
    if (selection.type !== 'transition' || !selection.id) {
      return undefined;
    }

    return workflow.transitions.find(
      (transition) => transition.id === selection.id
    );
  }, [workflow, selection]);

  const nodes = useMemo(
    () =>
      workflow.steps.map((step) => {
        return {
          id: step.id,
          type: 'step',
          position: step.position,
          data: {
            step,
            selectedStep,
            onSelect: selectStep,
            onStartSimulation: (stepId: string) => {
              start(workflow, stepId);
            },
          },
          draggable: true,
        };
      }),
    [selectStep, start, selectedStep, workflow]
  );

  const edges = useMemo(
    () =>
      workflow.transitions.map((transition) => ({
        id: transition.id,
        type: 'connection',
        source: transition.sourceStepId,
        target: transition.targetStepId,
        data: {
          condition: transition.condition,
        },
        animated: transition.condition === 'success',
        label: transition.condition,
      })),
    [workflow.transitions]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      addTransition({
        sourceStepId: connection.source,
        targetStepId: connection.target,
        condition: 'success',
      });
    },
    [addTransition]
  );

  const onNodeDrag = useCallback(
    (
      _event: unknown,
      node: { id: string; position: { x: number; y: number } }
    ) => {
      updateStep({
        id: node.id,
        changes: {
          position: node.position,
        },
      });
    },
    [updateStep]
  );

  const onEdgeClick = useCallback(
    (_event: unknown, edge: { id: string }) => {
      selectTransition(edge.id);
    },
    [selectTransition]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Canvas du workflow
            </h2>
            {selectedStep && (
              <p className="text-sm text-slate-300">
                {selectedStep.name} · {calculateEdgeLabel(selectedStep)}
              </p>
            )}
            {selectedTransition && (
              <p className="text-sm text-brand-200  text-white">
                Transition sélectionnée: {selectedTransition.id.slice(0, 6)}
              </p>
            )}
          </div>
          <Button variant="primary" onClick={onOpenStepTypeModal} type="button">
            + Add step
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() => reactFlow.fitView({ padding: 0.4 })}
          type="button"
        >
          Ajuster la vue
        </Button>
      </div>
      <div className="relative h-[600px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeDrag={onNodeDrag}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.4 }}
        >
          <Background color="#1e293b" gap={16} />
          <MiniMap pannable zoomable className="!bg-slate-950/90 !text-white" />
          <Controls className="!bg-slate-900/80 !text-white" />
        </ReactFlow>
      </div>
    </div>
  );
};

export const WorkflowCanvas = ({
  onOpenStepTypeModal,
}: {
  onOpenStepTypeModal: () => void;
}) => (
  <ReactFlowProvider>
    <WorkflowCanvasInner onOpenStepTypeModal={onOpenStepTypeModal} />
  </ReactFlowProvider>
);

export default WorkflowCanvas;
