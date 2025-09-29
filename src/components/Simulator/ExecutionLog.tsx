import { useMemo } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

const levelStyles: Record<string, string> = {
  info: 'text-black border-slate-200 bg-white',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

export const ExecutionLog = () => {
  const { log } = useSimulationStore();

  const errorCount = useMemo(
    () => log.filter((entry) => entry.level === 'error').length,
    [log]
  );

  const warningCount = useMemo(
    () => log.filter((entry) => entry.level === 'warning').length,
    [log]
  );

  return (
    <section className=" p-6 text-white flex flex-col overflow-y-auto">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Journal d'exécution
          </h3>
          <p className="text-sm text-slate-300">
            Suivez les événements générés pendant la simulation.
          </p>
        </div>
        <div className="flex gap-2 text-xs text-slate-300">
          <span>⚠️ {warningCount}</span>
          <span>⛔ {errorCount}</span>
        </div>
      </header>
      <div className="mt-4 h-full space-y-3 overflow-y-auto pr-2 text-sm">
        {log.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-300">
            Le journal est vide. Lancez une simulation pour générer des
            événements.
          </p>
        )}
        {log.map((entry) => (
          <article
            key={entry.id}
            className={`rounded-2xl border px-4 py-3 shadow-sm ${levelStyles[entry.level] ?? levelStyles.info}`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wide">
                {entry.level}
              </span>
              <time
                dateTime={entry.timestamp}
                className="text-xs text-slate-400"
              >
                {new Date(entry.timestamp).toLocaleTimeString()}
              </time>
            </div>
            <p className="mt-2 text-sm">{entry.message}</p>
            {(entry.stepId || entry.transitionId) && (
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                {entry.stepId && (
                  <div>
                    <dt className="font-medium text-slate-400">Étape</dt>
                    <dd>{entry.stepId}</dd>
                  </div>
                )}
                {entry.transitionId && (
                  <div>
                    <dt className="font-medium text-slate-400">Transition</dt>
                    <dd>{entry.transitionId}</dd>
                  </div>
                )}
              </dl>
            )}
            {entry.details && (
              <pre className="mt-3 overflow-x-auto rounded-xl bg-white/70 p-3 text-xs text-slate-700">
                {JSON.stringify(entry.details, null, 2)}
              </pre>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default ExecutionLog;
