import type { ExperimentMode } from "../domain/experiment";

interface ExperimentTabsProps {
  mode: ExperimentMode;
  onChange: (mode: ExperimentMode) => void;
}

const tabs: { mode: ExperimentMode; label: string }[] = [
  { mode: "effort-distance", label: "实验一：改变手的远近" },
  { mode: "load-distance", label: "实验二：改变石头远近" },
  { mode: "fulcrum-distance", label: "实验三：改变支点远近" },
  { mode: "lever-ruler", label: "实验四：操作杠杆尺" },
];

export function ExperimentTabs({ mode, onChange }: ExperimentTabsProps) {
  return (
    <div className="experiment-tabs" role="tablist" aria-label="选择实验">
      {tabs.map((tab) => {
        const isActive = tab.mode === mode;
        return (
          <button
            key={tab.mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`experiment-tab${isActive ? " is-active" : ""}`}
            onClick={() => onChange(tab.mode)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
