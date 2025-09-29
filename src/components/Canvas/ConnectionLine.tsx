import type { EdgeProps } from 'reactflow';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

export interface ConnectionEdgeData {
  condition: 'success' | 'failure';
}

export const ConnectionLine = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  data,
}: EdgeProps<ConnectionEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const isSuccess = data?.condition === 'success';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isSuccess ? '#0ea5e9' : '#f97316',
          strokeWidth: selected ? 2.6 : 2,
          strokeDasharray: isSuccess ? '0' : '6 4',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow"
        >
          {data?.condition ?? ''}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ConnectionLine;
