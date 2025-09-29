import { useState } from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultActiveTab?: string;
}

export const Tabs = ({ tabs, defaultActiveTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={classNames(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
