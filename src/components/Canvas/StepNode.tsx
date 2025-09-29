import classNames from 'classnames';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import type { Step } from '../../types';
import { Button } from '../Common';

export interface StepNodeData {
  step: Step;
  selectedStep?: Step;
  onSelect?: (stepId: string) => void;
  onStartSimulation?: (stepId: string) => void;
}

export const StepNode = ({ data }: NodeProps<StepNodeData>) => {
  const { step, onSelect, onStartSimulation, selectedStep } = data;

  return (
    <div
      className={classNames(
        'group min-w-[180px] rounded-2xl border bg-white/90 px-4 py-3 shadow-card backdrop-blur transition hover:shadow-xl border-slate-200',
        selectedStep?.id === step.id && 'ring-2 ring-brand-400'
      )}
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {step.type}
        </span>
        <span className="text-xs font-medium text-slate-400">
          #{step.id.slice(0, 4)}
        </span>
      </div>
      <h4 className="mt-1 text-base font-semibold text-slate-800">
        {step.name}
      </h4>
      {step.type !== 'start' && (
        <Handle
          className="!bg-brand-400"
          position={Position.Left}
          type="target"
        />
      )}
      {step.type !== 'end' && (
        <Handle
          className="!bg-brand-400"
          position={Position.Right}
          type="source"
        />
      )}
      <div className="flex">
        {step.type === 'start' && (
          <Button onClick={() => onStartSimulation?.(step.id)}>Test</Button>
        )}
        <Button className="ml-auto" onClick={() => onSelect?.(step.id)}>
          Select
        </Button>
      </div>
    </div>
  );
};

export default StepNode;
